from langgraph.graph import StateGraph, END
from .state import CodebaseState
from backend.agents.planner.agent import run_planner
from backend.agents.generator.agent import run_generator
from backend.agents.linker.agent import run_linker
from backend.agents.validator.agent import run_validator
from backend.agents.editor.agent import run_editor
from backend.agents.chatter.agent import run_chatter
from backend.agents.seeker.agent import run_seeker
from backend.agents.debugger.agent import run_debugger
from .router import route_request

def create_workflow():
    workflow = StateGraph(CodebaseState)

    workflow.add_node("planner", run_planner)
    workflow.add_node("generator", run_generator)
    workflow.add_node("linker", run_linker)
    workflow.add_node("validator", run_validator)
    workflow.add_node("editor", run_editor)
    workflow.add_node("debugger", run_debugger)
    workflow.add_node("chatter", run_chatter)
    workflow.add_node("seeker", run_seeker)

    # Dynamic Routing
    workflow.set_conditional_entry_point(
        route_request,
        {
            "planner": "planner",
            "editor": "seeker",
            "debugger": "debugger",
            "chatter": "chatter"
        }
    )
    
    workflow.add_edge("planner", "generator")
    workflow.add_edge("generator", "linker")
    workflow.add_edge("linker", "validator")
    
    # Self-healing loop: if validator finds errors, go to debugger, else END
    def decide_finish(state: CodebaseState):
        if state.get("errors") and len(state.get("errors", [])) > 0:
            return "debugger"
        return END

    workflow.add_conditional_edges(
        "validator",
        decide_finish,
        {
            "debugger": "debugger",
            END: END
        }
    )
    
    workflow.add_edge("seeker", "editor")
    workflow.add_edge("editor", "validator")
    workflow.add_edge("debugger", "validator") # Re-validate after debugging
    workflow.add_edge("chatter", END)
    
    return workflow.compile()
