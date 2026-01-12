from typing import Literal
from .state import CodebaseState

def route_validator(state: CodebaseState) -> Literal["editor", "end"]:
    """
    Handle self-diagnosis loop.
    TEMPORARILY DISABLED: Always skip editor to avoid network errors
    """
    # current_step = state.get("current_step", "")
    # if current_step == "needs_fix":
    #     return "editor"
    print("⚠️ Skipping editor phase (disabled to prevent network errors)")
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
