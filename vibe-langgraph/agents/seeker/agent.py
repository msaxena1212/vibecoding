from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_seeker(state: CodebaseState):
    """
    Performs research to enrich the project state.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    # Load prompt
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "prompt.md")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt = f.read()

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Intent: {user_intent}")
    ]
    
    response = await llm.ainvoke(messages)
    content = response.content
    
    findings = []
    try:
        data = parse_json_dict(content)
        findings = data.get("findings", [])
    except Exception as e:
        print(f"[FAIL] Seeker failed to parse findings: {e}")

    tokens = extract_tokens(response)

    # Add findings to state (could be used by Planner or Generator)
    current_reasoning = state.get("reasoning", "")
    new_reasoning = current_reasoning + "\n\n### Research Findings:\n" + json.dumps(findings, indent=2)

    return {
        "reasoning": new_reasoning,
        "current_step": "research_complete",
        "total_tokens": tokens,
        "token_usage": {"seeker": tokens}
    }
