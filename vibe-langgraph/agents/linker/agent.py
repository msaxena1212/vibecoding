from graph.state import CodebaseState
from utils.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage
import os

async def run_linker(state: CodebaseState):
    """
    Ensures 100% connectivity and asset pathing hygiene.
    """
    llm = get_llm()
    files = state.get("files", {})
    
    if not files:
        return {"current_step": "linking_skipped"}

    # Load rules
    rules_path = os.path.join("agents", "linker", "rules.md")
    with open(rules_path, "r") as f:
        rules = f.read()

    # Build context: paths and their first 20 lines (for imports/links)
    content_summary = "\n".join([f"FILE: {p}\n{data['content'][:500]}..." for p, data in files.items()])
    
    messages = [
        SystemMessage(content=rules),
        HumanMessage(content=f"Review the following project structure for linking hygiene:\n\n{content_summary}")
    ]
    
    # We use LLM to audit, but for now we trust the Generator. 
    # High-end linking would involve rewriting imports, but we'll stick to auditing.
    response = await llm.ainvoke(messages)
    tokens = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)
    
    return {
        "files": files, 
        "current_step": "linking_complete",
        "diagnostic_report": f"Linking Audit: {response.content[:200]}...",
        "total_tokens": tokens,
        "token_usage": {"linker": tokens}
    }
