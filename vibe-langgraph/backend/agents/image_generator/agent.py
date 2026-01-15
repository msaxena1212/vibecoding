from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

def run_image_generator(state: CodebaseState):
    """
    Generate technical AI image prompts for brand assets.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    plan = state.get("plan", {})
    
    prompt = """You are a specialist in AI image prompting and brand identity. 
Your mission is to translate asset requests into ultra-vivid, cinematic, and technically precise prompts for image generation.
Identify 3-5 key image assets needed for this project (e.g. Hero background, product shots).
For each asset, provide a detailed prompt optimized for Midjourney or Stable Diffusion.
Output ONLY a JSON array of strings.
"""
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Request: {user_intent}\nProject Plan: {plan}")
    ]
    
    response = llm.invoke(messages)
    content = response.content
    if isinstance(content, list):
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
        
    # Extract JSON
    import json
    import re
    prompts = []
    json_match = re.search(r"(\[.*\])", content, re.DOTALL)
    if json_match:
        try:
            prompts = json.loads(json_match.group(1))
        except:
             prompts = [content]
    else:
        prompts = [content]

    return {
        "image_prompts": prompts,
        "current_step": "image_prompts_complete"
    }
