from typing import Literal
from .state import CodebaseState

def route_after_router(state: CodebaseState) -> Literal["planner", "chatter", "debugger_analyzer"]:
    intent = state.get("intent", {})
    primary_mode = intent.get("primaryMode", "generate")
    confidence = intent.get("confidence", 0)
    
    if primary_mode == "explain":
        return "chatter"
        
    if primary_mode == "debug":
        return "planner" # Or debugger_analyzer if preferred, following section 11 diagram
        
    return "planner"

def route_after_planner(state: CodebaseState) -> Literal["generator", "editor"]:
    mode = state.get("mode", "generate")
    if mode in ["modify", "debug"]:
        return "editor"
    return "generator"

def route_after_specialists(state: CodebaseState) -> Literal["fetch_images", "image_generator", "generator", "editor"]:
    assigned = state.get("agent_config", {})
    needs_mod = state.get("needs_modification", False)
    images = state.get("images", [])
    
    # Fallback from fetch_images to image_generator if no images found
    if "fetch_images" in assigned and not images and state.get("current_step") == "images_fetched":
        if "image_generator" in assigned:
            return "image_generator"
    
    if needs_mod:
        return "editor"
    return "generator"

def route_after_validator(state: CodebaseState) -> Literal["planner", "responder"]:
    diagnostics = state.get("diagnostics", {})
    errors = diagnostics.get("errors", [])
    
    if errors:
        # Loop back to Planner for recovery (Self-correcting loop)
        return "planner"
        
    return "responder"
def route_after_manager(state: CodebaseState) -> Literal["ui_specialist", "backend_architect", "copywriter", "react_specialist", "debugger_agent", "generator", "editor"]:
    step = state.get("current_step", "")
    needs_mod = state.get("needs_modification", False)
    
    if "ui_specialist" in step:
        return "ui_specialist"
    if "backend_architect" in step:
        return "backend_architect"
    if "copywriter" in step:
        return "copywriter"
    if "react_specialist" in step:
        return "react_specialist"
    if "debugger_agent" in step:
        return "debugger_agent"
        
    if needs_mod:
        return "editor"
    return "generator"

def route_back_to_manager(state: CodebaseState) -> Literal["manager"]:
    return "manager"
