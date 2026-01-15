from typing import Dict, Any, List, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

def run_router(state: CodebaseState):
    """
    Classify user intent and route the workflow accordingly.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    with open("backend/agents/router/prompt.md", "r") as f:
        system_prompt = f.read()
        
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"User Request: {user_intent}")
    ]
    
    response = llm.invoke(messages)
    if not response:
         return {"errors": ["Router Error: LLM returned no response"]}

    content = response.content
    tokens = response.usage_metadata.get("total_tokens", 0) if hasattr(response, "usage_metadata") else 0
    if isinstance(content, list):
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
    
    import json
    import re
    
    # Extract JSON
    json_match = re.search(r"({.*})", content, re.DOTALL)
    if json_match:
        try:
            router_output = json.loads(json_match.group(1))
        except:
            router_output = {
                "primaryMode": "explain",
                "confidence": 0.5,
                "reasoning": "Fallback due to JSON parsing error"
            }
    else:
        router_output = {
            "primaryMode": "explain",
            "confidence": 0.5,
            "reasoning": "Fallback due to no JSON found"
        }
        
    # Update state with the new structure
    return {
        "intent": router_output,
        "mode": router_output.get("primaryMode", "generate"), # Backward compatibility
        "current_step": "intent_routed",
        "total_tokens": state.get("total_tokens", 0) + tokens,
        "gemini_hits": state.get("gemini_hits", 0) + 1
    }
