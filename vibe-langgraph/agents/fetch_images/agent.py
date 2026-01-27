from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_fetch_images(state: CodebaseState):
    """
    Sourcing visual assets for the project.
    """
    llm = get_llm()
    images_to_generate = state.get("images_to_generate", [])
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    # Load prompt
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "prompt.md")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt = f.read()

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Intent: {user_intent}\nImages to Source: {json.dumps(images_to_generate)}")
    ]
    
    response = await llm.ainvoke(messages)
    content = response.content
    
    assets = []
    try:
        data = parse_json_dict(content)
        assets = data.get("assets", [])
    except Exception as e:
        print(f"[FAIL] Fetch Images failed to parse assets: {e}")

    tokens = extract_tokens(response)

    # In a real app, we might download these. For now, we update the state.
    current_images = state.get("images_to_generate", [])
    for asset in assets:
        current_images.append({
            "path": asset.get("path"),
            "prompt": asset.get("description"),
            "url": asset.get("url")
        })

    return {
        "images_to_generate": current_images,
        "current_step": "assets_sourced",
        "total_tokens": tokens,
        "token_usage": {"fetch_images": tokens}
    }
