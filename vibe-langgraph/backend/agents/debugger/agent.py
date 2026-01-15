from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_debugger(state: CodebaseState):
    """
    Surgically fixes issues flagged by the Validator using a debugging specialist LLM.
    """
    llm = get_llm()
    files = state.get("files", {})
    diagnostic = state.get("diagnostic_report", "")
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    prompt_path = os.path.join("agents", "debugger", "prompt.md")
    with open(prompt_path, "r") as f:
        prompt = f.read()

    # Build context
    code_context = "\n".join([f"--- FILE: {path} ---\n{data['content']}" for path, data in files.items()])
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Intent: {user_intent}\n\nDIAGNOSTIC REPORT:\n{diagnostic}\n\nCURRENT CODE:\n{code_context}")
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
            if path in files:
                files[path]["content"] = new_content
                files[path]["lastEditedBy"] = "debugger"
                patches_applied += 1
    except Exception as e:
        print(f"❌ Debugger failed to parse patches: {e}")

    tokens = extract_tokens(response)

    return {
        "files": files,
        "current_step": "debugging_complete" if patches_applied > 0 else "debugging_failed",
        "diagnostic_report": f"Debugger: Applied {patches_applied} patches.",
        "total_tokens": tokens,
        "token_usage": {"debugger": tokens}
    }
