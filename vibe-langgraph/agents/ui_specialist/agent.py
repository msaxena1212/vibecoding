from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_ui_specialist(state: CodebaseState):
    """
    Polishes the UI and adds high-fidelity design elements.
    """
    llm = get_llm()
    files = state.get("files", {})
    user_intent = state.get("userIntent", "")
    design_tokens = state.get("design_tokens", {})
    
    # Load prompt
    prompt_path = os.path.join("agents", "ui_specialist", "prompt.md")
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt = f.read()

    # Build context
    code_context = "\n".join([f"--- FILE: {path} ---\n{data['content']}" for path, data in files.items()])
    tokens_json = json.dumps(design_tokens, indent=2)
    
    reasoning = state.get("reasoning", "")
    plan_summary = state.get("plan_summary", "")

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Intent: {user_intent}\nProject Context: {reasoning}\nTechnical Plan: {plan_summary}\n\nDESIGN TOKENS:\n{tokens_json}\n\nCURRENT CODE:\n{code_context}")
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
                files[path]["lastEditedBy"] = "ui_specialist"
                
                # Update Disk in Project Hub
                try:
                    project_id = state.get("project_id")
                    if project_id:
                        full_path = os.path.join("frontend", "p", project_id, path)
                        os.makedirs(os.path.dirname(full_path), exist_ok=True)
                        with open(full_path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"[UI SPECIALIST] Persisted change to: {path}")
                except Exception as e:
                    print(f"[FAIL] UI Specialist failed to persist {path}: {e}")
                
                patches_applied += 1
    except Exception as e:
        print(f"[FAIL] UI Specialist failed to parse patches: {e}")

    tokens = extract_tokens(response)

    return {
        "files": files,
        "current_step": "ui_polish_complete",
        "diagnostic_report": f"UI Specialist: Applied {patches_applied} visual patches.",
        "total_tokens": tokens,
        "token_usage": {"ui_specialist": tokens}
    }
