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
    
    system_prompt = """You are the Vibe-LangGraph Assistant. 
    The user is asking a general question about their project, coding, or the platform.
    Answer concisely and helpfully. 
    If they are asking to change code, tell them to be more specific or that you are currently in chat mode and they should ask for a specific code change.
    Do NOT output any code blocks unless specifically asked for an example.
    Keep the conversation focused on helping the user build their application.
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
        
    tokens = response.usage_metadata.get("total_tokens", 0) if hasattr(response, "usage_metadata") else 0
    current_tokens = state.get("total_tokens", 0)
    
    # Add assistant response to messages for persistence
    new_messages = messages + [{"role": "assistant", "content": content}]
    
    return {
        "messages": new_messages, 
        "current_step": "chatting_complete", 
        "total_tokens": current_tokens + tokens
    }
