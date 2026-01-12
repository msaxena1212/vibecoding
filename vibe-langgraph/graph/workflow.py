from langgraph.graph import StateGraph, END
from .state import CodebaseState
from agents.planner.agent import run_planner
from agents.generator.agent import run_generator
from agents.linker.agent import run_linker
from agents.validator.agent import run_validator
from agents.editor.agent import run_editor
from .router import route_request

from agents.copywriter.agent import run_copywriter
from agents.seo_specialist.agent import run_seo_specialist
from agents.image_generator.agent import run_image_generator
from .router import route_request, route_validator

def create_workflow():
    workflow = StateGraph(CodebaseState)

    workflow.add_node("planner", run_planner)
    workflow.add_node("copywriter", run_copywriter)
    workflow.add_node("image_generator", run_image_generator)
    workflow.add_node("generator", run_generator)
    workflow.add_node("linker", run_linker)
    workflow.add_node("seo_specialist", run_seo_specialist)
    workflow.add_node("validator", run_validator)
    workflow.add_node("editor", run_editor)

    # Dynamic Entry
    workflow.set_conditional_entry_point(
        route_request,
        {
            "planner": "planner",
            "editor": "editor"
        }
    )
    
    # Linear Progression Trace
    workflow.add_edge("planner", "copywriter")
    workflow.add_edge("copywriter", "image_generator")
    workflow.add_edge("image_generator", "generator")
    workflow.add_edge("generator", "linker")
    workflow.add_edge("linker", "seo_specialist")
    workflow.add_edge("seo_specialist", "validator")
    
    # Self-Healing Loop
    workflow.add_conditional_edges(
        "validator",
        route_validator,
        {
            "editor": "editor",
            "end": END
        }
    )
    
    workflow.add_edge("editor", "validator") # Re-audit after edit
    
    return workflow.compile()
