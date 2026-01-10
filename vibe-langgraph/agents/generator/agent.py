from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_llm
from graph.state import CodebaseState

def run_generator(state: CodebaseState):
    llm = get_llm()
    plan = state.get("plan", {})
    files_to_create = plan.get("files", [])
    
    generated_files = state.get("files", {}).copy()
    total_tokens = state.get("total_tokens", 0)
    
    with open("agents/generator/prompt.md", "r") as f:
        system_prompt_template = f.read()

    for file_info in files_to_create:
        path = file_info.get("path")
        description = file_info.get("description")
        
        print(f"Generating {path}...")
        
        messages = [
            SystemMessage(content=system_prompt_template),
            HumanMessage(content=f"Generate the file: {path}\nDescription: {description}\n\nExisting State: {str(generated_files.keys())}")
        ]
        
        response = llm.invoke(messages)
        
        # Extract token usage
        if hasattr(response, "usage_metadata"):
            total_tokens += response.usage_metadata.get("total_tokens", 0)
            
        content = response.content
        
        # Strip markdown code blocks if present
        import re
        code_match = re.search(r"```(?:\w+)?\n(.*?)\n```", content, re.DOTALL)
        if code_match:
            content = code_match.group(1)
            
        generated_files[path] = {
            "content": content,
            "language": "python" if path.endswith(".py") else "javascript", # Simple inference
            "imports": [], # Will be filled by linker
            "exports": [],
            "lastEditedBy": "generator"
        }
        
    return {"files": generated_files, "current_step": "generation_complete", "total_tokens": total_tokens}
