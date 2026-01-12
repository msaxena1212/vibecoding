from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_llm
from graph.state import CodebaseState

async def run_planner(state: CodebaseState):
    """
    Break user intent into a technical plan.
    """
    llm = get_llm()
    if not llm:
        return {"messages": ["Error: LLM not configured"]}
        
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    with open("agents/planner/prompt.md", "r") as f:
        system_prompt = f.read()
        
    history = state.get("messages", [])
    messages = [
        SystemMessage(content=system_prompt)
    ] + history + [
        HumanMessage(content=f"User Request: {user_intent}")
    ]
    
    response = await llm.ainvoke(messages)
    
    # Extract token usage
    tokens = response.usage_metadata.get("total_tokens", 0) if hasattr(response, "usage_metadata") else 0
    current_tokens = state.get("total_tokens", 0)
    
    # Parse the response content as JSON
    import json
    import re
    
    content = response.content
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
        # Store files in a temporary state key for the generator (or update userIntent/messages)
        # For this state schema, we might need a place to put the plan. 
        # let's modify the state schema in a separate step if needed, but for now we can pass it in messages or a new key 'plan'
        # But wait, CodebaseState has 'files' which is Dict[str, FileState]. 
        # We want to PREPARE the keys in 'files' but maybe empties?
        reasoning_obj = plan.get("reasoning", {})
        reasoning_text = f"{reasoning_obj.get('brand_tone', '')}\n\n{reasoning_obj.get('architectural_logic', '')}\n\n{reasoning_obj.get('ux_strategy', '')}"
        
        return {
            "current_step": "planning_complete", 
            "plan": plan, 
            "reasoning": reasoning_text,
            "plan_summary": plan.get("plan_summary", ""),
            "design_tokens": plan.get("design_tokens", {}),
            "mock_data": plan.get("mock_data", {}),
            "images_to_generate": plan.get("images_to_generate", []),
            "total_tokens": tokens,
            "token_usage": {"planner": tokens}
        } 
    except Exception as e:
        print(f"Error parsing plan: {e}")
        error_msg = str(response.content) if 'response' in locals() else str(e)
        return {"messages": [error_msg], "current_step": "planning_error", "total_tokens": current_tokens + tokens}
