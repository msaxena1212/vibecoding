from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from graph.workflow import create_workflow
from graph.state import CodebaseState
from langchain_core.messages import HumanMessage, AIMessage
import uuid
import traceback
import json
import random
import asyncio
import os

router = APIRouter()

# Node to Name mapping for better UX
NODE_NAMES = {
    "router": "🧭 Router: Analyzing user intent...",
    "planner": "🛸 Architect: Designing the blueprint...",
    "assigner": "📋 Assigner: Delegating specialized tasks...",
    "seeker": "🔍 Seeker: Conducting industry research...",
    "copywriter": "✒️ Copywriter: Crafting high-conversion copy...",
    "fetch_images": "🌐 Asset Scout: Sourcing visual media...",
    "image_generator": "🖼️ Artist: Fulfilling thematic assets...",
    "generator": "💻 Developer: Implementing components...",
    "backend_architect": "⚙️ Backend: Designing data architecture...",
    "react_specialist": "⚛️ React: Building advanced components...",
    "linker": "🔗 Linker: Optimizing dependency graph...",
    "ui_specialist": "💎 UI Pro: Adding premium design polish...",
    "seo_specialist": "🚀 SEO: Auditing performance & visibility...",
    "validator": "🛡️ QA: Running diagnostic scan...",
    "editor": "🔧 Fixer: Refining code for perfection...",
    "debugger": "🩹 Debugger: Surgically repairing errors...",
    "chatter": "💬 Liaison: Conversing with user..."
}

