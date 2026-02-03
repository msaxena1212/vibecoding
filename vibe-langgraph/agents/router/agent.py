from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_router(state: CodebaseState):
    """
    Intelligently routes the user request to the appropriate starting agent.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    files = list(state.get("files", {}).keys())
    
    # Load prompt
    # Load prompt
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "prompt.md")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt = f.read()

    # Build clean history
    history_text = ""
    messages_list = state.get("messages", []) or []
    
    for msg in messages_list:
        role = "UNKNOWN"
        content_str = ""
        
        if isinstance(msg, HumanMessage):
            role = "User"
            content_str = str(msg.content)
        elif isinstance(msg, AIMessage):
            role = "AI"
            content_str = str(msg.content)
        elif isinstance(msg, dict):
             role = "User" if msg.get("role") == "user" else "AI"
             content_str = msg.get("content", "")
        else:
            role = "System"
            content_str = str(getattr(msg, "content", msg))
            
        if content_str.strip():
            history_text += f"{role}: {content_str}\n"

    # Last 20 interactions for deep context
    history_lines = history_text.split('\n')
    recent_history = "\n".join(history_lines[-40:]) # Increased window

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"CONVERSATION HISTORY:\n---\n{recent_history}\n---\n\nCURRENT USER REQUEST: {user_intent}\nEXISTING PROJECT FILES: {files}")
    ]
    
    from utils.llm import resilient_call
    response = await resilient_call(llm.ainvoke, messages)
    content = response.content.strip()
    
    route = "planner" # Default
    data = parse_json_dict(content)
    route = data.get("route", "planner")
    framework = data.get("framework", "react")

    tokens = extract_tokens(response)

    return {
        "current_step": route,
        "framework": framework,
        "total_tokens": tokens,
        "token_usage": {"router": tokens},
        "model_calls": 1
    }
