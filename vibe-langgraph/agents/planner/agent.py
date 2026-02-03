from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_llm, extract_tokens
from graph.state import CodebaseState

from utils.formatter import parse_json_dict
import json
import re
import os

async def run_planner(state: CodebaseState):
    """
    Break user intent into a technical plan.
    """
    llm = get_llm()
    if not llm:
        return {"messages": ["Error: LLM not configured"]}
        
    user_intent = state.get("userIntent", "")
    
    # Load prompt
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "prompt.md")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        system_prompt = f.read()
        
    history_list = state.get("messages", [])
    history_text = ""
    from langchain_core.messages import BaseMessage
    
    for msg in history_list:
        content_str = ""
        role = "User"
        if isinstance(msg, HumanMessage):
            content_str = msg.content
            if "[TASK_TYPE]" in str(content_str): 
                continue
        elif isinstance(msg, dict):
            role = "User" if msg.get("role") == "user" else "AI"
            content_str = msg.get("content", "")
        else:
            role = "AI"
            content_str = msg.content
        history_text += f"{role}: {content_str}\n"

    # Limit context
    recent_history = "\n".join(history_text.split('\n')[-30:])
    
    existing_files = list(state.get("files", {}).keys())
    existing_context = f"\n\nEXISTING FILES:\n{', '.join(existing_files)}" if existing_files else ""
    
    # --- VECTOR SEARCH INTEGRATION ---
    try:
        from utils.vector_store import VectorStore
        # Assuming run form root, .chroma_db is in root
        vs = VectorStore(collection_name="codebase_index", persist_directory="./.chroma_db")
        if vs.count() > 0:
            print(f"[Planner] Searching vector store for: {user_intent}")
            results = vs.search(user_intent, n_results=3)
            if results:
                context_str = "\n\n### RELEVANT ARCHITECTURAL CONTEXT:\n"
                for res in results:
                    source = res['metadata'].get('source', 'Unknown')
                    snippet = res['content'][:1500] # Increased limit for planner
                    context_str += f"File: {source}\nContent:\n{snippet}\n---\n"
                
                existing_context += context_str
    except Exception as e:
        print(f"[Planner] Vector search skipped or failed: {e}")
    # ---------------------------------

    framework = state.get("framework", "react")

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Conversation History:\n{recent_history}\n\nSelected Framework: {framework}\n\nCurrent User Request: {user_intent}{existing_context}")
    ]
    
    from utils.llm import resilient_call
    response = await resilient_call(llm.ainvoke, messages)
    tokens = extract_tokens(response)
    
    # Parse the response content as JSON robustly
    content = response.content
    with open("planner_raw.txt", "w", encoding="utf-8") as f:
        f.write(content)
        
    with open("planner_debug.txt", "w", encoding="utf-8") as f:
        f.write(f"USER INTENT: {user_intent}\n")
        f.write(f"HISTORY LEN: {len(history_list)}\n")
        f.write(f"HISTORY PREVIEW: {recent_history[:200]}...\n")
    
    print(f"DEBUG: Planner Raw Output length: {len(content)}")
    
    plan = parse_json_dict(content)
    
    if not plan:
        print("[ERROR] Planner failed to generate a valid JSON plan.")
        return {
            "current_step": "planning_error",
            "total_tokens": tokens,
            "token_usage": {"planner": tokens}
        }

    reasoning_obj = plan.get("reasoning", {})
    reasoning_text = f"{reasoning_obj.get('brand_tone', '')}\n\n{reasoning_obj.get('architectural_logic', '')}\n\n{reasoning_obj.get('ux_strategy', '')}"
    
    images_to_generate = plan.get("images_to_generate", [])
    assignments = plan.get("assignments", [])
    files = plan.get("files", [])

    # MANDATORY STRUCTURAL ENFORCEMENT
    framework = state.get("framework", "react")
    
    mandatory_files = {}
    if framework == "react":
        mandatory_files = {
            "package.json": "Standard project configuration",
            "index.html": "SPA entry point",
            "src/index.jsx": "React mounting logic",
            "src/App.jsx": "Main Router and state shell",
            "src/App.test.jsx": "Automated smoke test",
            "src/index.css": "Global Tailwind styles",
            "vite.config.js": "Vite build configuration",
            "tailwind.config.js": "Tailwind UI configuration",
            "postcss.config.js": "PostCSS directives"
        }
    elif framework == "express":
        mandatory_files = {
            "package.json": "Node.js configuration",
            "server.js": "Main Express application entry point",
            "tests/server.test.js": "API integration test",
            ".env": "Environment variables"
        }
    elif framework == "fullstack":
        mandatory_files = {
            "package.json": "Integrated Monorepo configuration",
            "services/server.js": "Main Express backend entry point",
            "index.html": "React frontend entry point",
            "src/index.jsx": "React mounting logic",
            "src/App.jsx": "Frontend Router and state shell",
            "src/index.css": "Global Tailwind styles",
            "src/services/api.js": "Backend communication bridge",
            ".env": "Environment variables"
        }

    for path, desc in mandatory_files.items():
        if not any(f.get("path") == path for f in files):
            print(f"[PLANNER SAFETY] Injecting missing mandatory file into plan ({framework}): {path}")
            files.append({"path": path, "description": f"Priority: {desc}"})
    
    plan["files"] = files

    return {
        "current_step": "planning_complete", 
        "plan": plan, 
        "reasoning": reasoning_text,
        "plan_summary": plan.get("plan_summary", ""),
        "design_tokens": plan.get("design_tokens", {}),
        "mock_data": plan.get("mock_data", {}),
        "images_to_generate": images_to_generate,
        "assignments": assignments,
        "total_tokens": tokens,
        "token_usage": {"planner": tokens},
        "model_calls": 1
    }
