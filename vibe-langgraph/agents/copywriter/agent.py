import os
from graph.state import CodebaseState
from utils.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage
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
    with open(prompt_path, "r") as f:
        system_prompt = f.read()

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"User Intent: {user_intent}\nDesign Tokens: {json.dumps(design_tokens)}\nMock Data: {json.dumps(mock_data)}")
    ]

    response = await llm.ainvoke(messages)
    content = response.content
    tokens = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)
    
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        copy_data = json.loads(content)
        return {
            "copy_data": copy_data,
            "reasoning": copy_data.get("reasoning", "Refining brand voice..."),
            "current_step": "copywriting_complete",
            "total_tokens": tokens,
            "token_usage": {"copywriter": tokens}
        }
    except:
        return {
            "current_step": "copywriting_failed",
            "total_tokens": tokens,
            "token_usage": {"copywriter": tokens}
        }
