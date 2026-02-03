from langchain_core.messages import SystemMessage, HumanMessage
from utils.llm import get_llm, extract_tokens
from graph.state import CodebaseState
import json
import os

async def run_generator(state: CodebaseState):
    print("\n=== [GENERATOR STARTING] ===")
    llm = get_llm()
    plan = state.get("plan", {})
    files_to_create = plan.get("files", [])
    
    generated_files = state.get("files", {}).copy()
    total_tokens = state.get("total_tokens", 0)
    
    # Load prompt
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "prompt.md")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        system_prompt_template = f.read()

    total_gen_tokens = 0
    proposed_patches = []
    
    # Pre-fetch index.html content if it exists (for consistency context)
    reference_context = ""
    
    for file_info in files_to_create:
        path = file_info.get("path")
        description = file_info.get("description")
        
        # SKIP GENERATION IF ALREADY HANDLED BY SPECIALIST
        if path in generated_files and generated_files[path].get("lastEditedBy") in ["backend_architect", "react_specialist"]:
            print(f"Skipping generation for {path} (already handled by {generated_files[path]['lastEditedBy']})")
        else:
            print(f"Generating {path}...")
            # ... rest of the generation logic ...
            history = state.get("messages", [])
            design_tokens = state.get("design_tokens", {})
            mock_data = state.get("mock_data", {})
            copy_data = state.get("copy_data", {})
            generated_images = {img["path"]: img["local_path"] for img in state.get("images_to_generate", []) if "local_path" in img}
            
            reasoning = state.get("reasoning", "")
            reasoning = state.get("reasoning", "")
            plan_summary = state.get("plan_summary", "")
            user_intent = state.get("userIntent", "high-end")

            # REACT CONTEXT INJECTION
            current_context = ""
            if "src/App.jsx" in generated_files:
                 current_context += f"\n\n[REFERENCE FILE: src/App.jsx]\n{generated_files['src/App.jsx']['content']}\n[END REFERENCE]"
            
            components_created = [k for k in generated_files.keys() if isinstance(k, str) and "components/" in k]
            if components_created:
                current_context += f"\n\n[EXISTING COMPONENTS]: {', '.join(components_created)}"   

            messages = [
                SystemMessage(content=system_prompt_template)
            ] + history + [
                HumanMessage(content=f"Generate the file: {path}\nDescription: {description}\n\nProject Reasoning: {reasoning}\nTechnical Plan: {plan_summary}\n\nExisting State: {str(generated_files.keys())}\nDesign Tokens: {json.dumps(design_tokens)}\nMock Data: {json.dumps(mock_data)}\nCopy Data: {json.dumps(copy_data)}\nAvailable Assets: {json.dumps(generated_images)}{current_context}\n\n[LOGIC INJECTION]: You MUST generate explicitly styled components. Use 'style={{}}' for background-images, gradients, or dynamic values to match the '{user_intent}' vibe. Use Tailwind for structure. DO NOT RETURN PLAIN HTML.")
            ]
            
            try:
                from utils.llm import resilient_call
                response = await resilient_call(llm.ainvoke, messages)
                tokens = extract_tokens(response)
                total_gen_tokens += tokens
                content = response.content
                
                # Clean and parse JSON
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                from utils.formatter import parse_json_dict
                response_json = parse_json_dict(content)
                operations = response_json.get("operations", [])
                
                for op in operations:
                    op_type = op.get("type")
                    op_path = op.get("path")
                    op_content = op.get("content")
                    op_desc = op.get("description", f"{op_type} {op_path}")
                    
                    if not op_path or not op_content:
                        continue
                    
                    # PATH ENFORCEMENT: Ensure React code goes to src/
                    root_allowlist = [
                        "package.json", "vite.config.js", "tailwind.config.js", "postcss.config.js", 
                        "index.html", ".gitignore", "README.md", ".env", "prisma/schema.prisma",
                        "public/index.html", "tsconfig.json", "jsconfig.json", "eslint.config.js",
                        "server.js", "Dockerfile", "docker-compose.yml"
                    ]
                    
                    # Normalizing path separator and cleaning dots
                    clean_path = op_path.replace("\\", "/").strip("./")
                    
                    # If it's a backend file, allow "services/"
                    if clean_path.startswith("services/"):
                         pass
                    elif clean_path in root_allowlist or clean_path.startswith("."):
                         # Files starting with . (like .env, .gitignore) should stay root
                         if clean_path == "public/index.html":
                              print(f"[PATH CORRECTION] Moving {clean_path} to index.html")
                              clean_path = "index.html"
                    elif clean_path.startswith("public/"):
                         pass
                    elif not clean_path.startswith("src/"):
                         # Force src/ prefix for everything else (code, styles, etc)
                         print(f"[PATH CORRECTION] Moving {clean_path} to src/{clean_path}")
                         clean_path = f"src/{clean_path}"
                    
                    op_path = clean_path
                    
                    # PATH HYGIENE: Sync index.html script tags
                    if clean_path == "index.html":
                         import re
                         # Fix: Use relative paths for Vite resolution
                         op_content = re.sub(r'src="/src/index\.jsx"', 'src="./src/index.jsx"', op_content)
                         op_content = re.sub(r'src="src/index\.jsx"', 'src="./src/index.jsx"', op_content)
                    
                    # ESM SAFETY: Enforce export default for config files in type: module projects
                    config_files = ["vite.config.js", "tailwind.config.js", "postcss.config.js"]
                    if clean_path in config_files:
                        if "module.exports" in op_content:
                            print(f"[ESM CORRECTION] Converting CommonJS to ESM for {clean_path}")
                            op_content = op_content.replace("module.exports =", "export default")
                            op_content = op_content.replace("module.exports=", "export default")

                    # DIRECT ACT: Update State & Persist
                    generated_files[op_path] = {
                        "content": op_content,
                        "lastEditedBy": "generator"
                    }
                    
                    try:
                        project_id = state.get("project_id")
                        if not project_id:
                             import uuid
                             project_id = str(uuid.uuid4())
                             state["project_id"] = project_id
                             
                        full_path = os.path.join("frontend", "p", project_id, op_path)
                        os.makedirs(os.path.dirname(full_path), exist_ok=True)
                        with open(full_path, "w", encoding="utf-8") as f:
                            f.write(op_content)
                        print(f"[GENERATOR] Persisted: {op_path}")
                    except Exception as e:
                        print(f"[FAIL] Generator failed to persist {op_path}: {e}")

                    # Keep patch record if needed for logs
                    patch = {
                        "op": op_type,
                        "path": op_path,
                        "content": op_content,
                        "language": "json" if op_path.endswith(".json") else ("python" if op_path.endswith(".py") else "javascript"),
                        "description": op_desc
                    }
                    proposed_patches.append(patch)

            except Exception as e:
                print(f"[ERROR] generating {path}: {e}")

    # --- SAFETY NET: Ensure logic integrity ---
    required_files = {
        "package.json": {
            "content": json.dumps({
                "name": "vibe-project",
                "version": "1.0.0",
                "type": "module",
                "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
                "dependencies": {
                    "react": "^18.2.0", "react-dom": "^18.2.0", "react-router-dom": "^6.22.0",
                    "framer-motion": "^11.0.0", "lucide-react": "^0.400.0", "clsx": "^2.1.0", "tailwind-merge": "^2.2.0"
                },
                "devDependencies": { "vite": "^5.0.0", "tailwindcss": "^3.4.0", "postcss": "^8.4.0", "autoprefixer": "^10.4.0" }
            }, indent=2),
            "description": "Safety Net: Standard package.json"
        },
        "index.html": {
            "content": '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Vibe App</title>\n</head>\n<body class="bg-black text-white">\n  <div id="root"></div>\n  <script type="module" src="./src/index.jsx"></script>\n</body>\n</html>',
            "description": "Safety Net: Standard index.html"
        },
        "src/index.jsx": {
            "content": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.jsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(<App />);",
            "description": "Safety Net: React entry point"
        },
        "src/App.jsx": {
            "content": "import React from 'react';\nimport { HashRouter as Router, Routes, Route } from 'react-router-dom';\n\nexport default function App() {\n  return (\n    <Router>\n      <div className='min-h-screen bg-black text-white flex items-center justify-center'>\n        <h1 className='text-4xl font-bold'>Senior Vibe App</h1>\n      </div>\n    </Router>\n  );\n}",
            "description": "Safety Net: Minimum App shell"
        },
        "src/index.css": {
            "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nhtml, body { height: 100%; width: 100%; overflow-x: hidden; background: black; }",
            "description": "Safety Net: Injected Tailwind CSS"
        },
        "postcss.config.js": {
            "content": "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}",
            "description": "Safety Net: PostCSS Config (ESM)"
        },
        "tailwind.config.js": {
            "content": "/** @type {import('tailwindcss').Config} */\nexport default {\n  content: [\n    \"./index.html\",\n    \"./src/**/*.{js,ts,jsx,tsx}\",\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}",
            "description": "Safety Net: Tailwind Config (ESM)"
        },
        "vite.config.js": {
             "content": "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n  base: './',\n  build: {\n    outDir: 'dist',\n  },\n  server: {\n    host: true,\n    strictPort: true,\n  }\n})",
             "description": "Safety Net: Vite Config (ESM)"
        }
    }

    for path, data in required_files.items():
        if not any(p == path for p in generated_files.keys()):
            print(f"[SAFETY NET] Injecting missing {path}")
            
            # Update State
            generated_files[path] = {
                "content": data["content"],
                "lastEditedBy": "generator_safetynet"
            }
            
            # Persist
            try:
                project_id = state.get("project_id")
                full_path = os.path.join("frontend", "p", project_id, path)
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, "w", encoding="utf-8") as f:
                    f.write(data["content"])
            except Exception: pass
            
            proposed_patches.append({
                "op": "create_file",
                "path": path,
                "content": data["content"],
                "language": "json" if path.endswith(".json") else "javascript" if path.endswith(".jsx") or path.endswith(".js") else "css" if path.endswith(".css") else "html",
                "description": data["description"]
            })

    # Return updated files AND patches
    return {
        "files": generated_files,
        "proposed_patches": proposed_patches,
        "current_step": "generation_complete", 
        "total_tokens": total_gen_tokens,
        "token_usage": {"generator": total_gen_tokens},
        "model_calls": 1
    }
