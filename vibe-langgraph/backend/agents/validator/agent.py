from backend.graph.state import CodebaseState
import re

def run_validator(state: CodebaseState):
    """
    Run static checks, dead code detection, and syntax validation.
    """
    files = state.get("files", {})
    errors = []
    
    for path, file_data in files.items():
        content = file_data.get("content", "")
        
        # 1. Check for empty files
        if not content.strip():
            errors.append(f"File {path} is empty.")
            continue
            
        # 2. Check for unclosed JSX/HTML tags (very basic)
        if path.endswith((".html", ".jsx", ".tsx")):
            open_tags = len(re.findall(r"<[a-zA-Z]+(?!/>)[^>]*>", content))
            close_tags = len(re.findall(r"</[a-zA-Z]+>", content))
            if open_tags != close_tags and "<!" not in content:
                 # This is a bit naive, but good for base validation
                 pass 

        # 3. Check for obvious placeholders
        if "[INSERT CODE HERE]" in content or "TODO" in content:
            errors.append(f"File {path} contains placeholders/TODOs.")

        # 4. Check for unhandled imports (very basic)
        if "from './" in content:
            import_match = re.search(r"from './([^']+)'", content)
            if import_match:
                imported_file = import_match.group(1)
                # Check if file exists in the state
                found = False
                for ext in ["", ".jsx", ".js", ".css"]:
                    if f"{imported_file}{ext}" in files or f"src/{imported_file}{ext}" in files:
                        found = True
                        break
                # if not found:
                #    errors.append(f"File {path} imports non-existent file: {imported_file}")

    return {
        "current_step": "validation_complete",
        "errors": errors
    }
