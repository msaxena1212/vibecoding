from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_llm, extract_tokens
from graph.state import CodebaseState
import json
import os

async def run_generator(state: CodebaseState):
    print("\n=== [GENERATOR STARTING] ===")
    llm = get_llm()
    plan = state.get("plan", {})
    files_to_create = plan.get("files", [])
    
    generated_files = state.get("files", {}).copy()
    total_tokens = state.get("total_tokens", 0)
    
    with open("agents/generator/prompt.md", "r", encoding="utf-8") as f:
        system_prompt_template = f.read()

    total_gen_tokens = 0
    for file_info in files_to_create:
        path = file_info.get("path")
        description = file_info.get("description")
        
        print(f"Generating {path}...")
        
        history = state.get("messages", [])
        design_tokens = state.get("design_tokens", {})
        mock_data = state.get("mock_data", {})
        copy_data = state.get("copy_data", {})
        generated_images = {img["path"]: img["local_path"] for img in state.get("images_to_generate", []) if "local_path" in img}
        
        reasoning = state.get("reasoning", "")
        plan_summary = state.get("plan_summary", "")

        messages = [
            SystemMessage(content=system_prompt_template)
        ] + history + [
            HumanMessage(content=f"Generate the file: {path}\nDescription: {description}\n\nProject Reasoning: {reasoning}\nTechnical Plan: {plan_summary}\n\nExisting State: {str(generated_files.keys())}\nDesign Tokens: {json.dumps(design_tokens)}\nMock Data: {json.dumps(mock_data)}\nCopy Data: {json.dumps(copy_data)}\nAvailable Assets: {json.dumps(generated_images)}")
        ]
        
        response = await llm.ainvoke(messages)
        
        # Extract token usage
        tokens = extract_tokens(response)
            
        total_gen_tokens += tokens
        content = response.content
        
        # Strip markdown code blocks if present
        import re
        code_match = re.search(r"```(?:\w+)?\n(.*?)\n```", content, re.DOTALL)
        if code_match:
            content = code_match.group(1)
            
        generated_files[path] = {
            "content": content,
            "language": "python" if path.endswith(".py") else "javascript",
            "imports": [],
            "exports": [],
            "lastEditedBy": "generator"
        }

        # PERSIST TO PROJECT HUB
        project_id = state.get("project_id", "default")
        
        # DEBUG: Log to file
        try:
            with open("generator_debug.log", "a", encoding="utf-8") as dbg:
                dbg.write(f"Generator running for Project ID: {project_id}, Path: {path}\n")
        except:
            pass

        try:
            local_full_path = os.path.join("frontend", "p", project_id, path)
            os.makedirs(os.path.dirname(local_full_path), exist_ok=True)
            with open(local_full_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[SUCCESS] File {path} persisted to Project Hub: {local_full_path}")
        except Exception as e:
            print(f"[ERROR] persisting {path} to Project Hub: {e}")
            import traceback
            traceback.print_exc()
        
    return {
        "files": generated_files, 
        "current_step": "generation_complete", 
        "total_tokens": total_gen_tokens,
        "token_usage": {"generator": total_gen_tokens}
    }
