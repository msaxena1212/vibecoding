import asyncio
import os
import json
from graph.state import CodebaseState
from agents.planner.agent import run_planner
from agents.generator.agent import run_generator
from agents.image_generator.agent import run_image_generator

async def verify_project_hub():
    print("🚀 Starting Project Hub Verification...")
    
    # 1. Mock Initial State
    project_id = "test-verification-id"
    state: CodebaseState = {
        "userIntent": "Verify the high-fidelity multi-page fitness brand ApexForm.",
        "project_id": project_id,
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
        "errors": []
    }

    # 2. Run Planner to see if mandatory pages are included
    print("🛸 Running Planner...")
    plan_update = await run_planner(state)
    state.update(plan_update)
    
    plan_files = [f["path"] for f in state["plan"].get("files", [])]
    print(f"Planned Files: {plan_files}")
    
    mandatory = ["index.html", "about.html", "contact.html", "privacy.html", "terms.html"]
    missing = [p for p in mandatory if p not in plan_files]
    
    if not missing:
        print("✅ Mandatory pages included in plan.")
    else:
        print(f"❌ Missing mandatory pages: {missing}")

    # 3. Run Image Generator to verify Project Hub persistence
    print("🖼️ Running Artist (Image Generator)...")
    artist_update = await run_image_generator(state)
    state.update(artist_update)
    
    asset_path = os.path.join("frontend", "p", project_id, "assets")
    if os.path.exists(asset_path):
        print(f"✅ Project Hub Assets directory created: {asset_path}")
        assets = os.listdir(asset_path)
        print(f"Generated Assets: {assets}")
    else:
        print(f"❌ Project Hub Assets directory NOT found at: {asset_path}")

    # 4. Run Generator to verify file persistence
    # We only run for index.html to save time/tokens
    if state["plan"].get("files"):
        print("💻 Running Developer (Generator) for index.html...")
        # Subset to just index.html for test
        state["plan"]["files"] = [f for f in state["plan"]["files"] if f["path"] == "index.html"]
        gen_update = await run_generator(state)
        state.update(gen_update)
        
        index_file_path = os.path.join("frontend", "p", project_id, "index.html")
        if os.path.exists(index_file_path):
            print(f"✅ index.html persisted to Project Hub: {index_file_path}")
            with open(index_file_path, "r") as f:
                content = f.read()
                if "/static/p/" not in content and "about.html" in content:
                    print("✅ Native links (about.html) found in content.")
        else:
            print(f"❌ index.html NOT found at: {index_file_path}")

    print("\n🏁 Verification Complete.")

if __name__ == "__main__":
    asyncio.run(verify_project_hub())
