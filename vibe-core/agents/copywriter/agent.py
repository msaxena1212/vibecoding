import os
from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json

async def run_copywriter(state: CodebaseState):
    """
    Refines project content for brand voice and conversion.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    design_tokens = state.get("design_tokens", {})
    mock_data = state.get("mock_data", {})
    
    # Load system prompt
    prompt_path = os.path.join("agents", "copywriter", "prompt.md")
    with open(prompt_path, "r", encoding="utf-8") as f:
        system_prompt = f.read()

    reasoning = state.get("reasoning", "")
    plan_summary = state.get("plan_summary", "")

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"User Intent: {user_intent}\nPlanning Reasoning: {reasoning}\nPlan Summary: {plan_summary}\nDesign Tokens: {json.dumps(design_tokens)}\nMock Data: {json.dumps(mock_data)}")
    ]

    response = await llm.ainvoke(messages)
    content = response.content
    tokens = extract_tokens(response)
    
    data = parse_json_dict(content)
    # Ensure reasoning is preserved or updated
    final_reasoning = reasoning + "\n\n### Copywriter Strategy:\n" + data.get("reasoning", "Refining brand voice...")

    return {
        "copy_data": data,
        "reasoning": final_reasoning,
        "current_step": "copywriting_complete",
        "total_tokens": tokens,
        "token_usage": {"copywriter": tokens}
    }
