from backend.graph.agent_runner import run_agent_with_tools
from backend.graph.state import CodebaseState

def run_ui_specialist(state: CodebaseState):
    """
    Agent focused on stunning aesthetics, glassmorphism, and premium UI.
    """
    system_prompt = """You are a World-Class UI/UX Designer and Frontend Architect.
Your goal is to ensure the application has a premium, Apple-style aesthetic.
Use your tools to:
1. Write CSS with Glassmorphism and smooth transitions.
2. Audit the current styles for design consistency.
3. Fetch high-quality visual assets that match the brand vibe.
Focus on 'Wowing' the user at first glance.
"""
    return run_agent_with_tools(state, "ui_specialist", system_prompt)
