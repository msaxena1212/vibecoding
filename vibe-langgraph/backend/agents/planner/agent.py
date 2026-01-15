from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

def run_planner(state: CodebaseState):
    """
    Break user intent into a technical plan.
    """
    llm = get_llm()
    if not llm:
        return {"messages": ["Error: LLM not configured"]}
        
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    with open("backend/agents/planner/prompt.md", "r") as f:
        system_prompt = f.read()
        
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"User Request: {user_intent}")
    ]
    
    response = llm.invoke(messages)
    
    # Extract token usage
    tokens = 0
    if response and hasattr(response, "usage_metadata") and response.usage_metadata:
        tokens = response.usage_metadata.get("total_tokens", 0)
    current_tokens = state.get("total_tokens", 0)
    
    # Parse the response content as JSON
    import json
    import re
    
    content = response.content
    if isinstance(content, list):
        # Join list items if they are text parts, or extract text
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
        
    print(f"DEBUG: Planner Raw Output: {content[:100]}...") # Log start of output
    
    # Try to extract JSON block if exists
    json_match = re.search(r"```(?:json)?\n(.*?)\n```", content, re.DOTALL)
    if json_match:
        content = json_match.group(1)
    else:
        # Fallback: finding first { and last }
        start = content.find('{')
        end = content.rfind('}')
        if start != -1 and end != -1:
            content = content[start:end+1]
        else:
             print("DEBUG: No JSON block or braces found.")
        
    try:
        plan = json.loads(content)
        # Basic validation
        if not isinstance(plan, dict):
            raise ValueError("Plan is not a dictionary")
        if "files" not in plan:
            # Maybe the LLM used a different key?
            if "project_structure" in plan:
                plan["files"] = plan["project_structure"]
            else:
                plan["files"] = []
                
        return {
            "current_step": "planning_complete", 
            "plan": plan, 
            "mode": plan.get("mode", "generate"),
            "framework": plan.get("framework", {"name": "react", "version": "18"}),
            "conversation": {
                "messages": state.get("messages", []),
                "lastAgentResponse": plan.get("plan_summary", "")
            },
            "total_tokens": current_tokens + tokens,
            "gemini_hits": state.get("gemini_hits", 0) + 1,
            "errors": []
        } 
    except Exception as e:
        print(f"Error parsing plan: {e}")
        print(f"DEBUG: Content that failed: {content[:500]}")
        return {
            "current_step": "planning_error", 
            "total_tokens": current_tokens + tokens,
            "gemini_hits": state.get("gemini_hits", 0) + 1,
            "errors": [f"Planner Error: {str(e)}"]
        }
