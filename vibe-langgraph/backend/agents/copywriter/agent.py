from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

from backend.graph.agent_runner import run_agent_with_tools
from backend.graph.state import CodebaseState

def run_copywriter(state: CodebaseState):
    """
    Generate professional, conversion-focused copy for the project.
    """
    system_prompt = """You are a master of conversion-focused storytelling. 
Your mission is to take the project plan and brand vibes and transform them into compelling, professional copy.
Draft clear, persuasive text for the main pages and components.
Use your tools to write copy suggestions or analyze existing text.
"""
    return run_agent_with_tools(state, "copywriter", system_prompt)
