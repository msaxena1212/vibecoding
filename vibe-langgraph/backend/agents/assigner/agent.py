from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

def run_assigner(state: CodebaseState):
    """
    Assign specialized agents for the task based on user intent.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    print(f"DEBUG: Node: assigner, Intent: {user_intent}")
    prompt = """You are the VibePlatform Orchestrator. 
Your task is to assign specialized agents for the following user request.
Available Agents:
- 'ui_specialist': Focuses on stunning aesthetics, Apple-style design, and glassmorphism.
- 'backend_architect': Focuses on data structures, API design, and logic flows.
- 'copywriter': master of conversion-focused storytelling. Compelling, professional copy.
- 'image_generator': AI image prompting and brand identity. Cinematic prompts.
- 'seo_specialist': technical SEO, page speed, and accessibility auditor.
- 'fetch_images': fetches images from Unsplash/Freepik.
- 'interaction_designer': Focuses on micro-animations, transitions, and UX feel.

Based on the user request, assign relevant agents. Note: image_generator should only be used if custom assets are requested or if stock photos won't suffice.
Output ONLY a JSON object with the keys as agent names and values as a brief instruction for each.
Example: {"ui_specialist": "Create a sleek dark mode dashboard", "copywriter": "Write professional marketing copy", "fetch_images": "Find stock photos for a coffee shop"}
"""
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"User Request: {user_intent}")
    ]
    
    response = llm.invoke(messages)
    content = response.content
    if isinstance(content, list):
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
    
    # Extract JSON
    import json
    import re
    json_match = re.search(r"({.*})", content, re.DOTALL)
    if json_match:
        try:
            agent_config = json.loads(json_match.group(1))
            if not isinstance(agent_config, dict):
                agent_config = {"ui_specialist": "General guidance"}
        except:
            agent_config = {"ui_specialist": "General guidance"}
    else:
        agent_config = {"ui_specialist": "General guidance"}
        
    return {
        "agent_config": agent_config,
        "current_step": "agents_assigned"
    }
