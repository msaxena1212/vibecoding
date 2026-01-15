from langgraph.graph import StateGraph, END
from .state import CodebaseState
from backend.agents.planner.agent import run_planner
from backend.agents.generator.agent import run_generator
from backend.agents.linker.agent import run_linker
from backend.agents.validator.agent import run_validator
from backend.agents.editor.agent import run_editor
from backend.agents.chatter.agent import run_chatter
from backend.agents.seeker.agent import run_seeker
from backend.agents.assigner.agent import run_assigner
from backend.agents.router.agent import run_router
from backend.agents.responder.agent import run_responder
from backend.agents.ui_specialist.agent import run_ui_specialist
from backend.agents.backend_architect.agent import run_backend_architect
from backend.agents.react_specialist.agent import run_react_specialist
from backend.agents.debugger.production_debugger import run_debugger_agent
from backend.graph.manager import run_manager
from backend.agents.debugger.analyzer import run_debugger_analyzer
from backend.agents.copywriter.agent import run_copywriter
from backend.agents.image_generator.agent import run_image_generator
from backend.agents.seo_specialist.agent import run_seo_specialist
from backend.agents.fetch_images.agent import run_fetch_images
from .router import route_after_router, route_after_planner, route_after_validator, route_after_specialists, route_after_manager

def create_workflow():
    workflow = StateGraph(CodebaseState)

    workflow.add_node("assigner", run_assigner)
    workflow.add_node("router", run_router)
    workflow.add_node("planner", run_planner)
    workflow.add_node("generator", run_generator)
    workflow.add_node("editor", run_editor)
    workflow.add_node("linker", run_linker)
    workflow.add_node("validator", run_validator)
    workflow.add_node("chatter", run_chatter)
    workflow.add_node("seeker", run_seeker)
    workflow.add_node("debugger_analyzer", run_debugger_analyzer)
    workflow.add_node("responder", run_responder)
    workflow.add_node("copywriter", run_copywriter) # NEW
    workflow.add_node("image_generator", run_image_generator) # NEW
    workflow.add_node("seo_specialist", run_seo_specialist) # NEW
    workflow.add_node("fetch_images", run_fetch_images) # NEW
    
    workflow.add_node("manager", run_manager)
    workflow.add_node("ui_specialist", run_ui_specialist)
    workflow.add_node("backend_architect", run_backend_architect)
    workflow.add_node("react_specialist", run_react_specialist)
    workflow.add_node("debugger_agent", run_debugger_agent)
    
    workflow.set_entry_point("assigner")
    
    workflow.add_edge("assigner", "router")
    
    workflow.add_conditional_edges(
        "router",
        route_after_router,
        {
            "planner": "planner",
            "chatter": "chatter",
            "debugger_analyzer": "debugger_analyzer"
        }
    )
    
    # Planner decides if we create new files or edit existing ones
    workflow.add_conditional_edges(
        "planner",
        route_after_planner,
        {
            "generator": "generator",
            "editor": "editor"
        }
    )
    
    # Implementation always leads to linking
    workflow.add_edge("generator", "linker")
    workflow.add_edge("editor", "linker")
    
    # Linking leads to validation
    workflow.add_edge("linker", "validator")
    
    # Validator can loop back to Planner for recovery or proceed to Responder
    workflow.add_conditional_edges(
        "validator",
        route_after_validator,
        {
            "planner": "planner", # Loop back for fixes
            "responder": "responder"
        }
    )
    
    workflow.add_edge("chatter", "responder") # Chatter goes direct to finish
    workflow.add_edge("debugger_analyzer", "responder")
    workflow.add_edge("seo_specialist", "responder")
    
    workflow.add_edge("responder", END)
    
    return workflow.compile()
