from typing import Literal
from .state import CodebaseState

def route_validator(state: CodebaseState) -> Literal["editor", "debugger", "end"]:
    """
    Handle self-diagnosis loop with retry limit.
    """
    current_step = state.get("current_step", "")
    retry_count = state.get("retry_count", 0)
    
    # If validator explicitly requested a fix
    if current_step == "needs_fix":
        if retry_count > 5:
            print("[STOP] Max retries reached. Exiting validation loop.")
            return "end"
            
        # Use Debugger for technical failures, Editor for user-initiated changes
        print(f"[RETRY] Validation failed (Attempt {retry_count + 1}). Routing to Debugger.")
        return "debugger"
        
    # Check for critical errors in the diagnostic report (heuristic)
    diagnostic = state.get("diagnostic_report", "").lower()
    if "critical" in diagnostic or "error" in diagnostic or "fail" in diagnostic:
        if retry_count > 5:
            print("[STOP] Max retries reached (Critical Errors). Exiting.")
            return "end"
            
        print(f"[WARN] Issues found (Attempt {retry_count + 1}). Routing to Debugger.")
        return "debugger"

    print("[SUCCESS] Validation passed. Finishing workflow.")
    return "end"

def route_request(state: CodebaseState) -> Literal["planner", "editor", "chatter"]:
    """
    Determine the next node based on the Router agent's decision.
    """
    route = state.get("current_step", "planner")
    
    if route not in ["planner", "editor", "chatter"]:
        return "planner"
        
    return route
def route_assignments(state: CodebaseState) -> Literal["backend_architect", "react_specialist", "seeker"]:
    """
    Decide which specialized agent to trigger based on assignments.
    """
    assignments = state.get("plan", {}).get("assignments", [])
    agent_names = [a.get("agent", "").lower() for a in assignments]
    
    if "backend" in str(agent_names):
        return "backend_architect"
    if "react" in str(agent_names) or "component" in str(agent_names):
        return "react_specialist"
        
    return "seeker"
