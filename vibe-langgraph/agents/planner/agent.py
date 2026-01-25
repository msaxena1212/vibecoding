from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_llm, extract_tokens
from graph.state import CodebaseState

from utils.formatter import parse_json_dict
import json
import re

async def run_planner(state: CodebaseState):
    """
    Break user intent into a technical plan.
    """
    llm = get_llm()
    if not llm:
        return {"messages": ["Error: LLM not configured"]}
        
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    with open("agents/planner/prompt.md", "r", encoding="utf-8") as f:
        system_prompt = f.read()
        
    history_list = state.get("messages", [])
    history_text = ""
    from langchain_core.messages import BaseMessage
    
    for msg in history_list:
        content_str = ""
        role = "User"
        if isinstance(msg, HumanMessage):
            content_str = msg.content
            if "[TASK_TYPE]" in str(content_str): 
                continue
        elif isinstance(msg, dict):
            role = "User" if msg.get("role") == "user" else "AI"
            content_str = msg.get("content", "")
        else:
            role = "AI"
            content_str = msg.content
        history_text += f"{role}: {content_str}\n"

    # Limit context
    recent_history = "\n".join(history_text.split('\n')[-30:])
    
    existing_files = list(state.get("files", {}).keys())
    existing_context = f"\n\nEXISTING FILES:\n{', '.join(existing_files)}" if existing_files else ""
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Conversation History:\n{recent_history}\n\nCurrent User Request: {user_intent}{existing_context}")
    ]
    
    response = await llm.ainvoke(messages)
    tokens = extract_tokens(response)
    
    # Parse the response content as JSON robustly
    content = response.content
    with open("planner_raw.txt", "w", encoding="utf-8") as f:
        f.write(content)
        
    with open("planner_debug.txt", "w", encoding="utf-8") as f:
        f.write(f"USER INTENT: {user_intent}\n")
        f.write(f"HISTORY LEN: {len(history_list)}\n")
        f.write(f"HISTORY PREVIEW: {recent_history[:200]}...\n")
    
    print(f"DEBUG: Planner Raw Output length: {len(content)}")
    
    plan = parse_json_dict(content)
    
    if not plan:
        print("[ERROR] Planner failed to generate a valid JSON plan.")
        return {
            "current_step": "planning_error",
            "total_tokens": tokens,
            "token_usage": {"planner": tokens}
        }

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
        "assignments": plan.get("assignments", []),
        "total_tokens": tokens,
        "token_usage": {"planner": tokens}
    }
