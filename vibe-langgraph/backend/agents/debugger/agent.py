from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState
import json
import re

def run_debugger(state: CodebaseState):
    """
    Debug and fix existing code based on user feedback or validation errors.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    existing_files = state.get("files", {})
    errors = state.get("errors", [])
    
    # Load prompt
    with open("backend/agents/debugger/prompt.md", "r") as f:
        system_prompt = f.read()
        
    # Build context for LLM using only relevant files (if we have a plan or errors pointing to files)
    # For now, let's include all files or use a heuristc. 
    # To be safe and since we want to avoid "generating everything again", let's pass all small codebase files
    # or rely on the LLM to know context.
    
    # Heuristic: if errors mention files, prioritize them.
    relevant_files_content = []
    
    # Make a string of all existing files (limited by token size ideally, but let's assume it fits for now)
    for path, data in existing_files.items():
        relevant_files_content.append(f"--- FILE: {path} ---\n{data.get('content', '')}")
    
    file_context = "\n".join(relevant_files_content)
    
    error_context = "\n".join(errors) if errors else "No automated errors found. See User Description."
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"""USER REPORT/BUG: {user_intent}

AUTOMATED ERRORS (if any):
{error_context}

CURRENT CODEBASE:
{file_context}
""")
    ]
    
    print("DEBUG: Invoke Debugger Agent...")
    response = llm.invoke(messages)
    content = response.content
    
    if isinstance(content, list):
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
        
    # Extract token usage
    tokens = response.usage_metadata.get("total_tokens", 0) if hasattr(response, "usage_metadata") else 0
    current_tokens = state.get("total_tokens", 0)
    
    # JSON extraction
    json_match = re.search(r"```(?:json)?\n(.*?)\n```", content, re.DOTALL)
    if json_match:
        content = json_match.group(1)
        
    try:
        data = json.loads(content)
        fixed_files = data.get("files", {})
        explanation = data.get("explanation", "Fixed bugs.")
        
        print(f"DEBUGGER FIXES: {explanation}")
        
        # Merge changes
        new_files = existing_files.copy()
        for path, new_content in fixed_files.items():
            if path in new_files:
                new_files[path]["content"] = new_content
                new_files[path]["lastEditedBy"] = "debugger"
            else:
                # Debugger created a new file? Possible if missing.
                new_files[path] = {
                    "content": new_content,
                    "language": "python" if path.endswith(".py") else "javascript",
                    "imports": [],
                    "exports": [],
                    "lastEditedBy": "debugger"
                }

        return {
            "files": new_files, 
            "current_step": "debugging_complete",
            "errors": [], # Clear errors after fix attempt
            "total_tokens": current_tokens + tokens
        }
        
    except Exception as e:
        print(f"Error parsing debugger response: {e}")
        return {
            "current_step": "debugging_error",
            "errors": [str(e)], 
            "total_tokens": current_tokens + tokens
        }
