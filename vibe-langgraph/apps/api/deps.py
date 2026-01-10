from utils.llm import get_llm
from memory.project_store import project_store

def get_llm_service():
    return get_llm()

def get_project_store():
    return project_store
