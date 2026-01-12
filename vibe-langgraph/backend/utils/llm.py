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
            with open("backend/configs/models.yaml", "r") as f:
                config = yaml.safe_load(f)
                model_name = config.get("models", {}).get(agent_name, "models/gemini-1.5-flash")
        except Exception as e:
            print(f"Warning: Could not load models.yaml, defaulting to gemini-1.5-flash. Error: {e}")
            model_name = "models/gemini-1.5-flash"

    # Map common model names if needed, or just pass through
    if "gpt" in model_name:
        model_name = "models/gemini-1.5-flash"
        
    return ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key)
