from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_backend_architect(state: CodebaseState):
    """
    Architects and implements the backend layer.
    """
    llm = get_llm()
    files = state.get("files", {})
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    # Load prompt
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "prompt.md")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt = f.read()

    # Build context
    code_context = "\n".join([f"--- FILE: {path} ---\n{data['content']}" for path, data in files.items()])
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Intent: {user_intent}\n\nCURRENT CODE:\n{code_context}")
    ]
    
    response = await llm.ainvoke(messages)
    content = response.content
    
    patches_applied = 0
    try:
        data = parse_json_dict(content)
        patches = data.get("patches", [])
        for patch in patches:
            path = patch.get("path")
            new_content = patch.get("new_content")
            
            # For backend, we add NEW files usually
            files[path] = {
                "content": new_content,
                "language": "python" if path.endswith(".py") else "javascript",
                "lastEditedBy": "backend_architect",
                "imports": [],
                "exports": []
            }
            
            # Update Disk in Project Hub
            try:
                project_id = state.get("project_id")
                if project_id:
                    full_path = os.path.join("frontend", "p", project_id, path)
                    os.makedirs(os.path.dirname(full_path), exist_ok=True)
                    with open(full_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"[BACKEND ARCHITECT] Persisted change to: {path}")
            except Exception as e:
                print(f"[FAIL] Backend Architect failed to persist {path}: {e}")
                
            patches_applied += 1
    except Exception as e:
        print(f"[FAIL] Backend Architect failed to parse patches: {e}")

    tokens = extract_tokens(response)

    return {
        "files": files,
        "current_step": "backend_complete",
        "diagnostic_report": f"Backend Architect: Added/Updated {patches_applied} files.",
        "total_tokens": tokens,
        "token_usage": {"backend_architect": tokens}
    }
