from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState

def run_generator(state: CodebaseState):
    errors = state.get("errors", [])
    if errors:
        return {"current_step": "generation_skipped_due_to_error"}

    llm = get_llm()
    plan = state.get("plan", {})
    files_to_create = plan.get("filesToCreate", []) # Use the explicit list from HOW_IT_WORKS plan structure
    
    # Fallback if the Planner didn't use the new key yet
    if not files_to_create:
        files_to_create = [f.get("path") for f in plan.get("files", [])]
    
    generated_files = state.get("files", {}).copy()
    total_tokens = state.get("total_tokens", 0)
    
    with open("backend/agents/generator/prompt.md", "r") as f:
        system_prompt_template = f.read()

    user_intent = state.get("userIntent", "")
    vibe = plan.get("vibe", {})
    
    for path in files_to_create:
        # If files_to_create is list of strings, just use it. If list of dicts, extract path.
        if isinstance(path, dict):
            file_info = path
            path = file_info.get("path")
            description = file_info.get("description", "Generate file content")
        else:
            description = f"Generate {path} as specified in the plan."
        
        print(f"Generating {path}...")
        
        prompt_content = f"""USER INTENT: {user_intent}

DESIGN VIBE:
- Style: {vibe.get('style')}
- Colors: {vibe.get('colors')}
- Typography: {vibe.get('typography')}
- Animations: {vibe.get('animations')}

FILE TO GENERATE: {path}
DESCRIPTION: {description}

EXISTing STATE (Files already created): {list(generated_files.keys())}

IMPORTANT: Write the code for this file ensuring it aligns with the USER INTENT and the DESIGN VIBE above. Use high-quality placeholders and real Unsplash images.
"""
        
        messages = [
            SystemMessage(content=system_prompt_template),
            HumanMessage(content=prompt_content)
        ]
        
        response = llm.invoke(messages)
        
        # Extract token usage
        if response and hasattr(response, "usage_metadata") and response.usage_metadata:
            total_tokens += response.usage_metadata.get("total_tokens", 0)
            
        content = response.content
        if isinstance(content, list):
            content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
        
        # Strip markdown code blocks if present
        import re
        code_match = re.search(r"```(?:\w+)?\n(.*?)\n```", content, re.DOTALL)
        if code_match:
            content = code_match.group(1)
            
        # Robustness: ensure content is a string and not a stray dict
        if isinstance(content, dict):
             content = content.get("content", str(content))
        else:
             content = str(content)

        generated_files[path] = {
            "content": content,
            "language": "python" if path.endswith(".py") else "javascript",
            "imports": [],
            "exports": [],
            "artifactType": "code",
            "generatedBy": "generator",
            "lastEditedBy": "generator"
        }
        
    return {
        "files": generated_files, 
        "current_step": "generation_complete", 
        "total_tokens": total_tokens,
        "gemini_hits": state.get("gemini_hits", 0) + len(files_to_create)
    }
