from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState
import json
import re

def run_seeker(state: CodebaseState):
    """
    Analyze user intent and identify which files are relevant for the modification.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    existing_files = state.get("files", {})
    
    if not existing_files:
        return {"current_step": "seeker_no_files"}

    file_list = list(existing_files.keys())
    
    system_prompt = """You are a Codebase Seeker. 
    Analyze the user's intent and the list of available files.
    Identify and return a JSON list of file paths that are likely relevant to the user's request for modification or reference.
    
    Output Format:
    ```json
    {
        "relevant_files": ["path/to/file1.js", "path/to/file2.css"]
    }
    ```
    """
    
    prompt = f"User Intent: {user_intent}\n\nAvailable Files:\n" + "\n".join(file_list)
    
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=prompt)
    ])
    
    content = response.content
    if isinstance(content, list):
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
        
    json_match = re.search(r"```(?:json)?\n(.*?)\n```", content, re.DOTALL)
    if json_match:
        content = json_match.group(1)
        
    try:
        data = json.loads(content)
        relevant_files = data.get("relevant_files", [])
        # Fallback to at least something if list is empty
        if not relevant_files and file_list:
            relevant_files = [file_list[0]]
            
        return {"plan": {"relevant_files": relevant_files}, "current_step": "seeker_complete"}
    except Exception as e:
        print(f"Seeker Error: {e}")
        return {"current_step": "seeker_error", "plan": {"relevant_files": file_list[:3]}}
