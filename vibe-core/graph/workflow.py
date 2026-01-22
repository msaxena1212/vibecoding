from langgraph.graph import StateGraph, END
from .state import CodebaseState
from agents.router.agent import run_router
from agents.planner.agent import run_planner
from agents.copywriter.agent import run_copywriter
from agents.image_generator.agent import run_image_generator
from agents.generator.agent import run_generator
from agents.linker.agent import run_linker
from agents.validator.agent import run_validator
from agents.editor.agent import run_editor
from agents.seo_specialist.agent import run_seo_specialist

from agents.assigner.agent import run_assigner
from agents.seeker.agent import run_seeker
from agents.fetch_images.agent import run_fetch_images
from agents.backend_architect.agent import run_backend_architect
from agents.react_specialist.agent import run_react_specialist
from agents.ui_specialist.agent import run_ui_specialist
from agents.debugger.agent import run_debugger
from agents.chatter.agent import run_chatter

from .router import route_request, route_validator, route_assignments

def create_workflow():
    workflow = StateGraph(CodebaseState)

    # Core Nodes
    workflow.add_node("router", run_router)
    workflow.add_node("planner", run_planner)
    workflow.add_node("assigner", run_assigner)
    workflow.add_node("seeker", run_seeker)
    workflow.add_node("copywriter", run_copywriter)
    workflow.add_node("fetch_images", run_fetch_images)
    workflow.add_node("image_generator", run_image_generator)
    workflow.add_node("generator", run_generator)
    workflow.add_node("linker", run_linker)
    workflow.add_node("ui_specialist", run_ui_specialist)
    workflow.add_node("seo_specialist", run_seo_specialist)
    workflow.add_node("validator", run_validator)
    workflow.add_node("editor", run_editor)
    workflow.add_node("debugger", run_debugger)
    workflow.add_node("chatter", run_chatter)
    
    # Advanced Capability Nodes
    workflow.add_node("backend_architect", run_backend_architect)
    workflow.add_node("react_specialist", run_react_specialist)

    # Orchestration
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        route_request,
        {
            "planner": "planner",
            "editor": "editor",
            "chatter": "chatter"
        }
    )

    # Linear Progression Spine
    workflow.add_edge("planner", "assigner")
    
    # Conditional Fork from Assigner
    workflow.add_conditional_edges(
        "assigner",
        route_assignments,
        {
            "backend_architect": "backend_architect",
            "react_specialist": "react_specialist",
            "seeker": "seeker"
        }
    )
    
    workflow.add_edge("seeker", "copywriter")
    workflow.add_edge("backend_architect", "seeker")
    workflow.add_edge("react_specialist", "seeker")
    
    workflow.add_edge("copywriter", "fetch_images")
    workflow.add_edge("fetch_images", "image_generator")
    workflow.add_edge("image_generator", "generator")
    workflow.add_edge("generator", "ui_specialist")
    workflow.add_edge("ui_specialist", "seo_specialist")
    workflow.add_edge("seo_specialist", "linker")
    workflow.add_edge("linker", "validator")
    
    # Self-Healing & Modification Loop
    workflow.add_conditional_edges(
        "validator",
        route_validator,
        {
            "editor": "editor",
            "debugger": "debugger",
            "end": END
        }
    )
    
    workflow.add_edge("debugger", "linker")
    workflow.add_edge("editor", "linker")
    workflow.add_edge("chatter", END)

    return workflow.compile()
