from langgraph.graph import StateGraph, END
from .state import CodebaseState
from agents.planner.agent import run_planner
from agents.generator.agent import run_generator
from agents.linker.agent import run_linker
from agents.validator.agent import run_validator
from agents.editor.agent import run_editor
from .router import route_request

def create_workflow():
    workflow = StateGraph(CodebaseState)

    workflow.add_node("planner", run_planner)
    workflow.add_node("generator", run_generator)
    workflow.add_node("linker", run_linker)
    workflow.add_node("validator", run_validator)
    workflow.add_node("editor", run_editor)

    # Dynamic Routing
    workflow.set_conditional_entry_point(
        route_request,
        {
            "planner": "planner",
            "editor": "editor"
        }
    )
    
    workflow.add_edge("planner", "generator")
    workflow.add_edge("generator", "linker")
    workflow.add_edge("linker", "validator")
    workflow.add_edge("validator", END)
    
    workflow.add_edge("editor", "validator") # After editing, validate
    
    # Editor flow would likely be a separate entry or conditional
    # For now, we leave it disconnected or accessible via specific config
    
    return workflow.compile()
