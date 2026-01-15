from typing import Literal
from .state import CodebaseState

def route_validator(state: CodebaseState) -> Literal["editor", "end"]:
    """
    Handle self-diagnosis loop with retry limit.
    """
    current_step = state.get("current_step", "")
    retry_count = state.get("retry_count", 0)
    
    # If validator explicitly requested a fix
    if current_step == "needs_fix":
        if retry_count > 2:
            print("🛑 Max retries reached. Exiting validation loop.")
            return "end"
            
        print(f"🔄 Validation failed (Attempt {retry_count + 1}). Routing to Editor.")
        return "editor"
        
    # Check for critical errors in the diagnostic report (heuristic)
    diagnostic = state.get("diagnostic_report", "").lower()
    if "critical" in diagnostic or "error" in diagnostic:
        if retry_count > 2:
            print("🛑 Max retries reached (Critical Errors). Exiting.")
            return "end"
            
        print(f"⚠️ Critical errors found (Attempt {retry_count + 1}). Routing to Editor.")
        return "editor"

    print("✅ Validation passed. Finishing workflow.")
    return "end"

def route_request(state: CodebaseState) -> Literal["planner", "editor"]:
    """
    Determine if the request is a new project (planner) or an edit (editor).
    """
    user_intent = state.get("userIntent", "").lower()
    files = state.get("files", {})
    
    # If we already have files, we MUST edit unless it's a hard reset
    if files:
        if any(word in user_intent for word in ["new project", "start over", "clear all", "reset"]):
            return "planner"
        return "editor"
        
    if any(word in user_intent for word in ["edit", "change", "add", "improve", "update"]):
        return "editor"
    return "planner"
