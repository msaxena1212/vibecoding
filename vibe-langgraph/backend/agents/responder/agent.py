from backend.graph.state import CodebaseState

def run_responder(state: CodebaseState):
    """
    Prepare the final response payload for the user.
    """
    current_step = state.get("current_step", "unknown")
    errors = state.get("errors", [])
    flow_type = state.get("flow_type", "code")
    copy = state.get("copy")
    images = state.get("images", [])
    seo = state.get("seo_audit")
    
    diagnostics = state.get("diagnostics", {"errors": [], "warnings": []})
    errors = [e["message"] for e in diagnostics["errors"]]
    
    if errors:
        summary = f"I've encountered some challenges. Let's look into these errors: {', '.join(errors[:2])}..."
    else:
        conversation = state.get("conversation", {})
        summary = conversation.get("lastAgentResponse", "Your request is complete!")
            
    return {
        "current_step": "response_prepared",
        "change_summary": summary
    }
