from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

def run_fetch_images(state: CodebaseState):
    """
    Fetch images from Unsplash or decide to use image_generator.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    
    prompt = """You are an image curator. 
Your mission is to find high-quality image placeholders for the user's application.
Based on the user request, identify 3-5 keywords for images.
Return a JSON list of objects with 'keyword' and 'description'.
If you think specific custom assets are better than stock photos, indicate that we need custom generation.
"""
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Request: {user_intent}")
    ]
    
    response = llm.invoke(messages)
    content = response.content
    if isinstance(content, list):
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
        
    import json
    import re
    keywords = []
    json_match = re.search(r"(\[.*\])", content, re.DOTALL)
    
    images = []
    if json_match:
        try:
            keywords = json.loads(json_match.group(1))
            for item in keywords:
                kw = item.get("keyword", "placeholder")
                # Using Unsplash source for dynamic placeholders
                url = f"https://images.unsplash.com/photo-1?auto=format&fit=crop&q=80&w=800&q=keyword={kw}"
                images.append({
                    "url": url,
                    "alt": item.get("description", kw)
                })
        except:
             pass

    return {
        "images": images,
        "current_step": "images_fetched"
    }
