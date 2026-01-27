from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from graph.workflow import create_workflow
from graph.state import CodebaseState
from langchain_core.messages import HumanMessage
import json
import traceback
import asyncio
from typing import Optional

router = APIRouter()

class ErrorReport(BaseModel):
    error: str
    context: Optional[str] = None
    stack: Optional[str] = None

@router.post("/{project_id}/report_error")
async def report_error(project_id: str, report: ErrorReport, background_tasks: BackgroundTasks):
    """
    Endpoint for frontend to report runtime errors (e.g. from the preview iframe).
    This triggers a 'self-healing' run of the Debugger agent.
    """
    print(f"[REPORT] Received error for project {project_id}: {report.error}")
    
    from apps.api.deps import get_project_store
    store = get_project_store()
    
    # Load existing project
    project = await store.get_latest(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Trigger self-healing in background to avoid blocking the request
    background_tasks.add_task(trigger_self_healing, project_id, report, store)
    
    return {"status": "received", "action": "self-healing-started"}

async def trigger_self_healing(project_id: str, report: ErrorReport, store):
    """
    Orchestrates the self-healing workflow.
    """
    try:
        print(f"[SELF-HEAL] Starting repair for project {project_id}...")
        
        # Load fresh state
        project_data = await store.get_latest(project_id)
        if not project_data:
            return

        # Prepare state for Debugger
        # We inject the reported error into the state
        files = project_data.get("files", {})
        messages = [] # We might need to reconstruct messages if needed, or just append a new one
        
        # Add a system/human message representing the error report
        error_msg = f"Runtime Error Report from Preview:\nError: {report.error}\nStack: {report.stack or 'N/A'}\nContext: {report.context or 'N/A'}\n\nPlease fix the code to resolve this runtime crash."
        
        # Reconstruct message history for context
        history = await store.get_chat_messages(project_id)
        for msg in history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            # Omit assistant messages to save tokens or include them if context is needed.
            # For debugging, generally we want the latest state + error.
        
        messages.append(HumanMessage(content=f"[TASK_TYPE] debug\n{error_msg}"))

        state = CodebaseState(
            files=files,
            dependencyGraph=project_data.get("dependencyGraph", {}),
            framework=project_data.get("framework", "react"),
            userIntent="Fix Runtime Error",
            messages=messages,
            reasoning=project_data.get("reasoning", ""),
            plan_summary=project_data.get("plan_summary", ""),
            design_tokens=project_data.get("design_tokens", {}),
            copy_data={},
            seo_report={},
            images_to_generate=[],
            diagnostic_report=report.error, # Prime the diagnostic report with the error
            current_step="start",
            total_tokens=project_data.get("total_tokens", 0),
            token_usage={},
            project_id=project_id,
            retry_count=0,
            errors=[report.error]
        )

        # Run the Graph starting from 'debugger' or 'router' -> 'debugger'
        # Since we added "debug" task type, router should send it to debugger? 
        # Actually create_workflow's route_request sends "debug" (intent) -> "planner"?
        # Wait, route_request only goes to planner, editor, chatter.
        # Let's check route_request in workflow.py / router.py
        
        # In router.py:
        # if route not in ["planner", "editor", "chatter"]: return "planner"
        
        # So we should force the start node or ensure router handles it.
        # But we can't easily change the start node of the compiled graph dynamically per request unless we create a specific subgraph.
        # However, we can set 'current_step' to 'debugger' and relying on a node that routes based on it?
        # Actually, the router agent logic (LLM) determines the next step.
        # If we just run the graph, the 'router' node will run first.
        # We need the 'router' agent to see "[TASK_TYPE] debug" and decide "debugger".
        # BUT, the conditional edge "route_request" only supports ["planner", "editor", "chatter"].
        # Debugger is usually reached from Validator or Compiler.
        
        # Hack/Fix: We can route to 'editor' (Fixer) which serves a similar purpose, OR update the Router to support 'debugger'.
        # Let's look at workflow.py again.
        # workflow.add_conditional_edges("router", route_request, {"planner", "editor", "chatter"})
        # It seems 'debugger' is NOT a valid direct entry from router.
        
        # Alternative: Route to 'planner' which will see the error and plan a fix, then assign -> generator (Developer) -> Validator.
        # This is actually more robust because it re-plans.
        # So we stick with sending it to 'router', which will likely pick 'planner' or 'editor'.
        # If we send to 'editor' (Fixer), it simplifies things.
        
        # Let's set the router to pick "editor" by hinting "modify" or "fix".
        # or we just manually update file in store? No we want the agent handling.
        
        workflow = create_workflow()
        
        # Run graph
        # We need to broadcast updates to the frontend via SSE... but this is a background task.
        # The frontend won't see the updates unless we push them to a store that the frontend polls or subscribes to.
        # Current system uses streaming response for instant feedback.
        # The "report_error" endpoint just says "accepted".
        # The frontend index.html currently doesn't poll for updates.
        # However, if we save the result to the store, the user can "refresh" or "load history" to see changes.
        
        # Ideally we'd have a websocket or SSE channel for project events.
        # Given limitations, we will just run it and save the result. The user might need to reload or clik "Refresh".
        # AND we add a "Repairing..." notification msg to chat history.
        
        await store.add_chat_message(project_id, "system", f"🚑 Self-Healing Triggered: {report.error}")
        
        final_state = state
        async for event in workflow.astream(state, config={"recursion_limit": 100}):
            # We can log progress here if we had a logger
            pass
            
            # Capture final state
            for _, update in event.items():
                 # Naive merge of state for brevity (production would use deep merge)
                 if isinstance(update, dict):
                     files.update(update.get("files", {}))
                     final_state["files"] = files
                     if "plan_summary" in update: final_state["plan_summary"] = update["plan_summary"]
                     
                     # FEEDBACK: Log meaningful steps to chat
                     step_name = update.get("current_step", "")
                     
                     if step_name == "planning_complete":
                         plan_summary = update.get("plan_summary", "Creating fix plan...")
                         await store.add_chat_message(project_id, "system", f"🧠 Planner: {plan_summary[:100]}...")
                     elif step_name == "generation_complete":
                         await store.add_chat_message(project_id, "system", "🔨 Generator: Code updates generated.")
                     elif step_name == "debugging_complete":
                         await store.add_chat_message(project_id, "system", "🔧 Debugger: applied fixes to code.")
                     elif step_name == "compilation_progress":
                        phase = update.get("compile_phase", "")
                        await store.add_chat_message(project_id, "system", f"⚙️ Re-building... ({phase})")
                     elif step_name == "build_error":
                        await store.add_chat_message(project_id, "system", "❌ Re-build failed. Retrying...")

        # Save final snapshot
        from utils.formatter import sanitize_state
        await store.save_snapshot("Self-Healing Fix", sanitize_state(final_state), project_id=project_id)
        await store.add_chat_message(project_id, "assistant", "I've applied a fix for the reported runtime error. Please reload the preview.")
        
        print(f"[SELF-HEAL] Repair complete for {project_id}")

    except Exception as e:
        print(f"[SELF-HEAL] Failed: {e}")
        traceback.print_exc()
