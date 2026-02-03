from typing import Literal
from .state import CodebaseState

def route_validator(state: CodebaseState) -> Literal["editor", "debugger", "compiler", "end"]:
    """
    Handle self-diagnosis loop with escalation strategy.
    Strategy:
    - 0-3 retries: Debugger (Surgical fix)
    - 4-15 retries: Editor (Deep rewrite/refactor)
    - >15 retries: End (Failsafe)
    """
    current_step = state.get("current_step", "")
    retry_count = state.get("retry_count", 0)
    
    # Validation failed (or explicitly requested fix)
    if current_step == "needs_fix" or "fail" in state.get("diagnostic_report", "").lower():
        if retry_count > 8:
            print("[STOP] Max retries (8) reached. Exiting validation loop to prevent crash.")
            return "end"
            
        if retry_count > 2:
            print(f"[ESCALATE] Validation failed (Attempt {retry_count + 1}). Escalating to Editor for rewrite.")
            return "editor"

        print(f"[RETRY] Validation failed (Attempt {retry_count + 1}). Routing to Debugger.")
        return "debugger"

    print("[SUCCESS] Validation passed. Routing to Compiler.")
    return "compiler"

def route_compiler(state: CodebaseState) -> Literal["debugger", "editor", "compiler", "end"]:
    """
    Handle runtime compilation results with escalation.
    """
    current_step = state.get("current_step", "")
    retry_count = state.get("retry_count", 0)
    compile_phase = state.get("compile_phase", "install")
    
    if current_step == "build_error":
        if retry_count > 15:
            print("[STOP] Compilation failed max retries (15). Exiting.")
            return "end"
            
        if retry_count > 3:
            print(f"[ESCALATE] Compilation failed (Attempt {retry_count + 1}). Escalating to Editor.")
            return "editor"
            
        print("[FAIL] Runtime compilation failed. Routing to Debugger.")
        return "debugger"
        
    # If phase is not complete, loop back to compiler for next phase
    if compile_phase != "complete":
        print(f"[LOOP] Phase '{compile_phase}' passed. looping to Compiler for next phase.")
        return "compiler"

    print("[SUCCESS] Runtime compilation passed. Finishing workflow.")
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
    Supports sequential execution of multiple specialists.
    """
    assignments = state.get("plan", {}).get("assignments", [])
    files = state.get("files", {})
    
    # Check for Backend
    backend_assigned = any("backend" in a.get("agent", "").lower() for a in assignments)
    backend_done = any(f.get("lastEditedBy") == "backend_architect" for f in files.values())
    
    if backend_assigned and not backend_done:
        return "backend_architect"
        
    react_assigned = any("react" in a.get("agent", "").lower() or "component" in a.get("agent", "").lower() for a in assignments)
    react_done = any(f.get("lastEditedBy") == "react_specialist" for f in files.values())
    
    if react_assigned and not react_done:
        return "react_specialist"
        
    return "seeker"

def route_debugger(state: CodebaseState) -> Literal["linker", "compiler"]:
    """
    Decide where to go after a fix is applied.
    If we were fixing a build error, go back to compiler.
    Otherwise (validation error), go to linker.
    """
    diag = state.get("diagnostic_report", "").lower()
    
    if "build" in diag or "npm" in diag or "installation" in diag or "compilation" in diag:
        print("[ROUTE] Build fix applied. Routing back to Compiler for next phase/retry.")
        return "compiler"
    
    print("[ROUTE] General fix applied. Routing to Linker for audit.")
    return "linker"
