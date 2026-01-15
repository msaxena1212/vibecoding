from backend.graph.agent_runner import run_agent_with_tools
from backend.graph.state import CodebaseState

def run_debugger_agent(state: CodebaseState):
    """
    Final sanity check agent that audits the entire output before completion.
    """
    system_prompt = """You are a Quality Assurance Automation Engineer.
Your goal is to audit the entire generated codebase for critical "build-breaking" errors.
Specifically:
1. Check for missing npm scripts (especially 'build').
2. Check for inconsistent imports or relative paths that will break in a real Vite build.
3. Verify that the project is "Production Ready".
If you find issues, USE YOUR TOOLS to fix them or report the failure.
If the project is perfect, declare it "Validated and Stable".
"""
    return run_agent_with_tools(state, "debugger_agent", system_prompt)
