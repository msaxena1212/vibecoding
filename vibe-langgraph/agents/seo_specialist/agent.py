import os
from graph.state import CodebaseState
from utils.llm import get_llm, extract_tokens
from utils.formatter import parse_json_dict
from langchain_core.messages import SystemMessage, HumanMessage
import json

async def run_seo_specialist(state: CodebaseState):
    """
    Audits generated code for SEO and Performance.
    """
    llm = get_llm()
    files = state.get("files", {})
    
    if not files:
        return {"current_step": "seo_skipped"}

    # Load system prompt
    # Load system prompt
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "prompt.md")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        system_prompt = f.read()

    # Audit the main HTML file primarily
    html_files = {p: d['content'] for p, d in files.items() if p.endswith('.html')}
    content_to_audit = "\n\n".join([f"--- FILE: {p} ---\n{c}" for p, c in html_files.items()])

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Audit this project for SEO/Performance:\n\n{content_to_audit}")
    ]

    response = await llm.ainvoke(messages)
    content = response.content
    tokens = extract_tokens(response)
    
    report = parse_json_dict(content)
    
    if report and report.get("status") == "optimize":
        return {
            "current_step": "needs_fix",
            "diagnostic_report": f"SEO/Performance Alert: {report.get('optimizations_recommended')}",
            "total_tokens": tokens,
            "token_usage": {"seo_specialist": tokens}
        }
        
    return {
        "seo_report": report or {},
        "current_step": "seo_audit_complete",
        "total_tokens": tokens,
        "token_usage": {"seo_specialist": tokens}
    }
