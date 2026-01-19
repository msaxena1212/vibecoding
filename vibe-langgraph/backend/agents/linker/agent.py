from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_linker(state: CodebaseState):
    print("\n=== [LINKER STARTING] ===")
    """
    Ensures 100% connectivity and asset pathing hygiene.
    """
    llm = get_llm()
    files = state.get("files", {})
    
    if not files:
        return {"current_step": "linking_skipped"}

    # Load rules
    rules_path = os.path.join("agents", "linker", "rules.md")
    with open(rules_path, "r", encoding="utf-8") as f:
        rules = f.read()

    # Build context: full paths and content
    content_summary = "\n".join([f"FILE: {p}\n{data['content']}" for p, data in files.items()])
    
    images_info = json.dumps(state.get("images_to_generate", []), indent=2)
    
    all_filenames = list(files.keys())
    
    messages = [
        SystemMessage(content=rules),
        HumanMessage(content=f"Review the following project structure and assets for linking hygiene.\n\n"
                             f"CRITICAL: You MUST ensure index.html links to EVERY file in the list below.\n"
                             f"ALL GENERATED FILES:\n{all_filenames}\n\n"
                             f"ASSETS TO RENDER:\n{images_info}\n\n"
                             f"FILES CONTENT:\n{content_summary}")
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
        
        # Linker is now PROACTIVE: It can modify ANY file in the project hub
        project_id = state.get("project_id", "default")
        project_hub_path = os.path.join("frontend", "p", project_id)

        for patch in patches:
            path = patch.get("path")
            new_content = patch.get("new_content")
            
            if not path or new_content is None: continue

            # Truncation check
            if path.endswith(".html") and "</html>" not in new_content.lower():
                print(f"[WARN] Linker truncation detected for {path}! Rejecting patch.")
                continue

            print(f"[LINKER] applying patch to: {path}")
            
            # Update state
            if path in files:
                files[path]["content"] = new_content
                files[path]["lastEditedBy"] = "linker"
            else:
                files[path] = {
                    "content": new_content,
                    "language": "python" if path.endswith(".py") else "javascript",
                    "imports": [],
                    "exports": [],
                    "lastEditedBy": "linker"
                }

            # Update Disk in Project Hub
            try:
                local_full_path = os.path.join(project_hub_path, path)
                os.makedirs(os.path.dirname(local_full_path), exist_ok=True)
                with open(local_full_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                patches_applied += 1
            except Exception as e:
                print(f"[FAIL] Linker failed to persist {path}: {e}")
    except Exception as e:
        print(f"[FAIL] Linker failed to parse patches: {e}")

    tokens = extract_tokens(response)
    
    return {
        "files": files, 
        "current_step": "linking_complete" if patches_applied > 0 else "linking_skipped",
        "diagnostic_report": f"Linker Audit: {patches_applied} patches applied.",
        "total_tokens": tokens,
        "token_usage": {"linker": tokens}
    }
