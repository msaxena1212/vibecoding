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
    
    # Pre-fetch index.html content if it exists (for consistency context)
    reference_context = ""
    
    for file_info in files_to_create:
        path = file_info.get("path")
        description = file_info.get("description")
        
        # SKIP GENERATION IF ALREADY HANDLED BY SPECIALIST
        if path in generated_files and generated_files[path].get("lastEditedBy") in ["backend_architect", "react_specialist"]:
            print(f"Skipping generation for {path} (already handled by {generated_files[path]['lastEditedBy']})")
        else:
            print(f"Generating {path}...")
            # ... rest of the generation logic ...
            history = state.get("messages", [])
            design_tokens = state.get("design_tokens", {})
            mock_data = state.get("mock_data", {})
            copy_data = state.get("copy_data", {})
            generated_images = {img["path"]: img["local_path"] for img in state.get("images_to_generate", []) if "local_path" in img}
            
            reasoning = state.get("reasoning", "")
            plan_summary = state.get("plan_summary", "")

            # REACT CONTEXT INJECTION
            current_context = ""
            if "src/App.jsx" in generated_files:
                 current_context += f"\n\n[REFERENCE FILE: src/App.jsx]\n{generated_files['src/App.jsx']['content']}\n[END REFERENCE]"
            
            components_created = [k for k in generated_files.keys() if "components/" in k]
            if components_created:
                current_context += f"\n\n[EXISTING COMPONENTS]: {', '.join(components_created)}"   

            messages = [
                SystemMessage(content=system_prompt_template)
            ] + history + [
                HumanMessage(content=f"Generate the file: {path}\nDescription: {description}\n\nProject Reasoning: {reasoning}\nTechnical Plan: {plan_summary}\n\nExisting State: {str(generated_files.keys())}\nDesign Tokens: {json.dumps(design_tokens)}\nMock Data: {json.dumps(mock_data)}\nCopy Data: {json.dumps(copy_data)}\nAvailable Assets: {json.dumps(generated_images)}{current_context}")
            ]
            
            try:
                response = await llm.ainvoke(messages)
                tokens = extract_tokens(response)
                total_gen_tokens += tokens
                content = response.content
                
                import re
                # Try to extract code from triple backticks
                code_match = re.search(r"```(?:\w+)?\n(.*?)\n```", content, re.DOTALL)
                if code_match:
                    content = code_match.group(1)
                else:
                    # Fallback: remove backticks if they exist but don't match the newlines perfectly
                    content = content.replace("```json", "").replace("```javascript", "").replace("```js", "").replace("```", "").strip()
                    
                generated_files[path] = {
                    "content": content,
                    "language": "json" if path.endswith(".json") else ("python" if path.endswith(".py") else "javascript"),
                    "imports": [],
                    "exports": [],
                    "lastEditedBy": "generator"
                }
                print(f"[SUCCESS] Generated {path}")
            except Exception as e:
                print(f"[ERROR] generating {path}: {e}")

        # PERSIST TO PROJECT HUB (Moved outside the 'else' to handle skipped files too)
        project_id = state.get("project_id")
        if not project_id:
            # Create a fallback if missing for some reason
            import uuid
            project_id = str(uuid.uuid4())
            state["project_id"] = project_id
            
        try:
            local_full_path = os.path.join("frontend", "p", project_id, path)
            os.makedirs(os.path.dirname(local_full_path), exist_ok=True)
            with open(local_full_path, "w", encoding="utf-8") as f:
                f.write(generated_files[path]["content"])
            print(f"[SUCCESS] File {path} persisted to Project Hub: {local_full_path}")
        except Exception as e:
            print(f"[ERROR] persisting {path}: {e}")

    return {
        "files": generated_files, 
        "current_step": "generation_complete", 
        "total_tokens": total_gen_tokens,
        "token_usage": {"generator": total_gen_tokens}
    }
