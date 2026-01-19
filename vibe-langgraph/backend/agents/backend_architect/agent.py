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
    prompt_path = os.path.join("agents", "backend_architect", "prompt.md")
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
