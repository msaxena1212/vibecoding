from fastapi import APIRouter, HTTPException
from graph.workflow import create_workflow
from graph.state import CodebaseState
import traceback

router = APIRouter()

@router.post("/")
async def generate_project(intent: str, project_id: str = None):
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
        
        from apps.api.deps import get_project_store
        store = get_project_store()
        
        if project_id:
            print(f"DEBUG: Loading existing project: {project_id}")
            existing_data = await store.get_latest(project_id)
            if existing_data:
                files = existing_data.get("files", {})
                dependency_graph = existing_data.get("dependencyGraph", {})
                framework = existing_data.get("framework", "react")
                # We could also load total_tokens if needed, but let's accumulate
                total_tokens = existing_data.get("total_tokens", 0)
                print(f"DEBUG: Loaded {len(files)} files from previous state.")

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
    
        print("DEBUG: Invoking workflow...")
        # Run workflow
        result = workflow.invoke(initial_state)
        print("DEBUG: Workflow finished.")
        
        # Sanitize state for JSON serialization
        print("DEBUG: Sanitizing state...")
        from utils.formatter import sanitize_state
        result = sanitize_state(result)
        
        print("DEBUG: Saving to DB...")
        from apps.api.deps import get_project_store
        store = get_project_store()
        
        # 1. Save Project Snapshot (Pass existing project_id if we have one)
        project_id = await store.save_snapshot(intent, result, project_id=project_id)
        
        # 2. Save Chat History
        await store.add_chat_message(project_id, "user", intent)
        await store.add_chat_message(project_id, "assistant", f"I've generated your {result.get('framework', 'project')}. You can view the files and preview in the dashboard.")
        
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
