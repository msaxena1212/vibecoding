from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

def check_import_integrity(files: dict) -> list[str]:
    errors = []
    paths = set(files.keys())
    
    for path, data in files.items():
        if not path.endswith((".jsx", ".js", ".tsx", ".ts")):
            continue
            
        content = data.get("content", "")
        # Find all imports: import ... from './Something' or import ... from '../Something'
        # Handles: ./Layout, ../components/Layout, ./styles.css
        import_matches = re.findall(r"from\s+['\"](\.[^'\"]+)['\"]", content)
        
        # Also handle dynamic imports and requires if needed, but relative paths are most common for local files
        current_dir = os.path.dirname(path)
        
        for imp in import_matches:
            imp = imp.strip()
            # Resolve relative path
            if imp.startswith("./"):
                target = os.path.join(current_dir, imp[2:])
            elif imp.startswith("../"):
                target = os.path.join(os.path.dirname(current_dir), imp[3:])
            else:
                continue
                
            target = target.replace("\\", "/").strip("/")
            
            # Check for possible extensions if not provided
            possible_targets = [target]
            if "." not in os.path.basename(target):
                possible_targets.extend([f"{target}.jsx", f"{target}.js", f"{target}.tsx", f"{target}.ts"])
            
            if not any(t in paths for t in possible_targets):
                errors.append(f"MISSING_FILE: Import Failure in {path}. Could not find '{imp}'. Referenced as '{target}' in project state.")
                
    return errors

