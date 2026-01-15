from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

def run_debugger_analyzer(state: CodebaseState):
    """
    Analyze files specifically for debugging or explanation.
    """
    llm = get_llm()
    # In a real implementation, this would look at the files and the errors
    # and provide a concise summary or identify specific lines.
    
    return {
        "current_step": "debug_analysis_complete"
    }
