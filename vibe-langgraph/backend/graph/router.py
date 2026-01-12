from typing import Literal
from .state import CodebaseState
from backend.utils.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage
import re

def route_request(state: CodebaseState) -> Literal["planner", "editor", "debugger", "chatter"]:
    """
    Determine if the request is a new project (planner), an edit (editor), or general chat (chatter).
    """
    user_intent = state.get("userIntent", "").lower()
    files = state.get("files", {})
    
    # Heuristic for obvious cases to save tokens
    if not files:
        return "planner"
        
    # For existing projects, use LLM to decide
    llm = get_llm()
    first_prompt = """Analyze the user's intent and classify it into one of four categories:
    1. 'planner': Use this if the user wants to start a completely new project, restart the current build from scratch, or significantly change the fundamental framework.
    2. 'editor': Use this if the user wants to *modify* existing code (e.g., change colors, add a small feature, update text) WITHOUT reporting a bug/crash.
    3. 'debugger': Use this if the user reports a BUG, ERROR, CRASH, or simply asks to "fix" something that is broken.
    4. 'chatter': Use this if the user is asking a general question, seeking clarification, or just conversing without requesting a direct code change.
    
    Output ONLY the word: 'planner', 'editor', 'debugger', or 'chatter'.
    """
    
    try:
        response = llm.invoke([
            SystemMessage(content=first_prompt),
            HumanMessage(content=f"User Intent: {user_intent}\nHas existing files: {bool(files)}")
        ])
        decision = response.content.strip().lower()
        
        if "planner" in decision: return "planner"
        if "editor" in decision: return "editor"
        if "debugger" in decision: return "debugger" 
        if "chatter" in decision: return "chatter"
    except Exception as e:
        print(f"Routing Error: {e}")
        
    # Fallback logic
    if "new project" in user_intent or "restart" in user_intent:
        return "planner"
    if "fix" in user_intent or "error" in user_intent or "bug" in user_intent:
        return "debugger"
    return "editor"
