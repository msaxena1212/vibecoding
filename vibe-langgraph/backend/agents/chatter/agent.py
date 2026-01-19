from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_chatter(state: CodebaseState):
    """
    Communicates with the user.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    messages_history = state.get("messages", [])
    
    # Load prompt
    prompt_path = os.path.join("agents", "chatter", "prompt.md")
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt = f.read()

    # Build history context
    history = "\n".join([str(m) for m in messages_history[-5:]])
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"History:\n{history}\n\nUser Request: {user_intent}")
    ]
    
    response = await llm.ainvoke(messages)
    content = response.content
    
    data = parse_json_dict(content)
    chat_response = data.get("response", "Processing request...")
    if not chat_response or chat_response == "Processing request...":
        # Fallback to direct content if JSON parsing didn't yield a structured response
        chat_response = content

    tokens = extract_tokens(response)

    # Add to message history
    messages_history.append({"role": "assistant", "content": chat_response})

    return {
        "messages": messages_history,
        "current_step": "chat_complete",
        "total_tokens": tokens,
        "token_usage": {"chatter": tokens}
    }
