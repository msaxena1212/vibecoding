from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_linker(state: CodebaseState):
    """
    Ensures 100% connectivity and asset pathing hygiene.
    """
    llm = get_llm()
    files = state.get("files", {})
    
    if not files:
        return {"current_step": "linking_skipped"}

    # Load rules
    rules_path = os.path.join("agents", "linker", "rules.md")
    with open(rules_path, "r") as f:
        rules = f.read()

    # Build context: full paths and content
    content_summary = "\n".join([f"FILE: {p}\n{data['content']}" for p, data in files.items()])
    
    images_info = json.dumps(state.get("images_to_generate", []), indent=2)
    
    messages = [
        SystemMessage(content=rules),
        HumanMessage(content=f"Review the following project structure and assets for linking hygiene:\n\nASSETS TO RENDER:\n{images_info}\n\nFILES:\n{content_summary}")
    ]
    
    # We use LLM to audit, but for now we trust the Generator. 
    # High-end linking would involve rewriting imports, but we'll stick to auditing.
    # Parse response
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
                print(f"🔗 Linker patching file: {path}")
                files[path]["content"] = new_content
                files[path]["lastEditedBy"] = "linker"
                patches_applied += 1
    except Exception as e:
        print(f"❌ Linker failed to parse patches: {e}")

    tokens = extract_tokens(response)
    
    return {
        "files": files, 
        "current_step": "linking_complete" if patches_applied > 0 else "linking_skipped",
        "diagnostic_report": f"Linker Audit: {patches_applied} patches applied.",
        "total_tokens": tokens,
        "token_usage": {"linker": tokens}
    }
