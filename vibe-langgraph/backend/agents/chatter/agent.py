from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

def run_chatter(state: CodebaseState):
    """
    Handle general conversation without modifying code.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    messages = state.get("messages", [])
    
    system_prompt = """You are the Vibe-LangGraph Assistant, a proactive, creative, and highly constructive pair programmer.
    Your mission is to inspire the user and help them architect world-class applications.
    Be engaging, professional, and full of positive vibes.
    When the user asks questions, provide insightful, high-level guidance.
    If they are asking to change code, explain that you're currently in chat mode and encourage them to describe the specific vibe or feature they want to implement so the Planner can take over.
    Do NOT output large code blocks; focus on logic, structure, and "vibes".
    Always end your response with a constructive next step or a thought-provoking question about their project.
    """
    
    # Build history context
    history = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in messages[-5:]])
    
    prompt = f"Previous conversation:\n{history}\n\nUser Question: {user_intent}"
    
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=prompt)
    ])
    
    content = response.content
    if isinstance(content, list):
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
        
    tokens = 0
    if response and hasattr(response, "usage_metadata") and response.usage_metadata:
        tokens = response.usage_metadata.get("total_tokens", 0)
    current_tokens = state.get("total_tokens", 0)
    
    # Add assistant response to messages for persistence
    new_messages = messages + [{"role": "assistant", "content": content}]
    
    return {
        "conversation": {
            "messages": new_messages,
            "lastAgentResponse": content
        },
        "messages": new_messages, # Keep for compatibility
        "current_step": "chatting_complete", 
        "total_tokens": current_tokens + tokens,
        "gemini_hits": state.get("gemini_hits", 0) + 1
    }
