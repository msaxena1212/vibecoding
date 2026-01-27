from graph.state import CodebaseState
from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_llm, extract_tokens
from utils.formatter import parse_json_dict
import json
import re
import os

async def run_editor(state: CodebaseState):
    """
    Modify existing code based on user intent.
    """
    llm = get_llm()
    # ... previous lines ...
    user_intent = state.get("userIntent", "")
    existing_files = state.get("files", {})
    
    # Load prompt
    # Load prompt
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "prompt.md")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        system_prompt = f.read()
        
    # Build context for LLM
    file_context = "\n".join([f"--- FILE: {path} ---\n{data['content']}" for path, data in existing_files.items()])
    
    history = state.get("messages", [])
    diagnostic_report = state.get("diagnostic_report", "")
    
    prompt_intent = f"User Intent: {user_intent}\n\nCURRENT CODEBASE:\n{file_context}"
    if diagnostic_report:
        prompt_intent += f"\n\n🚨 SELF-DIAGNOSIS REPORT:\n{diagnostic_report}\n\nPlease fix the issues mentioned above while maintaining existing structure."

    messages = [
        SystemMessage(content=system_prompt)
    ] + history + [
        HumanMessage(content=prompt_intent)
    ]
    
    
    try:
        response = await llm.ainvoke(messages)
    except Exception as e:
        print(f"[WARN] Editor agent encountered an error: {e}")
        print("Skipping editor phase and returning files as-is...")
        # Return the files unchanged if editor fails
        return {
            "files": state.get("files", {}),
            "current_step": "editor_skipped",
            "total_tokens": 0,
            "token_usage": {"editor": 0}
        }
    content = response.content
    tokens = extract_tokens(response)
    
    try:
        data = parse_json_dict(content)
        modified_files = data.get("files", {})
        
        # Merge changes back into state (PROACTIVE PATCHING)
        new_files = existing_files.copy()
        
        # We only update files that are EXPLICITLY returned by the LLM
        for path, new_content in modified_files.items():
            if not path or new_content is None:
                print(f"[WARN] Skipping malformed patch for {path}")
                continue

            print(f"[EDITOR] modifying file: {path}")
            # Truncation check
            if path.endswith(".html") and "</html>" not in new_content.lower():
                print(f"[WARN] Editor truncation detected for {path}! Rejecting patch.")
                continue

            if path in new_files:
                new_files[path]["content"] = new_content
                new_files[path]["lastEditedBy"] = "editor"
                
                # Update Disk in Project Hub
                try:
                    project_id = state.get("project_id")
                    if project_id:
                        full_path = os.path.join("frontend", "p", project_id, path)
                        os.makedirs(os.path.dirname(full_path), exist_ok=True)
                        with open(full_path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"[EDITOR] Persisted fix to: {path}")
                except Exception as e:
                    print(f"[FAIL] Editor failed to persist {path}: {e}")
                
        reasoning_obj = data.get("reasoning", {})
        if isinstance(reasoning_obj, dict):
            reasoning_text = f"{reasoning_obj.get('change_scope', '')}\n\n{reasoning_obj.get('fidelity_check', '')}\n\n{reasoning_obj.get('integration_logic', '')}"
        else:
            reasoning_text = str(reasoning_obj)
            
        return {
            "files": new_files, 
            "current_step": "editing_complete", 
            "reasoning": reasoning_text,
            "total_tokens": tokens,
            "token_usage": {"editor": tokens}
        }
    except Exception as e:
        print(f"Error parsing editor response: {e}")
        return {
            "files": existing_files,
            "current_step": "editing_error", 
            "errors": [str(e)], 
            "total_tokens": tokens,
            "token_usage": {"editor": tokens}
        }
