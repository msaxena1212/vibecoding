from typing import Literal
from .state import CodebaseState

def route_request(state: CodebaseState) -> Literal["planner", "editor"]:
    """
    Determine if the request is a new project (planner) or an edit (editor).
    """
    user_intent = state.get("userIntent", "").lower()
    files = state.get("files", {})
    
    # If we already have files, we should probably be editing unless it's a "start over" command
    if files and not ("new project" in user_intent or "clear" in user_intent):
        return "editor"
        
    if "edit" in user_intent or "change" in user_intent or "add" in user_intent:
        return "editor"
    return "planner"
