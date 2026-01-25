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
    proposed_patches = []
    
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
                
                # Clean and parse JSON
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                try:
                    response_json = json.loads(content)
                    operations = response_json.get("operations", [])
                except json.JSONDecodeError as e:
                    print(f"[ERROR] JSON Parsing failed: {e}")
                    # Basic retry or fallback could go here
                    operations = []
                
                for op in operations:
                    op_type = op.get("type")
                    op_path = op.get("path")
                    op_content = op.get("content")
                    op_desc = op.get("description", f"{op_type} {op_path}")
                    
                    if not op_path or not op_content:
                        continue
                    
                    # STAGE AS PROPOSAL
                    patch = {
                        "op": op_type,
                        "path": op_path,
                        "content": op_content,
                        "language": "json" if op_path.endswith(".json") else ("python" if op_path.endswith(".py") else "javascript"),
                        "description": op_desc
                    }
                    
                    # Update local state for context (though not final)
                    generated_files[op_path] = {
                        "content": op_content,
                        "lastEditedBy": "generator"
                    }
                    
                    proposed_patches.append(patch)
                    print(f"[PROPOSED] Patch for {op_path}")

            except Exception as e:
                print(f"[ERROR] generating {path}: {e}")

    # Return proposals
    return {
        "proposed_patches": proposed_patches,
        "current_step": "generation_complete", 
        "total_tokens": total_gen_tokens,
        "token_usage": {"generator": total_gen_tokens}
    }
