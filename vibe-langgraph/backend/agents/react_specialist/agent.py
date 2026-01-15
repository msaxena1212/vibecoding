from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_react_specialist(state: CodebaseState):
    """
    Implements React/Next.js components.
    """
    llm = get_llm()
    files = state.get("files", {})
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    prompt_path = os.path.join("agents", "react_specialist", "prompt.md")
    with open(prompt_path, "r") as f:
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
            
            # Add or update file
            files[path] = {
                "content": new_content,
                "language": "typescript" if path.endswith(".tsx") or path.endswith(".ts") else "javascript",
                "lastEditedBy": "react_specialist",
                "imports": [],
                "exports": []
            }
            patches_applied += 1
    except Exception as e:
        print(f"❌ React Specialist failed to parse patches: {e}")

    tokens = extract_tokens(response)

    return {
        "files": files,
        "current_step": "react_implementation_complete",
        "total_tokens": tokens,
        "token_usage": {"react_specialist": tokens}
    }
