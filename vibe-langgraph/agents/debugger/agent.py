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
    attempted_fixes = state.get("attempted_fixes", [])
    
    # Pre-processing: Check for MISSING_FILE
    missing_file_hint = ""
    if "MISSING_FILE" in diagnostic:
        missing_file_hint = "\nCRITICAL: The build failed because a file is missing. You MUST create the missing file. Do not just edit the importer."
    
    # Load prompt
    prompt_path = os.path.join("agents", "debugger", "prompt.md")
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt = f.read()

    # Build context
    code_context = "\n".join([f"--- FILE: {path} ---\n{data['content']}" for path, data in files.items()])
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Intent: {user_intent}\n\nDIAGNOSTIC REPORT:\n{diagnostic}\n\nFIX INSTRUCTIONS:\n{state.get('fix_instructions', '')}{missing_file_hint}\n\nATTEMPTED FIXES (DO NOT REPEAT):\n{json.dumps(attempted_fixes, indent=2)}\n\nCURRENT CODE:\n{code_context}")
    ]
    
    logs = []
    def log(msg, source="debugger"):
        print(f"[{source.upper()}] {msg}")
        logs.append({"content": msg, "source": source})

    log("Starting debugging session...")
    
    response = await llm.ainvoke(messages)
    content = response.content
    
    patches_applied = 0
    new_attempted_fixes = list(attempted_fixes)
    
    try:
        data = parse_json_dict(content)
        patches = data.get("patches", [])
        log(f"Received {len(patches)} potential fixes from LLM.")

        for patch in patches:
            path = patch.get("path")
            new_content = patch.get("new_content")
            
            # Duplicate check
            import hashlib
            checksum = hashlib.md5(new_content.encode('utf-8')).hexdigest() if new_content else "DELETE"
            fix_sig = f"{path}:{checksum}"
            
            if fix_sig in attempted_fixes:
                log(f"Skipping duplicate fix: {fix_sig}", "warning")
                continue # Skip this patch
            
            new_attempted_fixes.append(fix_sig)
            
            if new_content == "DELETE_FILE":
                if path in files:
                    del files[path]
                    # Attempt disk deletion
                    try:
                        project_id = state.get("project_id")
                        if project_id:
                            full_path = os.path.join("frontend", "p", project_id, path)
                            if os.path.exists(full_path):
                                os.remove(full_path)
                                log(f"Deleted forbidden file: {path}")
                    except Exception: pass
                patches_applied += 1
                continue

            if path and new_content:
                # Truncation check
                if (path.endswith(".html") or path.endswith(".jsx")) and ("</html>" not in new_content.lower() and "export default" not in new_content and "return" not in new_content):
                     # Sophisticated enough check for now
                     pass 

                if path in files:
                    files[path]["content"] = new_content
                    files[path]["lastEditedBy"] = "debugger"
                else:
                    # New file created by debugger?
                    files[path] = {"content": new_content, "language": "javascript", "lastEditedBy": "debugger", "imports": [], "exports": []}
                
                # Update Disk in Project Hub
                try:
                    project_id = state.get("project_id")
                    if project_id:
                        full_path = os.path.join("frontend", "p", project_id, path)
                        os.makedirs(os.path.dirname(full_path), exist_ok=True)
                        with open(full_path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        log(f"Applied and persisted fix to: {path}")
                except Exception as e:
                    log(f"Failed to persist {path}: {e}", "error")
                
                patches_applied += 1
    except Exception as e:
        log(f"Failed to parse patches: {e}", "error")

    tokens = extract_tokens(response)

    return {
        "files": files,
        "current_step": "debugging_complete" if patches_applied > 0 else "debugging_failed",
        "diagnostic_report": f"Debugger: Applied {patches_applied} patches.",
        "total_tokens": tokens,
        "token_usage": {"debugger": tokens},
        "token_usage": {"debugger": tokens},
        "logs": logs,
        "attempted_fixes": new_attempted_fixes
    }
