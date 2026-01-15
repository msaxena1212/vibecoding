from typing import List, Dict, Optional
from langchain_core.tools import tool
import os
import re

@tool
def write_file_tool(path: str, content: str, language: Optional[str] = None) -> str:
    """
    Writes content to a specific file in the virtual codebase.
    If the file exists, it overwrites it.
    """
    # In this production setup, we return a structural update that the graph manager applies to the state
    return f"Prepared update for {path}"

from backend.agents.ui_specialist.tools import style_audit_tool, unsplash_asset_tool
from backend.agents.react_specialist.tools import react_audit_tool
from backend.agents.backend_architect.tools import code_analysis_tool

def get_agent_tools(agent_name: str):
    """
    Returns the specific toolset for a given agent.
    """
    tool_map = {
        "ui_specialist": [write_file_tool, style_audit_tool, unsplash_asset_tool],
        "backend_architect": [write_file_tool, code_analysis_tool],
        "copywriter": [write_file_tool],
        "seo_specialist": [code_analysis_tool, style_audit_tool],
        "react_specialist": [write_file_tool, react_audit_tool],
        "debugger_agent": [code_analysis_tool, react_audit_tool],
    }
    return tool_map.get(agent_name, [])
