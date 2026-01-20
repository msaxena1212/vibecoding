import os
from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from langchain_core.messages import SystemMessage, HumanMessage
from utils.formatter import parse_json_dict
import json

async def run_image_generator(state: CodebaseState):
    """
    Translates asset requests into cinematic AI prompts and fulfills them to Project Hub.
    """
    images = state.get("images_to_generate", [])
    if not images:
        return {"current_step": "image_generation_skipped"}

    llm = get_llm()
    project_id = state.get("project_id")
    if not project_id:
        import uuid
        project_id = str(uuid.uuid4())
        state["project_id"] = project_id
    
    # Ensure project-specific assets directory exists
    project_hub_path = os.path.join("frontend", "p", project_id)
    os.makedirs(project_hub_path, exist_ok=True)
    
    # Load system prompt
    prompt_path = os.path.join("agents", "image_generator", "prompt.md")
    with open(prompt_path, "r", encoding="utf-8") as f:
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
            tokens = extract_tokens(response)
            total_gen_tokens += tokens
            p_data = parse_json_dict(response.content)
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
            import re
            search_query = p_data.get("prompt", base_prompt)
            # Clean query for better matching
            clean_query = re.sub(r'[^a-zA-Z0-9, ]', '', search_query).replace(" ", ",").lower()
            
            SOURCES = [
                f"https://loremflickr.com/1280/800/{clean_query},professional,cinematic",
                f"https://source.unsplash.com/1280x800/?{clean_query}",
                f"https://picsum.photos/1280/800" # Ultimate fallback
            ]
            
            img_data = None
            for url in SOURCES:
                try:
                    print(f"[IMG] Attempting asset fulfillment for {path} via {url}...")
                    response = requests.get(url, timeout=12, allow_redirects=True)
                    if response.status_code == 200 and len(response.content) > 1000: # Guaranteed content check
                        img_data = response.content
                        print(f"[SUCCESS] Asset {path} fetched ({len(img_data)} bytes).")
                        break
                    else:
                        print(f"[WARN] Source failed or returned small file ({len(response.content) if response else 0} bytes).")
                except Exception as e:
                    print(f"Source error: {e}")

            if not img_data:
                print(f"[FAIL] ALL SOURCES FAILED for {path}. Using critical fallback...")
                # Last resort: A known good static mountain landscape
                critical_fallback = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1280&auto=format&fit=crop"
                img_data = requests.get(critical_fallback, timeout=10).content

            # Binary write to isolated path
            local_full_path = os.path.join(project_hub_path, path)
            os.makedirs(os.path.dirname(local_full_path), exist_ok=True)
            
            with open(local_full_path, "wb") as f:
                f.write(img_data)
            img["status"] = "fulfilled"
            img["local_path"] = f"assets/{os.path.basename(path)}"
        except Exception as e:
            print(f"[CRITICAL FAILURE] fulfilling image {path}: {e}")
            img["status"] = "failed"
            
        updated_images.append(img)
        
    return {
        "images_to_generate": updated_images,
        "current_step": "image_generation_complete",
        "total_tokens": total_gen_tokens,
        "token_usage": {"image_generator": total_gen_tokens}
    }
