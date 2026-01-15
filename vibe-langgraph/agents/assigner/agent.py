from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_assigner(state: CodebaseState):
    """
    Assigns tasks to specific agents based on the current state.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    plan = state.get("plan", {})
    
    # Load prompt
    prompt_path = os.path.join("agents", "assigner", "prompt.md")
    with open(prompt_path, "r") as f:
        prompt = f.read()

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Intent: {user_intent}\nCurrent Plan: {json.dumps(plan)}")
    ]
    
    response = await llm.ainvoke(messages)
    content = response.content
    
    data = parse_json_dict(content)
    assignments = data.get("assignments", [])

    tokens = extract_tokens(response)

    return {
        "plan": {**plan, "assignments": assignments},
        "current_step": "assignments_complete",
        "diagnostic_report": f"Assigner: Made {len(assignments)} assignments.",
        "total_tokens": tokens,
        "token_usage": {"assigner": tokens}
    }
