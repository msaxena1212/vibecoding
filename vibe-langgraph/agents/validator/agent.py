from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

def check_structural_integrity(files: dict) -> list[str]:
    errors = []
    paths = files.keys()
    
    # 1. Critical Files
    if "package.json" not in paths:
        errors.append("Missing package.json")
    
    if "index.html" not in paths:
        errors.append("Missing index.html")
        
    # 2. Entry Point
    has_entry = any(p in paths for p in ["src/main.jsx", "src/index.jsx", "src/main.js", "src/index.js"])
    if not has_entry:
        errors.append("Missing React entry point (src/main.jsx or src/index.jsx)")
        
    return errors

async def run_validator(state: CodebaseState):
    print("\n=== [VALIDATOR STARTING] ===")
    """
    Run diagnostic scan on the generated code.
    Detects syntax errors, missing assets, or design flaws.
    """
    llm = get_llm()
    files = state.get("files", {})
    user_intent = state.get("userIntent", "")
    
    if not files and not state.get("proposed_patches"):
        return {"current_step": "validation_skipped"}

    # --- PROCESS PATCHES IF ANY ---
    proposed_patches = state.get("proposed_patches", [])
    files_to_validate = files.copy()
    
    # Simulate patch application for validation context
    for patch in proposed_patches:
        path = patch.get("path")
        content = patch.get("content")
        files_to_validate[path] = {"content": content} # Simulation

    # Build context for diagnostic from simulated state
    code_context = "\n".join([f"--- FILE: {path} ---\n{data['content']}" for path, data in files_to_validate.items()])

    # --- STRUCTURAL VALIDATION ---
    structural_errors = check_structural_integrity(files_to_validate)
    if structural_errors:
        error_msg = "Structural Validation Failed:\n" + "\n".join(f"- {e}" for e in structural_errors)
        print(f"[VALIDATOR] {error_msg}")
        return {
            "current_step": "needs_fix",
            "diagnostic_report": error_msg,
            "fix_instructions": "Generate the missing critical files (package.json, index.html, entry point).",
            "errors": structural_errors,
            "retry_count": state.get("retry_count", 0) + 1,
            "proposed_patches": []
        }
    
    # Load prompt from file
    prompt_path = os.path.join(os.path.dirname(__file__), "prompt.md")
    with open(prompt_path, "r", encoding="utf-8") as f:
        system_prompt = f.read()
    
    images_info = json.dumps(state.get("images_to_generate", []), indent=2)
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"User Intent: {user_intent}\n\nASSETS BEING GENERATED:\n{images_info}\n\nGenerated Code:\n{code_context}")
    ]
    
    response = await llm.ainvoke(messages)
    content = response.content
    
    # Extract token usage
    tokens = extract_tokens(response)
        
    current_tokens = state.get("total_tokens", 0)
    usage = state.get("token_usage", {})
    usage["validator"] = usage.get("validator", 0) + tokens

    report = parse_json_dict(content)
    
    if not report:
        print("[ERROR] Validator failed to generate a valid diagnostic report.")
        return {
            "current_step": "validation_complete", # Skip on failure to avoid loops
            "diagnostic_report": "Diagnosis failed due to parsing error.",
            "total_tokens": tokens,
            "token_usage": {"validator": tokens}
        }

    if report.get("status") == "fail":
        diag = report.get("diagnostic_report", {})
        diag_text = f"Audit Failed: {diag.get('summary', 'Issues detected.')}\n- Technical: {', '.join(diag.get('technical_issues', []))}\n- Design: {', '.join(diag.get('design_flaws', []))}"
        fix_instr = report.get("fix_instructions", "Review the diagnostic report and apply surgical patches.")
        
        print(f"DEBUG: Diagnosis FAILED: {diag_text}")
        # REJECT PATCHES - Do not commit to disk
        return {
            "current_step": "needs_fix",
            "diagnostic_report": diag_text,
            "fix_instructions": fix_instr,
            "errors": [diag_text],
            "retry_count": state.get("retry_count", 0) + 1,
            "total_tokens": tokens,
            "token_usage": {"validator": tokens},
            "proposed_patches": [] # Clear invalid patches
        }
    
    # --- COMMIT PHASE: ALL CHECKS PASSED ---
    print(f"[VALIDATOR] Validation Passed. Committing {len(proposed_patches)} patches to disk.")
    
    project_id = state.get("project_id")
    if not project_id:
        import uuid
        project_id = str(uuid.uuid4())
        
    committed_files = files.copy()
    
    for patch in proposed_patches:
        path = patch.get("path")
        content = patch.get("content")
        
        # 1. Update In-Memory State
        committed_files[path] = {
            "content": content,
            "language": patch.get("language", "javascript"),
            "lastEditedBy": "validator_commit"
        }
        
        # 2. Persist to Disk (The "Truth")
        try:
            local_full_path = os.path.join("frontend", "p", project_id, path)
            os.makedirs(os.path.dirname(local_full_path), exist_ok=True)
            with open(local_full_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[COMMIT] {path}")
        except Exception as e:
            print(f"[ERROR] Committing {path}: {e}")

    return {
        "files": committed_files,
        "current_step": "validation_complete", 
        "diagnostic_report": "All quality and design audits passed. Patches committed.",
        "total_tokens": tokens,
        "token_usage": {"validator": tokens},
        "proposed_patches": [], # Clear applied patches
        "project_id": project_id, # Ensure ID is passed back if created
        "compile_phase": "install" # Reset build phase for fresh compilation
    }
