import os
import subprocess
import asyncio
from graph.state import CodebaseState
from langchain_core.messages import SystemMessage, HumanMessage

async def run_compiler(state: CodebaseState):
    logs = []
    def log(msg, source="compiler"):
        print(f"[{source.upper()}] {msg}")
        logs.append({"content": msg, "source": source})

    log("=== [COMPILER STARTING] ===")
    
    project_id = state.get("project_id")
    if not project_id:
        log("No project_id found for compilation.", "error")
        return {"current_step": "compilation_skipped", "errors": ["No project_id found."], "logs": logs}

    # Resolve project path
    base_path = os.path.abspath(f"frontend/p/{project_id}")
    if not os.path.exists(base_path):
        log(f"Project directory not found: {base_path}", "error")
        return {"current_step": "compilation_failed", "errors": [f"Directory not found: {base_path}"], "logs": logs}

    # Check for package.json
    package_json = os.path.join(base_path, "package.json")
    if not os.path.exists(package_json):
        log("No package.json found. Skipping compilation.")
        return {"current_step": "compilation_skipped", "logs": logs}

    # Helper to run shell commands
    async def run_command_safe(cmd, cwd):
        def _run():
            try:
                # Use shell=True for Windows command compatibility (npm usually needs it)
                result = subprocess.run(
                    cmd, 
                    shell=True, 
                    cwd=cwd, 
                    capture_output=True, 
                    text=True, 
                    encoding='utf-8',
                    errors='replace'
                )
                return result.stdout, result.stderr, result.returncode
            except Exception as e:
                return "", str(e), 1

        log(f"Executing: {cmd} in {cwd}")
        return await asyncio.to_thread(_run)

    project_path = base_path 
    compile_phase = state.get("compile_phase", "install")
    log(f"Current Phase: {compile_phase}")

    # --- PHASE 1: INSTALL ---
    if compile_phase == "install":
        # OPTIMIZATION: Skip install if node_modules exists to speed up "auto-fix" loops
        if os.path.exists(os.path.join(project_path, "node_modules")):
            log("Phase 1: node_modules exists. Skipping 'npm install' for speed.", "system")
            return {
                "current_step": "compilation_progress",
                "compile_phase": "build",
                "logs": logs
            }

        log("Phase 1: Installing dependencies...")
        stdout, stderr, code = await run_command_safe("npm install --no-audit --no-fund", project_path)
        
        if code != 0:
            log(f"Install failed: {stderr[:200]}", "error")
            return {
                "current_step": "build_error",
                "diagnostic_report": f"NPM INSTALL FAILED:\n{stderr}\n{stdout}",
                "fix_instructions": "Review package.json dependencies for version conflicts or typos. Ensure all dependencies are valid.",
                "errors": [f"npm install failed: {stderr}"],
                "retry_count": 1,
                "logs": logs,
                "compile_phase": "install" # Stay in install phase
            }
        
        log("Install passed. Moving to Build phase.", "system")
        return {
            "current_step": "compilation_progress",
            "compile_phase": "build",
            "logs": logs
        }

    # --- PHASE 2: BUILD ---
    if compile_phase == "build":
        log("Phase 2: Building project...")
        stdout, stderr, code = await run_command_safe("npm run build", project_path)
            
        if code != 0:
            # --- AUTO-FIX: Missing index.css ---
            # Verified common issue: Vite fails if src/index.css is missing.
            if 'Could not resolve "./index.css"' in stderr or 'Could not resolve "./index.css"' in stdout:
                 log("[AUTO-FIX] Detected missing index.css. Injecting default Tailwind CSS...", "system")
                 css_path = os.path.join(project_path, "src", "index.css")
                 
                 # Ensure src exists
                 os.makedirs(os.path.dirname(css_path), exist_ok=True)
                 
                 default_css = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nhtml, body { height: 100%; width: 100%; overflow-x: hidden; }"
                 with open(css_path, "w", encoding="utf-8") as f:
                     f.write(default_css)
                     
                 log("[AUTO-FIX] Created src/index.css. Retrying build...", "system")
                 # RETRY BUILD (Internal Loop)
                 stdout, stderr, code = await run_command_safe("npm run build", project_path)
            
            # Re-check after potential auto-fix
            if code != 0:
                log(f"Build failed: {stderr[:200]}", "error")
                full_log = f"{stdout}\n{stderr}"
                
                diagnostic_prefix = "Build Compilation Failed"
                fix_hint = "Check for syntax errors, missing imports, or incorrect Vite configuration."
                
                if "Could not resolve" in full_log or "Module not found" in full_log:
                    diagnostic_prefix = "MISSING_FILE"
                    fix_hint = "A file is imported but does not exist. Create the missing file."
                elif "SyntaxError" in full_log:
                    diagnostic_prefix = "SYNTAX_ERROR"
                    fix_hint = "Fix the syntax error in the code."
                    
                return {
                    "current_step": "build_error",
                    "diagnostic_report": f"{diagnostic_prefix}:\n{full_log}",
                    "fix_instructions": fix_hint,
                    "errors": [f"npm run build failed: {stderr}"],
                    "retry_count": 1,
                    "logs": logs,
                    "compile_phase": "build" # Stay in build phase
                }

        # Verify Dist
        dist_path = os.path.join(project_path, "dist")
        if not os.path.exists(dist_path):
            log("Build finished but 'dist' directory missing.", "error")
            return {
                "current_step": "build_error",
                "diagnostic_report": "Build verification failed: 'dist' folder not found after build.",
                "fix_instructions": "Ensure vite.config.js is configured to output to 'dist'.",
                "errors": ["Missing dist directory"],
                "retry_count": 1, 
                "logs": logs,
                "compile_phase": "build"
            }
            
        log("Build passed. Moving to Dev Check phase.", "system")
        return {
            "current_step": "compilation_progress",
            "compile_phase": "dev_check",
            "logs": logs
        }

    # --- PHASE 3: DEV CHECK (Runtime) ---
    if compile_phase == "dev_check":
        log("Phase 3: Verify Runtime (Dev Server)...")
        
        # We don't actually leave the server running in this workflow, 
        # we just want to ensure it CAN start without immediate crash.
        # But for 'npm run dev', it blocks. So we need a timeout approach.
        
        # For now, let's assume if build works, dev likely works unless runtime crash on init.
        # A true runtime check requires a browser or headless browser.
        # We will assume "Build" is sufficient for "Dev" in this headless environment for now, 
        # but the user requested "npm run dev".
        
        # Let's try running it with a timeout to catch immediate startup errors.
        # REPLACEMENT: Use subprocess.Popen in a thread to avoid asyncio EventLoop issues on Windows
        async def check_dev_server():
            def _check():
                import time
                try:
                    # Start the process
                    # shell=True is needed for 'npm' on Windows
                    process = subprocess.Popen(
                        "npm run dev",
                        cwd=project_path,
                        shell=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        encoding='utf-8',
                        errors='replace'
                    )
                    
                    # Wait 10 seconds
                    try:
                        stdout, stderr = process.communicate(timeout=10)
                        return_code = process.returncode
                    except subprocess.TimeoutExpired:
                        # Timeout means it's running (Success for a server)
                        process.kill()
                        # We can't easily get stdout/stderr here without blocking or reading streams
                        # But if it timed out, it started.
                        return "", "", 0
                        
                    return stdout, stderr, return_code
                except Exception as e:
                    return "", str(e), 1

            return await asyncio.to_thread(_check)

        stdout, stderr, code = await check_dev_server()
        
        if code != 0:
             log(f"Dev server crashed: {stderr[:200]}", "error")
             return {
                "current_step": "build_error",
                "diagnostic_report": f"Runtime Crash (npm run dev):\n{stderr}\n{stdout}",
                "fix_instructions": "Fix runtime errors that occur on startup.",
                "errors": [f"npm run dev crashed: {stderr}"],
                "retry_count": 1,
                "logs": logs,
                "compile_phase": "dev_check"
            }

        log(f"Dev server verified. Moving to Test phase.", "system")
        return {
            "current_step": "compilation_progress",
            "compile_phase": "test",
            "logs": logs
        }

    # --- PHASE 4: TEST (Automated Smoke Tests) ---
    if compile_phase == "test":
        log("Phase 4: Running automated tests (npm test)...")
        
        # Check if test script exists in package.json to avoid phantom failure
        pkg_path = os.path.join(project_path, "package.json")
        has_test = False
        try:
             import json
             with open(pkg_path, 'r') as f:
                 pkg = json.load(f)
                 if "test" in pkg.get("scripts", {}):
                     has_test = True
        except: pass

        if not has_test:
            log("No 'test' script found in package.json. Skipping testing phase.", "warning")
            return {
                "current_step": "compilation_complete",
                "compile_phase": "complete",
                "logs": logs
            }

        stdout, stderr, code = await run_command_safe("npm test", project_path)
        
        if code != 0:
             log(f"Tests failed: {stderr[:200]}", "error")
             return {
                "current_step": "build_error",
                "diagnostic_report": f"Automated Tests Failed:\n{stderr}\n{stdout}",
                "fix_instructions": "Fix the test failures. This often indicates a component crashed on mount or a missing context (like Router).",
                "errors": [f"npm test failed: {stderr}"],
                "retry_count": 1,
                "logs": logs,
                "compile_phase": "test"
            }

        log(f"Tests passed. Build pipeline complete.", "system")
        return {
            "current_step": "compilation_complete",
            "compile_phase": "complete",
            "logs": logs
        }


    return {
        "current_step": "compilation_complete",
        "diagnostic_report": "Build pipeline finished.",
        "logs": logs
    }

