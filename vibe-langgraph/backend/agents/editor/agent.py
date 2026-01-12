from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState
import json
import re

def run_editor(state: CodebaseState):
    """
    Modify existing code based on user intent.
    """
    llm = get_llm()
    user_intent = state.get("userIntent", "")
    existing_files = state.get("files", {})
    
    # Load prompt
    with open("backend/agents/editor/prompt.md", "r") as f:
        system_prompt = f.read()
        
    # Build context for LLM using only relevant files
    relevant_paths = state.get("plan", {}).get("relevant_files", [])
    if not relevant_paths:
        relevant_paths = list(existing_files.keys()) # Fallback
        
    file_context = "\n".join([
        f"--- FILE: {path} ---\n{existing_files[path]['content']}" 
        for path in relevant_paths if path in existing_files
    ])
    
    vibe = state.get("plan", {}).get("vibe", {})
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"""USER INTENT: {user_intent}

DESIGN VIBE:
- Style: {vibe.get('style')}
- Colors: {vibe.get('colors')}
- Typography: {vibe.get('typography')}
- Animations: {vibe.get('animations')}

RELEVANT SOURCE FILES:
{file_context}
""")
    ]
    
    response = llm.invoke(messages)
    content = response.content
    if isinstance(content, list):
        content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
    
    # Extract token usage
    tokens = response.usage_metadata.get("total_tokens", 0) if hasattr(response, "usage_metadata") else 0
    current_tokens = state.get("total_tokens", 0)
    
    # Simple JSON extraction
    json_match = re.search(r"```(?:json)?\n(.*?)\n```", content, re.DOTALL)
    if json_match:
        content = json_match.group(1)
    
    try:
        data = json.loads(content)
        modified_files = data.get("files", {})
        
        # Merge changes back into state
        new_files = existing_files.copy()
        for path, new_content in modified_files.items():
            if path in new_files:
                new_files[path]["content"] = new_content
                new_files[path]["lastEditedBy"] = "editor"
            else:
                # Handle new file creation during edit if requested
                new_files[path] = {
                    "content": new_content,
                    "language": "python" if path.endswith(".py") else "javascript",
                    "imports": [],
                    "exports": [],
                    "lastEditedBy": "editor"
                }
                
        return {"files": new_files, "current_step": "editing_complete", "total_tokens": current_tokens + tokens}
    except Exception as e:
        print(f"Error parsing editor response: {e}")
        return {"current_step": "editing_error", "errors": [str(e)], "total_tokens": current_tokens + tokens}
