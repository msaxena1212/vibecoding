from graph.state import CodebaseState
from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_llm
import json
import re

async def run_editor(state: CodebaseState):
    """
    Modify existing code based on user intent.
    """
    llm = get_llm()
    # ... previous lines ...
    user_intent = state.get("userIntent", "")
    existing_files = state.get("files", {})
    
    # Load prompt
    with open("agents/editor/prompt.md", "r") as f:
        system_prompt = f.read()
        
    # Build context for LLM
    file_context = "\n".join([f"--- FILE: {path} ---\n{data['content']}" for path, data in existing_files.items()])
    
    history = state.get("messages", [])
    diagnostic_report = state.get("diagnostic_report", "")
    
    prompt_intent = f"User Intent: {user_intent}\n\nCURRENT CODEBASE:\n{file_context}"
    if diagnostic_report:
        prompt_intent += f"\n\n🚨 SELF-DIAGNOSIS REPORT:\n{diagnostic_report}\n\nPlease fix the issues mentioned above while maintaining existing structure."

    messages = [
        SystemMessage(content=system_prompt)
    ] + history + [
        HumanMessage(content=prompt_intent)
    ]
    
    
    try:
        response = await llm.ainvoke(messages)
    except Exception as e:
        print(f"⚠️ Editor agent encountered an error: {e}")
        print("Skipping editor phase and returning files as-is...")
        # Return the files unchanged if editor fails
        return {
            "files": state.get("files", {}),
            "current_step": "editor_skipped",
            "total_tokens": 0,
            "token_usage": {"editor": 0}
        }
    content = response.content
    
    # Extract token usage
    tokens = response.usage_metadata.get("total_tokens", 0) if hasattr(response, "usage_metadata") else 0
    current_tokens = state.get("total_tokens", 0)
    
    # Simple JSON extraction
    json_match = re.search(r"```(?:json)?\n(.*?)\n```", content, re.DOTALL)
    if json_match:
        content = json_match.group(1)
    
    try:
        data = json.loads(content)
        modified_files = data.get("files", {})
        
        # Merge changes back into state
        new_files = existing_files.copy()
        for path, new_content in modified_files.items():
            if path in new_files:
                new_files[path]["content"] = new_content
                new_files[path]["lastEditedBy"] = "editor"
            else:
                # Handle new file creation during edit if requested
                new_files[path] = {
                    "content": new_content,
                    "language": "python" if path.endswith(".py") else "javascript",
                    "imports": [],
                    "exports": [],
                    "lastEditedBy": "editor"
                }
                
        reasoning_obj = data.get("reasoning", {})
        if isinstance(reasoning_obj, dict):
            reasoning_text = f"{reasoning_obj.get('change_scope', '')}\n\n{reasoning_obj.get('fidelity_check', '')}\n\n{reasoning_obj.get('integration_logic', '')}"
        else:
            reasoning_text = str(reasoning_obj)
            
        return {
            "files": new_files, 
            "current_step": "editing_complete", 
            "reasoning": reasoning_text,
            "total_tokens": tokens,
            "token_usage": {"editor": tokens}
        }
    except Exception as e:
        print(f"Error parsing editor response: {e}")
        return {"current_step": "editing_error", "errors": [str(e)], "total_tokens": current_tokens + tokens}
