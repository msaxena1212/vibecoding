from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from graph.workflow import create_workflow
from graph.state import CodebaseState
from langchain_core.messages import HumanMessage, AIMessage
import uuid
import traceback
import json
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
    async def stream_generator():
        print(f"DEBUG: Streaming start for intent: {intent}")
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
            
            # ELITE: Ensure project_id is available from the start for isolated persistence
            active_project_id = project_id
            if not active_project_id:
                active_project_id = str(uuid.uuid4())
            
            from apps.api.deps import get_project_store
            store = get_project_store()
            
            if active_project_id and project_id: # Use the original project_id for loading history
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

            # ELITE: Persist project early to ensure DB/Disk synchronization even on crash
            from utils.formatter import sanitize_state
            await store.save_snapshot(intent, sanitize_state(initial_state), project_id=active_project_id)
            
            # Start streaming the workflow
            from graph.router import route_request, route_validator

            # 1. Yield Initial Status
            initial_step = route_request(initial_state)
            if initial_step in NODE_NAMES:
                yield json.dumps({
                    "type": "status",
                    "name": initial_step,
                    "content": NODE_NAMES[initial_step]
                }) + "\n"

            final_result = initial_state.copy()
            async for event in workflow.astream(initial_state):
                # event is a dict {node_name: state_update}
                for node_name, update in event.items():
                    # 2. Yield Reasoning Update (if any)
                    if "reasoning" in update and update["reasoning"]:
                        yield json.dumps({
                            "type": "reasoning",
                            "agent": node_name,
                            "content": update["reasoning"]
                        }) + "\n"
                    
                    # 3. Manually merge updates to match reducers
                    for key, value in update.items():
                        if key == "total_tokens":
                            final_result["total_tokens"] = final_result.get("total_tokens", 0) + value
                        elif key == "token_usage":
                            current_usage = final_result.get("token_usage", {})
                            for agent, count in value.items():
                                current_usage[agent] = current_usage.get(agent, 0) + count
                            final_result["token_usage"] = current_usage
                        elif key == "files":
                            current_files = final_result.get("files", {})
                            current_files.update(value)
                            final_result["files"] = current_files
                        elif key == "messages":
                            current_messages = final_result.get("messages", [])
                            current_messages.extend(value)
                            final_result["messages"] = current_messages
                        elif key == "retry_count":
                            final_result["retry_count"] = final_result.get("retry_count", 0) + value
                        else:
                            final_result[key] = value

                    # 4. Predict Next Status
                    next_node = None
                    if node_name == "planner": next_node = "copywriter"
                    elif node_name == "copywriter": next_node = "image_generator"
                    elif node_name == "image_generator": next_node = "generator"
                    elif node_name == "generator": next_node = "linker"
                    elif node_name == "linker": next_node = "seo_specialist"
                    elif node_name == "seo_specialist": next_node = "validator"
                    elif node_name == "validator":
                        next_node = route_validator(final_result)
                    elif node_name == "editor": next_node = "validator"
                    
                    if next_node and next_node in NODE_NAMES:
                        yield json.dumps({
                            "type": "status",
                            "name": next_node,
                            "content": NODE_NAMES[next_node]
                        }) + "\n"

            # Workflow finished, process results
            from utils.formatter import sanitize_state
            sanitized_result = sanitize_state(final_result)
            
            # Save to DB
            new_project_id = await store.save_snapshot(intent, sanitized_result, project_id=active_project_id)
            
            # Construct Final Assistant Message
            reasoning = sanitized_result.get("reasoning", "")
            plan_summary = sanitized_result.get("plan_summary", "Enhancing the project.")
            diagnostic = sanitized_result.get("diagnostic_report", "")
            
            assistant_text = f"## 🧠 Architect Reasoning\n{reasoning}\n\n"
            copy_reasoning = sanitized_result.get("copy_data", {}).get("reasoning", "")
            if copy_reasoning:
                assistant_text += f"## ✒️ Brand Voice Strategy\n{copy_reasoning}\n\n"
            assistant_text += f"## 📋 Technical Plan\n{plan_summary}\n\n"
            
            seo = sanitized_result.get("seo_report", {})
            if seo:
                assistant_text += f"## 🚀 Performance & SEO\n- **SEO Score**: {seo.get('audit_report', {}).get('seo_score', 'N/A')}\n- **Accessibility**: {seo.get('audit_report', {}).get('a11y_score', 'N/A')}\n\n"

            usage = sanitized_result.get("token_usage", {})
            if usage:
                usage_rows = "\n".join([f"| {agent.capitalize()} | {count} |" for agent, count in usage.items()])
                assistant_text += f"## 📊 Compute Resource Usage\n| Agent | Tokens |\n| :--- | :--- |\n{usage_rows}\n| **Total** | **{sanitized_result.get('total_tokens', 0)}** |\n\n"

            assistant_text += "I've updated your workspace. View the files and preview to see the results."

            await store.add_chat_message(new_project_id, "user", intent)
            await store.add_chat_message(new_project_id, "assistant", assistant_text)

            # Yield Final Result
            sanitized_result["project_id"] = new_project_id
            sanitized_result["assistant_response"] = assistant_text
            yield json.dumps({
                "type": "result",
                "data": sanitized_result
            }) + "\n"

        except Exception as e:
            traceback.print_exc()
            yield json.dumps({
                "type": "error",
                "content": str(e)
            }) + "\n"

    return StreamingResponse(stream_generator(), media_type="application/x-ndjson")