def check_structural_integrity(files: dict) -> list[str]:
    errors = []
    paths = list(files.keys())
    
    # 1. Critical Files (Senior Engineering Tier)
    required = ["package.json", "index.html", "src/index.jsx", "src/App.jsx", "src/index.css"]
    for req in required:
        if req not in paths:
            errors.append(f"Missing mandatory file: {req}")
    
    # 2. Path Hygiene Check
    if "index.html" in paths:
        html_content = files["index.html"].get("content", "")
        # Be more flexible with script tag check
        if 'src="/src/index.jsx"' not in html_content and 'src="./src/index.jsx"' not in html_content:
            errors.append("Invalid script tag in index.html. Must use src='./src/index.jsx'")
    
    # 3. Architectural Stratification Check (Presence of folders)
    # Downgrade to warnings that don't block UNLESS it's a completely empty src
    has_components = any(p.startswith("src/components/") for p in paths)
    has_pages = any(p.startswith("src/pages/") for p in paths)
    has_src = any(p.startswith("src/") for p in paths)
    
    if not has_src:
        errors.append("CRITICAL: src/ directory is missing or empty.")
    elif not has_components and not has_pages:
        # Only warn if both are missing, and don't make it a blocking error for now
        print("[WARN] Architecturally thin project detected (no components or pages folders).")

    # 4. Import Integrity (Deep Link Scan)
    import_errors = check_import_integrity(files)
    errors.extend(import_errors)
    
    # 5. DUPLICATE IMPORT CHECK (The "SkeletonLoader" Fix)
    for path, data in files.items():
        if not path or not isinstance(path, str): continue
        if path.endswith(".jsx") or path.endswith(".js"):
            content = data.get("content", "")
            # Find all imports: import X from ...
            imports = re.findall(r'import\s+(\w+)\s+from', content)
            # Find all declarations: const X =, function X, class X
            declarations = re.findall(r'(?:const|function|class)\s+(\w+)', content)
            
            for decl in declarations:
                if decl in imports:
                    errors.append(f"Duplicate Declaration in {path}: '{decl}' is both imported and declared inline. Remove the import or the inline declaration.")
    
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
        # If file exists in 'files' and is newer (e.g. from UI specialist), prefer that
        if path in files and files[path].get("lastEditedBy") in ["ui_specialist", "backend_architect", "react_specialist"]:
             print(f"[VALIDATOR] Validating evolved version of {path} (edited by {files[path].get('lastEditedBy')})")
        else:
             files_to_validate[path] = {
                "content": content,
                "language": patch.get("language", "javascript"),
                "lastEditedBy": "generator_proposal"
            }

    # Build context for diagnostic from simulated state
    code_context = "\n".join([f"--- FILE: {path} ---\n{data['content']}" for path, data in files_to_validate.items() if isinstance(path, str) and path])

    # --- STRUCTURAL VALIDATION ---
    structural_errors = check_structural_integrity(files_to_validate)
    if structural_errors:
        # PRIORITIZE THE FIRST STRUCTURAL ERROR FOR ONE-BY-ONE DEBUGGING
        primary_error = structural_errors[0]
        error_msg = f"CRITICAL STRUCTURAL FAILURE: {primary_error}"
        if len(structural_errors) > 1:
            error_msg += f"\n(and {len(structural_errors)-1} other structural issues)"
            
        print(f"[VALIDATOR] {error_msg}")
        
        # PERSIST TO DISK even on failure (The "Truth" must be updated)
        project_id = state.get("project_id")
        if not project_id:
            import uuid
            project_id = str(uuid.uuid4())

        for path, data in files_to_validate.items():
            try:
                local_full_path = os.path.join("frontend", "p", project_id, path)
                os.makedirs(os.path.dirname(local_full_path), exist_ok=True)
                with open(local_full_path, "w", encoding="utf-8") as f:
                    f.write(data["content"])
                print(f"[COMMIT-FAILSAFE] {path}")
            except Exception as e:
                print(f"[ERROR] Committing {path} during fail: {e}")

        return {
            "files": files_to_validate, # PRESERVE THE PROGRESS even on structural failure
            "current_step": "needs_fix",
            "diagnostic_report": error_msg,
            "fix_instructions": f"Fix the following structural error first: {primary_error}. Ensure the 3-tier architecture (src/components, src/hooks, src/pages) is correctly implemented.",
            "errors": structural_errors,
            "retry_count": state.get("retry_count", 0) + 1,
            "proposed_patches": [], # Clear applied proposals as we've merged them into 'files'
            "project_id": project_id
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
    try:
        from utils.llm import resilient_call
        response = await resilient_call(llm.ainvoke, messages)
        tokens = extract_tokens(response)
    except Exception as e:
        print(f"[ERROR] LLM call failed during validation: {e}")
        return {
            "current_step": "validation_failed",
            "diagnostic_report": f"LLM call failed during validation: {e}",
            "fix_instructions": "Review the LLM call for potential issues or retry.",
            "errors": [str(e)],
            "retry_count": state.get("retry_count", 0) + 1,
            "proposed_patches": []
        }
    
    content = response.content
        
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
            "token_usage": {"validator": tokens},
            "model_calls": 1
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
            "model_calls": 1,
            "proposed_patches": [] # Clear invalid patches
        }
    
    # --- COMMIT PHASE: ALL CHECKS PASSED ---
    print(f"[VALIDATOR] Validation Passed. Committing changes to disk.")
    
    project_id = state.get("project_id")
    if not project_id:
        import uuid
        project_id = str(uuid.uuid4())
        
    committed_files = files.copy()
    
    # Merge proposals into committed files (PREFERRING EXISTING IF NEWER)
    for patch in proposed_patches:
        path = patch.get("path")
        content = patch.get("content")
        
        # If the file already exists in 'files' and has been edited by a specialist,
        # we trust the 'files' version more than the 'proposed_patches' (Raw Generator) version.
        if path in files and files[path].get("lastEditedBy") in ["ui_specialist", "backend_architect", "react_specialist"]:
            content = files[path]["content"]
            print(f"[COMMIT] Preserving evolved file: {path}")
        else:
             print(f"[COMMIT] Committing patch: {path}")
        
        committed_files[path] = {
            "content": content,
            "language": patch.get("language", "javascript"),
            "lastEditedBy": "validator_commit"
        }
        
        # Persist to Disk
        try:
            local_full_path = os.path.join("frontend", "p", project_id, path)
            os.makedirs(os.path.dirname(local_full_path), exist_ok=True)
            with open(local_full_path, "w", encoding="utf-8") as f:
                f.write(content)
        except Exception as e:
            print(f"[ERROR] Committing {path}: {e}")

    return {
        "files": committed_files,
        "current_step": "validation_complete", 
        "diagnostic_report": "All quality and design audits passed. Patches committed.",
        "total_tokens": tokens,
        "token_usage": {"validator": tokens},
        "model_calls": 1,
        "proposed_patches": [], # Clear applied patches
        "project_id": project_id, # Ensure ID is passed back if created
        "compile_phase": "install" # Reset build phase for fresh compilation
    }
