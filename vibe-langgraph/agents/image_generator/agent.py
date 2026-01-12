import os
from graph.state import CodebaseState
from utils.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage
import json

async def run_image_generator(state: CodebaseState):
    """
    Translates asset requests into cinematic AI prompts and fulfills them to Project Hub.
    """
    images = state.get("images_to_generate", [])
    if not images:
        return {"current_step": "image_generation_skipped"}

    llm = get_llm()
    project_id = state.get("project_id", "default")
    
    # Ensure project-specific assets directory exists
    project_hub_path = os.path.join("frontend", "p", project_id)
    os.makedirs(project_hub_path, exist_ok=True)
    
    # Load system prompt
    prompt_path = os.path.join("agents", "image_generator", "prompt.md")
    with open(prompt_path, "r") as f:
        system_prompt = f.read()

    updated_images = []
    design_tokens = state.get("design_tokens", {})
    
    total_gen_tokens = 0
    for img in images:
        path = img.get("path", "assets/generated.png")
        if not path.endswith('.png'):
            path = os.path.splitext(path)[0] + '.png'
        base_prompt = img.get("prompt", "A high-quality brand asset")
        
        # Call Gemini to get an ELITE prompt
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Request: {base_prompt}\nDesign Tokens: {json.dumps(design_tokens)}")
        ]
        
        try:
            response = await llm.ainvoke(messages)
            tokens = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)
            total_gen_tokens += tokens
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            
            p_data = json.loads(content)
            img["refined_prompt"] = p_data.get("prompt", base_prompt)
        except Exception as e:
            print(f"Prompt refinement failed: {e}")
            img["refined_prompt"] = base_prompt
            p_data = {"prompt": base_prompt}
            
        img["status"] = "fulfilled"
        img["local_path"] = f"assets/{os.path.basename(path)}" # Relative to the project root
        
        # ELITE: Actually fulfill the image
        try:
            import requests
            search_query = p_data.get("prompt", base_prompt)
            clean_query = search_query.replace(" ", ",").lower()
            image_url = f"https://loremflickr.com/1280/800/{clean_query},professional,cinematic"
            
            print(f"Fulfilling asset {path} to Project Hub ({project_id})...")
            img_data = requests.get(image_url, timeout=15, allow_redirects=True).content
            
            # Binary write to isolated path
            local_full_path = os.path.join(project_hub_path, path)
            os.makedirs(os.path.dirname(local_full_path), exist_ok=True)
            
            with open(local_full_path, "wb") as f:
                f.write(img_data)
            print(f"Asset {path} saved to disk: {local_full_path}")
        except Exception as e:
            print(f"Failed to fulfill image {path}: {e}")
            img["status"] = "failed"
            
        updated_images.append(img)
        
    return {
        "images_to_generate": updated_images,
        "current_step": "image_generation_complete",
        "total_tokens": total_gen_tokens,
        "token_usage": {"image_generator": total_gen_tokens}
    }
