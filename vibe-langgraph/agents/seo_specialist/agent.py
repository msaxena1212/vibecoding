import os
from graph.state import CodebaseState
from utils.llm import get_llm
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
    prompt_path = os.path.join("agents", "seo_specialist", "prompt.md")
    with open(prompt_path, "r") as f:
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
    tokens = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)
    
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    
    try:
        report = json.loads(content)
        if report.get("status") == "optimize":
            return {
                "current_step": "needs_fix",
                "diagnostic_report": f"SEO/Performance Alert: {report.get('optimizations_recommended')}",
                "total_tokens": tokens,
                "token_usage": {"seo_specialist": tokens}
            }
            
        return {
            "seo_report": report,
            "current_step": "seo_audit_complete",
            "total_tokens": tokens,
            "token_usage": {"seo_specialist": tokens}
        }
    except:
        return {
            "current_step": "seo_audit_complete",
            "total_tokens": tokens,
            "token_usage": {"seo_specialist": tokens}
        }
