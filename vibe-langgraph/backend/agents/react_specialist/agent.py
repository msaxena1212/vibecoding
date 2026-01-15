from backend.graph.agent_runner import run_agent_with_tools
from backend.graph.state import CodebaseState

def run_react_specialist(state: CodebaseState):
    """
    Agent focused on React Best Practices, Vite Configuration, and NPM Scripts.
    """
    system_prompt = """You are a Lead Frontend Engineer specialized in React and Vite.
Your goal is to ensure the generated codebase is a 100% compliant, "production-ready" React project.
Use your tools to:
1. Ensure `package.json` exists and contains EXACTLY these scripts: 
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"
   }
2. Ensure the project structure follows standard conventions (src/ folder, components/, index.html).
3. Ensure all files use proper ES6 imports/exports (`import React from 'react'`, `export default ...`).
Do NOT use the CDN-based "Instant Preview" hack; use proper module syntax.
Focus on fixing any "npm error Missing script: build" issues.
"""
    return run_agent_with_tools(state, "react_specialist", system_prompt)
