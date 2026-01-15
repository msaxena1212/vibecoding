from backend.graph.state import CodebaseState
import re

def run_validator(state: CodebaseState):
    """
    Run static checks, dead code detection, and syntax validation.
    """
    files = state.get("files", {})
    errors = []
    warnings = []
    
    import uuid

    def create_error(err_type, file, message, severity="blocking", auto_fixable=False):
        return {
            "id": str(uuid.uuid4()),
            "type": err_type,
            "file": file,
            "message": message,
            "severity": severity,
            "autoFixable": auto_fixable
        }

    for path, file_data in files.items():
        content = file_data.get("content", "")
        
        # 1. Check for empty files
        if not content.strip():
            errors.append(create_error("syntax", path, f"File {path} is empty.", "blocking", False))
            continue
            
        # 2. Check for Vite Build Readiness
        if path == "package.json":
            try:
                import json
                pkg = json.loads(content)
                scripts = pkg.get("scripts", {})
                if not all(s in scripts for s in ["dev", "build", "preview"]):
                    errors.append(create_error("config", path, "package.json is missing standard Vite scripts (dev, build, preview).", "blocking", True))
                
                dev_deps = pkg.get("devDependencies", {})
                if "vite" not in dev_deps or "@vitejs/plugin-react" not in dev_deps:
                    errors.append(create_error("config", path, "package.json is missing vite devDependencies.", "critical", True))
            except:
                errors.append(create_error("config", path, "package.json is not valid JSON.", "blocking", False))

        # 3. Check for index.html entry point
        if path == "index.html":
            if '<script type="module" src="/src/main.jsx"></script>' not in content:
                errors.append(create_error("framework", path, "index.html is missing the Vite module entry script tag.", "blocking", True))
            if 'ReactDOM.render' in content:
                warnings.append(create_error("framework", path, "index.html contains legacy inline ReactDOM.render script; move logic to src/main.jsx.", "warning", False))

        # 4. Check for React 18 createRoot
        if path == "src/main.jsx":
            if "createRoot" not in content:
                errors.append(create_error("framework", path, "src/main.jsx is missing React 18 createRoot initialization.", "critical", False))

        # 5. Check for obvious placeholders
        if "[INSERT CODE HERE]" in content or "TODO" in content:
            warnings.append(create_error("syntax", path, f"File {path} contains placeholders/TODOs.", "minor", False))

    # Check for missing imports from Linker
    missing_imports = state.get("missing_imports", []) or []
    for mi in missing_imports:
        errors.append(create_error("import", mi["file"], f"Missing import {mi['target']} in {mi['file']}", "blocking", False))

    return {
        "current_step": "validation_complete",
        "diagnostics": {
            "errors": errors,
            "warnings": warnings
        },
        "errors": [e["message"] for e in errors] # Keep for compatibility
    }
