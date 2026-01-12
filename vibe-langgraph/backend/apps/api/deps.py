from backend.utils.llm import get_llm
from backend.memory.project_store import project_store

def get_llm_service():
    return get_llm()

def get_project_store():
    return project_store
