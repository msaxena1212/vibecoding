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
    prompt_path = os.path.join("agents", "router", "prompt.md")
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt = f.read()

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Intent: {user_intent}\nExisting Files: {files}")
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