@router.post("/")
async def generate_project(intent: str, project_id: str = None):
    """Main API entry point handling different user intents.
    - Greeting / small talk → chat response
    - GENERATE → plan, generate, link, validate a new project
    - MODIFY → load existing plan, fetch files, re‑plan and optimise
    - EXPLAIN / DEBUG → provide explanations or debugging info
    - Anything else → fallback chat
    """
    # Simple chat handling for greetings
    greeting_keywords = ["hi", "hello", "hey", "good morning", "good evening"]
    if intent.strip().lower() in greeting_keywords:
        # generate a project_id for the chat interaction
        active_project_id = project_id or str(uuid.uuid4())
        # pick a random friendly message
        friendly_messages = [
            "Hey there! Ready to build something amazing?",
            "Hello! How can I assist you with your project today?",
            "Hi! Let’s create something wonderful together.",
            "Greetings! What would you like to work on today?",
            "Good day! Tell me what you need help with."
        ]
        response = {
            "type": "chat",
            "content": random.choice(friendly_messages),
            "project_id": active_project_id
        }
        async def chat_generator():
            yield json.dumps(response) + "\n"
        return StreamingResponse(chat_generator(), media_type="application/json")

    # Determine high‑level task type
    intent_lower = intent.strip().lower()
    if any(word in intent_lower for word in ["generate", "create", "build", "make"]):
        task_type = "generate"
    elif any(word in intent_lower for word in ["modify", "update", "change", "edit"]):
        task_type = "modify"
    elif any(word in intent_lower for word in ["explain", "describe", "detail"]):
        task_type = "explain"
    elif any(word in intent_lower for word in ["debug", "fix", "repair", "error"]):
        task_type = "debug"
    else:
        task_type = "chat"

    async def stream_generator():
        try:
            print(f"DEBUG: Streaming start for intent: {intent} (task_type={task_type})")
        except UnicodeEncodeError:
            print(f"DEBUG: Streaming start for intent: {intent.encode('ascii', 'replace').decode()} (task_type={task_type})")
        try:
            workflow = create_workflow()
            files = {}
            dependency_graph = {}
            framework = "react"
            messages = []
            total_tokens = 0
            reasoning = ""
            plan_summary = ""
            design_tokens = {}

            # Ensure a project_id exists
            active_project_id = project_id or str(uuid.uuid4())

            from apps.api.deps import get_project_store
            store = get_project_store()

            # Load existing state for MODIFY/EXPLAIN/DEBUG
            if active_project_id and project_id:
                existing_data = await store.get_latest(active_project_id)
                if existing_data:
                    files = existing_data.get("files", {})
                    dependency_graph = existing_data.get("dependencyGraph", {})
                    framework = existing_data.get("framework", "react")
                    total_tokens = existing_data.get("total_tokens", 0)
                    reasoning = existing_data.get("reasoning", "")
                    plan_summary = existing_data.get("plan_summary", "")
                    design_tokens = existing_data.get("design_tokens", {})
                    history = await store.get_chat_messages(active_project_id)
                    for msg in history:
                        if msg.role == "user":
                            messages.append(HumanMessage(content=msg.content))
                        elif msg.role == "assistant":
                            messages.append(AIMessage(content=msg.content))

            # Inject task_type for downstream agents
            messages.append(HumanMessage(content=f"[TASK_TYPE] {task_type}"))

            initial_state = CodebaseState(
                files=files,
                dependencyGraph=dependency_graph,
                framework=framework,
                userIntent=intent,
                messages=messages,
                reasoning=reasoning if active_project_id and project_id else "",
                design_tokens=design_tokens if active_project_id and project_id else {},
                plan_summary=plan_summary if active_project_id and project_id else "",
                copy_data={},
                seo_report={},
                images_to_generate=[],
                diagnostic_report="",
                current_step="start",
                total_tokens=total_tokens,
                token_usage={},
                project_id=active_project_id,
                retry_count=0,
                errors=[]
            )

            # Persist early snapshot
            from utils.formatter import sanitize_state
            await store.save_snapshot(intent, sanitize_state(initial_state), project_id=active_project_id)

            # Start workflow streaming
            from graph.router import route_request, route_validator
            initial_step = route_request(initial_state)
            if initial_step in NODE_NAMES:
                yield json.dumps({"type": "status", "name": initial_step, "content": NODE_NAMES[initial_step]}) + "\n"

            final_result = initial_state.copy()
            async for event in workflow.astream(initial_state):
                for node_name, update in event.items():
                    if "reasoning" in update and update["reasoning"]:
                        yield json.dumps({"type": "reasoning", "agent": node_name, "content": update["reasoning"]}) + "\n"
                    for key, value in update.items():
                        if key == "total_tokens":
                            final_result["total_tokens"] = final_result.get("total_tokens", 0) + value
                        elif key == "token_usage":
                            current = final_result.get("token_usage", {})
                            for ag, cnt in value.items():
                                current[ag] = current.get(ag, 0) + cnt
                            final_result["token_usage"] = current
                        elif key == "files":
                            cur = final_result.get("files", {})
                            cur.update(value)
                            final_result["files"] = cur
                        elif key == "messages":
                            cur = final_result.get("messages", [])
                            cur.extend(value)
                            final_result["messages"] = cur
                        elif key == "retry_count":
                            final_result["retry_count"] = final_result.get("retry_count", 0) + value
                        else:
                            final_result[key] = value
                    # Predict next status
                    next_node = None
                    if node_name == "planner":
                        next_node = "copywriter"
                    elif node_name == "copywriter":
                        next_node = "image_generator"
                    elif node_name == "image_generator":
                        next_node = "generator"
                    elif node_name == "generator":
                        next_node = "linker"
                    elif node_name == "linker":
                        next_node = "seo_specialist"
                    elif node_name == "seo_specialist":
                        next_node = "validator"
                    elif node_name == "validator":
                        next_node = route_validator(final_result)
                    elif node_name == "editor":
                        next_node = "validator"
                    if next_node and next_node in NODE_NAMES:
                        yield json.dumps({"type": "status", "name": next_node, "content": NODE_NAMES[next_node]}) + "\n"

            # Final processing
            sanitized_result = sanitize_state(final_result)
            new_project_id = await store.save_snapshot(intent, sanitized_result, project_id=active_project_id)

            # Build assistant response
            reasoning = sanitized_result.get("reasoning", "")
            plan_summary = sanitized_result.get("plan_summary", "Enhancing the project.")
            assistant_text = f"## 🧠 Architect Reasoning\n{reasoning}\n\n## 📋 Technical Plan\n{plan_summary}\n\n"
            seo = sanitized_result.get("seo_report", {})
            if seo:
                assistant_text += f"## 🚀 Performance & SEO\n- **SEO Score**: {seo.get('audit_report', {}).get('seo_score', 'N/A')}\n- **Accessibility**: {seo.get('audit_report', {}).get('a11y_score', 'N/A')}\n\n"
            usage = sanitized_result.get("token_usage", {})
            if usage:
                rows = "\n".join([f"| {ag.capitalize()} | {cnt} |" for ag, cnt in usage.items()])
                assistant_text += f"## 📊 Compute Resource Usage\n| Agent | Tokens |\n| :--- | :--- |\n{rows}\n| **Total** | **{sanitized_result.get('total_tokens', 0)}** |\n\n"
            assistant_text += "I've updated your workspace. View the files and preview to see the results."
            await store.add_chat_message(new_project_id, "user", intent)
            await store.add_chat_message(new_project_id, "assistant", assistant_text)

            sanitized_result["project_id"] = new_project_id
            sanitized_result["assistant_response"] = assistant_text
            yield json.dumps({"type": "result", "data": sanitized_result}) + "\n"
        except Exception as e:
            traceback.print_exc()
            yield json.dumps({"type": "error", "content": str(e)}) + "\n"

    return StreamingResponse(stream_generator(), media_type="application/x-ndjson")            



