import asyncio
import os
import sys
import traceback
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.getcwd())

load_dotenv()

from graph.workflow import create_workflow
from graph.state import CodebaseState
from utils.formatter import sanitize_state
from apps.api.deps import get_project_store

async def debug_pipeline():
    intent = "Create a simple landing page for a coffee shop"
    print(f"Starting debug pipeline with intent: {intent}")
    
    try:
        print("Step 1: Creating workflow...")
        workflow = create_workflow()
        
        initial_state = CodebaseState(
            files={},
            dependencyGraph={},
            framework="react",
            userIntent=intent,
            messages=[],
            current_step="start",
            errors=[]
        )
        
        print("Step 2: Invoking workflow (this may take a minute)...")
        # Run workflow
        result = workflow.invoke(initial_state)
        print("Step 2 complete. Result keys:", result.keys())
        
        print("Step 3: Sanitizing state...")
        sanitized_result = sanitize_state(result)
        print("Step 3 complete.")
        
        print("Step 4: Saving snapshot to database...")
        store = get_project_store()
        project_id = await store.save_snapshot(intent, sanitized_result)
        print(f"Step 4 complete. Project ID: {project_id}")
        
        print("\nPipeline finished successfully!")
        
    except Exception as e:
        print("\n!!! PIPELINE FAILED !!!")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_pipeline())
