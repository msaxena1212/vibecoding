from typing import List, Dict, Any, Literal
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState
from backend.graph.tools import get_agent_tools
import json

from backend.graph.tools import get_agent_tools, write_file_tool, code_analysis_tool, unsplash_asset_tool, style_audit_tool, react_audit_tool

from backend.graph.agent_runner import run_agent_with_tools

def run_manager(state: CodebaseState):
    """
    The Orchestrator that decides which agent to call next or if the task is complete.
    """
    llm = get_llm()
    
    prompt = """You are the Lead Project Manager. 
Your goal is to coordinate a team of specialized agents.
Based on the current state and plan, decide if we need more specialized work.

DECISION RULES:
1. Always call 'react_specialist' for React projects to verify modular structure (import/export), Vite config, and entry points.
2. Ensure index.html is clean (no inline React logic) and links to src/main.jsx.
3. Call 'debugger_agent' as the LAST step to perform a build-readiness audit.
4. Output 'complete' ONLY after a successful validator pass with NO errors.
5. If Validator reported errors, you MUST call 'editor' or 'seeker' to fix them.

Output 'complete' or the name of the agent (ui_specialist, backend_architect, copywriter, react_specialist, debugger_agent).
"""
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Intent: {state.get('userIntent')}\nTools Used: {state.get('tool_history')}\nCurrent Step: {state.get('current_step')}\nFiles Created: {list(state.get('files', {}).keys())}")
    ]
    
    response = llm.invoke(messages)
    content = response.content
    
    # Robust parsing
    if isinstance(content, list):
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
    
    decision = str(content).strip().lower()
    
    # Loop Detection: If we've already executed an agent and nothing changed, move on.
    tool_history = state.get("tool_history", [])
    last_agent = tool_history[-1]["agent"] if tool_history else None
    
    # Special case: LLM might output Markdown or sentences
    if "ui_specialist" in decision:
        decision = "ui_specialist"
    elif "backend_architect" in decision:
        decision = "backend_architect"
    elif "copywriter" in decision:
        decision = "copywriter"
    elif "react_specialist" in decision:
        decision = "react_specialist"
    elif "debugger_agent" in decision:
        decision = "debugger_agent"
    elif "complete" in decision:
        decision = "complete"
    else:
        decision = "complete"

    # CRITICAL: Prevent infinite looping
    # Count how many times the current decision has appeared in the tool history consecutively
    consecutive_count = 0
    for entry in reversed(tool_history):
        if entry["agent"] == decision:
            consecutive_count += 1
        else:
            break
            
    if consecutive_count >= 2:
        print(f"DEBUG: Manager detected stubborn loop for {decision}. Forcing next stage.")
        if decision == "react_specialist": decision = "debugger_agent"
        else: decision = "complete"

    return {
        "current_step": f"manager_decision_{decision}"
    }
