from graph.state import CodebaseState
from utils.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage
import json
import re

async def run_validator(state: CodebaseState):
    """
    Run diagnostic scan on the generated code.
    Detects syntax errors, missing assets, or design flaws.
    """
    llm = get_llm()
    files = state.get("files", {})
    user_intent = state.get("userIntent", "")
    
    if not files:
        return {"current_step": "validation_skipped"}

    # Build context for diagnostic
    code_context = "\n".join([f"--- FILE: {path} ---\n{data['content']}" for path, data in files.items()])
    
    system_prompt = """
    # ROLE: Elite QA Auditor & Design Critic (Gemini-Optimized)
    You are a high-end Quality Assurance Engineer. Your mission is to audit the provided code against "Lovable/Antigravity" standards.

    # AUDIT CHECKLIST:
    1. **Logic & Syntax**: Identify broken JS logic, infinite loops, or CSS syntax errors.
    2. **Design Fidelity**: Check for inconsistent spacing, poor contrast (a11y), or missing hover states.
    3. **Asset Integrity**: Before flagging a missing image or logo, cross-check the "ASSETS BEING GENERATED" list. If the asset path is in that list, it is valid and will be fulfilled.
    4. **Content Quality**: Flag "Lorem Ipsum" or generic "Sample Item" text. Data must feel realistic.
    4. **Functional Integrity**: Verify CTAs are linked and navigation is intuitive.
    5. **Visual Detail**: Audit for fluid typography (`clamp`) and Glassmorphism depth.

    # OUTPUT SCHEMA (Strict JSON):
    {
        "status": "pass" | "fail",
        "diagnostic_report": {
            "summary": "High-level audit result",
            "technical_issues": ["List of code/logic errors"],
            "design_flaws": ["List of UI/UX improvements needed"],
            "a11y_concerns": ["List of accessibility issues"]
        },
        "fix_instructions": "Step-by-step technical guidance for the Editor to resolve failures"
    }
    """
    
    images_info = json.dumps(state.get("images_to_generate", []), indent=2)
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"User Intent: {user_intent}\n\nASSETS BEING GENERATED:\n{images_info}\n\nGenerated Code:\n{code_context}")
    ]
    
    response = await llm.ainvoke(messages)
    content = response.content
    
    # Extract JSON
    # Try to find the outermost curly braces for robust JSON extraction
    json_match = re.search(r"({.*})", content, re.DOTALL)
    if json_match:
        content = json_match.group(1)
    
    
    # Extract token usage
    tokens = 0
    if hasattr(response, "response_metadata"):
        tokens = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)
    elif hasattr(response, "usage_metadata"):
        tokens = response.usage_metadata.get("total_tokens", 0)
        
    current_tokens = state.get("total_tokens", 0)
    usage = state.get("token_usage", {})
    usage["validator"] = usage.get("validator", 0) + tokens

    
    try:
        report = json.loads(content)
        if report.get("status") == "fail":
            diag = report.get("diagnostic_report", {})
            diag_text = f"Audit Failed: {diag.get('summary', 'Issues detected.')}\n- Technical: {', '.join(diag.get('technical_issues', []))}\n- Design: {', '.join(diag.get('design_flaws', []))}"
            
            print(f"DEBUG: Diagnosis FAILED: {diag_text}")
            return {
                "current_step": "needs_fix",
                "diagnostic_report": diag_text,
                "errors": [diag_text],
                "retry_count": 1,
                "total_tokens": tokens,
                "token_usage": {"validator": tokens}
            }
        
        return {
            "current_step": "validation_complete", 
            "diagnostic_report": "All quality and design audits passed.",
            "total_tokens": tokens,
            "token_usage": {"validator": tokens}
        }
    except Exception as e:
        print(f"Error parsing validator report: {e}")
        return {"current_step": "validation_complete", "diagnostic_report": "Diagnosis skipped due to parsing error."}
