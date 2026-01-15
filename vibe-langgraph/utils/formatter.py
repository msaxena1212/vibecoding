from typing import Any, Dict, List
from langchain_core.messages import BaseMessage

def sanitize_state(state: Any) -> Any:
    """
    Recursively convert non-serializable objects (like LangChain messages) 
    to plain dictionaries or strings.
    """
    if isinstance(state, dict):
        return {k: sanitize_state(v) for k, v in state.items()}
    elif isinstance(state, list):
        return [sanitize_state(v) for v in state]
    elif isinstance(state, BaseMessage):
        # Convert LangChain message to a simple dict
        return {
            "type": state.type,
            "content": state.content,
            "additional_kwargs": getattr(state, "additional_kwargs", {})
        }
    elif hasattr(state, "dict") and callable(state.dict):
        # Handle objects with a .dict() method (like Pydantic models)
        return sanitize_state(state.dict())
    else:
        # Fallback to string if not easily serializable
        try:
            import json
            json.dumps(state)
            return state
        except (TypeError, OverflowError):
            return str(state)

def parse_json_dict(content: str) -> dict:
    """
    Robustly extract and parse a dictionary from LLM output.
    Handles markdown blocks and accidental list wraps.
    """
    import json
    import re
    
    # 1. Try to find JSON block
    json_match = re.search(r"```json\n?(.*?)\n?```", content, re.DOTALL)
    if json_match:
        content = json_match.group(1).strip()
    else:
        # Fallback to finding the first { and last }
        json_match = re.search(r"(\{.*\})", content, re.DOTALL)
        if json_match:
            content = json_match.group(1).strip()

    try:
        data = json.loads(content)
        # If it's a list with one item, unwrap it
        if isinstance(data, list) and len(data) > 0:
            if isinstance(data[0], dict):
                return data[0]
        # If it's a dict, return it
        if isinstance(data, dict):
            return data
    except Exception:
        pass
        
    return {}
