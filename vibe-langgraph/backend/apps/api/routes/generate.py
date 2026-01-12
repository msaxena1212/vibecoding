from fastapi import APIRouter, HTTPException
from backend.graph.workflow import create_workflow
from backend.graph.state import CodebaseState
import traceback
from typing import Optional

from pydantic import BaseModel

router = APIRouter()

class GenerateRequest(BaseModel):
    intent: str
    project_id: Optional[str] = None

@router.post("/")
async def generate_project(request: GenerateRequest):
    intent = request.intent
    project_id = request.project_id
    print(f"DEBUG: Entered generate_project with intent: {intent}, project_id: {project_id}")
    try:
        print("DEBUG: Creating workflow...")
        workflow = create_workflow()
        print("DEBUG: Creating state...")
        files = {}
        dependency_graph = {}
        framework = "react"
        messages = []
        total_tokens = 0
        
        from backend.apps.api.deps import get_project_store
        store = get_project_store()
        
        if project_id:
            print(f"DEBUG: Attempting to load existing project: {project_id}")
            existing_data = await store.get_latest(project_id)
            if existing_data:
                files = existing_data.get("files", {})
                dependency_graph = existing_data.get("dependencyGraph", {})
                framework = existing_data.get("framework", "react")
                total_tokens = existing_data.get("total_tokens", 0)
                
                # Load previous chat messages for context
                prev_messages = await store.get_chat_messages(project_id)
                messages = [{"role": m.role, "content": m.content} for m in prev_messages]
                
                print(f"DEBUG: Successfully loaded project '{project_id}'. Prev messages: {len(messages)}")
            else:
                print(f"DEBUG: Project ID '{project_id}' provided but NOT FOUND in database.")

        initial_state = CodebaseState(
            files=files,
            dependencyGraph=dependency_graph,
            framework=framework,
            userIntent=intent,
            messages=messages,
            current_step="start",
            total_tokens=total_tokens,
            errors=[]
        )
    
        if not project_id:
            print("DEBUG: Creating a brand new project snapshot...")
            project_id = await store.save_snapshot(intent, initial_state)
            print(f"DEBUG: New project created with ID: {project_id}")
        else:
            # Even if it wasn't found in get_latest, we might want to ensure it's in DB now 
            # if we are going to use it. But get_latest should have found it if it existed.
            pass
        
        # 2. Save User Message immediately
        await store.add_chat_message(project_id, "user", intent)

        print("DEBUG: Invoking workflow...")
        # Run workflow
        result = workflow.invoke(initial_state)
        print("DEBUG: Workflow finished.")
        
        # Sanitize state for JSON serialization
        print("DEBUG: Sanitizing state...")
        from backend.utils.formatter import sanitize_state
        result = sanitize_state(result)
        
        print("DEBUG: Updating project in DB...")
        # 3. Update Project Snapshot with results
        await store.save_snapshot(intent, result, project_id=project_id)
        
        # 4. Save Assistant Response
        final_messages = result.get("messages", [])
        assistant_msgs = [m for m in final_messages if m.get("role") == "assistant"]
        
        plan_summary = result.get("plan", {}).get("plan_summary", "")
        framework = result.get("framework", "project")
        errors = result.get("errors", [])
        
        if assistant_msgs:
            last_msg = assistant_msgs[-1]["content"]
            # Prepend plan summary if it's not already there
            prefix = ""
            if plan_summary and plan_summary not in last_msg:
                prefix += f"**Plan Summary:**\n{plan_summary}\n\n"
            
            if errors:
                prefix += f"**Errors encountered:**\n" + "\n".join([f"- {e}" for e in errors]) + "\n\n"
                
            combined_msg = f"I've generated your **{framework}**.\n\n{prefix}{last_msg}"
            await store.add_chat_message(project_id, "assistant", combined_msg)
        else:
            msg = f"I've generated your **{framework}**."
            if plan_summary:
                msg += f"\n\n**Plan Summary:**\n{plan_summary}"
            if errors:
                msg += f"\n\n**Errors encountered:**\n" + "\n".join([f"- {e}" for e in errors])
            await store.add_chat_message(project_id, "assistant", msg)
        
        print(f"DEBUG: Saved to DB with ID: {project_id}")
        
        # Return result with ID
        result["project_id"] = project_id
        return result
    except Exception as e:
        print("CRITICAL ERROR IN GENERATE:")
        traceback.print_exc()
        # Write to file
        with open("error.log", "w") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
