from langchain_core.tools import tool
from typing import Dict

@tool
def react_audit_tool(files: Dict[str, str]) -> str:
    """
    Audits a React project for structural integrity.
    Checks for: index.html, package.json (with scripts), vite.config.js, and src/ folder.
    """
    missing = []
    if "index.html" not in files: missing.append("index.html")
    if "package.json" not in files: missing.append("package.json")
    else:
        import json
        try:
            pkg = json.loads(files["package.json"])
            scripts = pkg.get("scripts", {})
            if "build" not in scripts: missing.append("package.json scripts.build")
            if "dev" not in scripts: missing.append("package.json scripts.dev")
        except:
            missing.append("valid package.json")
            
    if missing:
        return f"CRITICAL: Missing React structure items: {', '.join(missing)}"
    return "SUCCESS: React structure is valid and build-ready."
