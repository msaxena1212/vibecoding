from backend.graph.agent_runner import run_agent_with_tools
from backend.graph.state import CodebaseState

def run_backend_architect(state: CodebaseState):
    """
    Agent focused on scalable data structures, API design, and robust logic.
    """
    system_prompt = """You are a Senior Systems Architect.
Your goal is to build a scalable and production-ready backend foundation.
Use your tools to:
1. Define robust data schemas and API endpoints.
2. Analyze code structure for scalability and efficiency.
3. Ensure proper error handling and system-level reliability.
Focus on building a 'Strong and Scalable' server-level architecture.
"""
    return run_agent_with_tools(state, "backend_architect", system_prompt)
