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
