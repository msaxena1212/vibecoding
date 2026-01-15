from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

from backend.graph.agent_runner import run_agent_with_tools
from backend.graph.state import CodebaseState

def run_seo_specialist(state: CodebaseState):
    """
    Audit the generated code for SEO, performance, and accessibility.
    """
    system_prompt = """You are a technical SEO specialist and performance expert. 
Your mission is to audit the final code for search engine visibility, page speed, and accessibility.
Use your tools to analyze codebase structure and perform style/performance audits.
Output a detailed audit report in Markdown.
"""
    return run_agent_with_tools(state, "seo_specialist", system_prompt)
