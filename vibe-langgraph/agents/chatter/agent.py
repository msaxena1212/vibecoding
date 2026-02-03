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
    # Load prompt
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "prompt.md")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt = f.read()

    # Build history context (Prod-Ready Formatting)
    history_text = ""
    from langchain_core.messages import BaseMessage
    
    for m in messages_history[-10:]: # Increase context to last 10 messages
        role = "User"
        content = ""
        
        if isinstance(m, dict):
            role_raw = m.get("role", "user")
            role = "AI" if role_raw == "assistant" else "User"
            content = m.get("content", "")
        elif isinstance(m, BaseMessage):
            role = "AI" if m.type == "ai" or m.type == "assistant" else "User"
            content = m.content
        else:
             continue
             
        history_text += f"{role}: {content}\n"
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=f"Conversation History:\n{history_text}\n\nCurrent User Request: {user_intent}")
    ]

    # --- VECTOR SEARCH INTEGRATION ---
    try:
        from utils.vector_store import VectorStore
        # Assuming run form root, .chroma_db is in root
        vs = VectorStore(collection_name="codebase_index", persist_directory="./.chroma_db")
        if vs.count() > 0:
            print(f"[Chatter] Searching vector store for: {user_intent}")
            results = vs.search(user_intent, n_results=3)
            if results:
                context_str = "\n\n### Relevant Codebase Context:\n"
                for res in results:
                    source = res['metadata'].get('source', 'Unknown')
                    snippet = res['content'][:1000] # Limit snippet size
                    context_str += f"File: {source}\nContent:\n{snippet}\n---\n"
                
                # Append context to the last message (HumanMessage)
                messages[-1].content += context_str
    except Exception as e:
        print(f"[Chatter] Vector search skipped or failed: {e}")
    # ---------------------------------
    
    from utils.llm import resilient_call
    response = await resilient_call(llm.ainvoke, messages)
    
    data = parse_json_dict(response.content)
    chat_response = data.get("response", "Processing request...")
    suggested_actions = data.get("suggested_actions", [])
    
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
        "token_usage": {"chatter": tokens},
        "model_calls": 1,
        "suggested_actions": suggested_actions
    }
