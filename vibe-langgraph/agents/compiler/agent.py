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

    # 1. INSTALL
    log("Installing dependencies...")
    stdout, stderr, code = await run_command_safe("npm install --no-audit --no-fund", project_path)
    
    if code != 0:
        log(f"Install failed: {stderr[:200]}", "error")
        return {
             "current_step": "build_error",
             "diagnostic_report": f"NPM INSTALL FAILED:\n{stderr}\n{stdout}",
             "fix_instructions": "Review package.json dependencies for version conflicts or typos. If Prisma is failing and you don't need it, remove it from package.json.",
             "errors": [f"npm install failed: {stderr}"],
             "retry_count": 1,
             "logs": logs
        }

    # 2. BUILD
    log("Building project...")
    stdout, stderr, code = await run_command_safe("npm run build", project_path)
        
    if code != 0:
        log(f"Build failed: {stderr[:200]}", "error")
        # Common Vite errors are often in stderr OR stdout
        full_log = f"{stdout}\n{stderr}"
        
        # Smart Error Classification
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
            "logs": logs
        }

    log("Build passed.", "system")

    # 3. START BACKGROUND SERVER
    # 3. VERIFY DIST OUTPUT
    dist_path = os.path.join(project_path, "dist")
    if not os.path.exists(dist_path):
        log("Build finished but 'dist' directory missing.", "error")
        return {
            "current_step": "build_error",
            "diagnostic_report": "Build verification failed: 'dist' folder not found after build.",
            "fix_instructions": "Ensure vite.config.js is configured to output to 'dist'.",
            "errors": ["Missing dist directory"],
            "retry_count": 1, 
            "logs": logs
        }
        
    log(f"Build verified. Output at {dist_path}", "system")

    return {
        "current_step": "compilation_complete",
        "diagnostic_report": "Build Successful. Server starting in background.",
        "logs": logs
    }
