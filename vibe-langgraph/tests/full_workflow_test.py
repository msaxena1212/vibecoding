import asyncio
import os
from graph.workflow import create_workflow
from graph.state import CodebaseState

async def test_full_workflow():
    print("🚀 Starting Full Workflow Test...")
    
    workflow = create_workflow()
    
    # Mock Initial State
    state: CodebaseState = {
        "userIntent": "Create a luxury dark-cosmic themed landing page for a space tourism company called 'Nova Horizon'.",
        "project_id": "test-workflow-id",
        "files": {},
        "dependencyGraph": {},
        "framework": "vanilla",
        "messages": [],
        "plan": {},
        "reasoning": "",
        "design_tokens": {},
        "plan_summary": "",
        "copy_data": {},
        "seo_report": {},
        "images_to_generate": [],
        "diagnostic_report": "",
        "current_step": "start",
        "total_tokens": 0,
        "token_usage": {},
        "errors": [],
        "retry_count": 0
    }

    print("🛰️ Invoking Workflow...")
    # Using small recursion limit just for test
    config = {"recursion_limit": 50}
    
    try:
        final_state = await workflow.ainvoke(state, config=config)
        
        print("\n🏁 Workflow Execution Finished.")
        print(f"Final Step: {final_state.get('current_step')}")
        print(f"Total Tokens: {final_state.get('total_tokens')}")
        print(f"Files Generated: {list(final_state.get('files', {}).keys())}")
        
        if final_state.get('files'):
            print("✅ Success: Files were generated.")
        else:
            print("❌ Failure: No files generated.")
            
    except Exception as e:
        print(f"❌ Workflow failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_full_workflow())
