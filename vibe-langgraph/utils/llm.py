from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
import os
from dotenv import load_dotenv

load_dotenv()

import yaml

def get_llm(model_name: str = None, agent_name: str = "planner"):
    """
    Factory to get the LLM instance.
    Uses Google Gemini.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Warning: GOOGLE_API_KEY not found in environment.")
        return None
        
    # Load config if model_name not explicit
    if not model_name:
        try:
            # Robustly resolve path relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_dir, "configs", "models.yaml")
            
            with open(config_path, "r") as f:
                config = yaml.safe_load(f)
                model_name = config.get("models", {}).get(agent_name, "models/gemini-1.5-flash")
        except Exception as e:
            print(f"Warning: Could not load models.yaml, defaulting to gemini-1.5-flash. Error: {e}")
            model_name = "models/gemini-1.5-flash"

    return ChatGoogleGenerativeAI(
        model=model_name, 
        google_api_key=api_key,
        max_retries=10,
        timeout=60
    )

async def resilient_call(ainvoke_fn, messages):
    """
    Wrapper to handle transient LLM connection errors with retries.
    """
    import asyncio
    from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
    import httpx
    
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.RemoteProtocolError, httpx.ReadTimeout, httpx.ConnectError, Exception)),
        before_sleep=lambda retry_state: print(f"[RETRY] LLM call failed. Attempt {retry_state.attempt_number}. Retrying in {retry_state.next_action.sleep}s...")
    )
    async def _call():
        return await ainvoke_fn(messages)
    
    return await _call()

def extract_tokens(response) -> int:
    """
    Robustly extract total tokens from various response metadata formats.
    """
    try:
        # Check usage_metadata first (modern LangChain)
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            usage = response.usage_metadata
            if isinstance(usage, dict):
                return usage.get("total_tokens", 0)
            if hasattr(usage, "total_tokens"):
                return usage.total_tokens

        # Check response_metadata (legacy/alternative)
        if hasattr(response, "response_metadata") and response.response_metadata:
            meta = response.response_metadata
            # If it's a dict
            if hasattr(meta, "get"):
                token_usage = meta.get("token_usage")
                if token_usage and hasattr(token_usage, "get"):
                    return token_usage.get("total_tokens", 0)
            
            # If it's a list (some LangChain versions)
            if isinstance(meta, list):
                for item in meta:
                    if hasattr(item, "get") and "token_usage" in item:
                        token_usage = item.get("token_usage")
                        if token_usage and hasattr(token_usage, "get"):
                            return token_usage.get("total_tokens", 0)
            
    except Exception as e:
        # Warning: Failed to extract tokens: {e}
        pass
    return 0
