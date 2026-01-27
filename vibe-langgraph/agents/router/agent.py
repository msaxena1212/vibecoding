from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
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

    # Extract task type hint if present
    # Extract task type hint and history
    task_type_hint = "unknown"
    history_text = ""
    messages_list = state.get("messages", [])
    
    from langchain_core.messages import BaseMessage
    
    for msg in messages_list:
        content_str = ""
        if isinstance(msg, HumanMessage):
            content_str = msg.content
            if "[TASK_TYPE]" in str(content_str):
                task_type_hint = str(content_str).replace("[TASK_TYPE]", "").strip()
                continue # Don't add hint to history text
            role = "User"
        elif isinstance(msg, dict): # Fallback if dicts
             role = "User" if msg.get("role") == "user" else "AI"
             content_str = msg.get("content", "")
        else:
            role = "AI"
            content_str = msg.content
            
        history_text += f"{role}: {content_str}\n"

    # Use last 10 messages for context window efficiency
    history_lines = history_text.split('\n')
    recent_history = "\n".join(history_lines[-20:])

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"Conversation History:\n{recent_history}\n\nUser Intent: {user_intent}\nExisting Files: {files}\nTask Type Hint: {task_type_hint}")
    ]
    
    response = await llm.ainvoke(messages)
    content = response.content
    
    route = "planner" # Default
    data = parse_json_dict(content)
    route = data.get("route", "planner")

    tokens = extract_tokens(response)

    return {
        "current_step": route,
        "total_tokens": tokens,
        "token_usage": {"router": tokens}
    }
