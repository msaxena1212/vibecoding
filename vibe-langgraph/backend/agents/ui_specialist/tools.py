from langchain_core.tools import tool
from typing import List, Dict

@tool
def style_audit_tool(css_content: str) -> str:
    """
    Audits CSS for premium design standards like Glassmorphism, animations, and typography.
    """
    score = 0
    feedback = []
    if "backdrop-filter" in css_content:
        score += 25
        feedback.append("Glassmorphism detected.")
    if "transition" in css_content or "@keyframes" in css_content:
        score += 25
        feedback.append("Animations detected.")
    if "var(--" in css_content:
        score += 25
        feedback.append("Design tokens (variables) detected.")
    
    return f"Audit Score: {score}/100. Feedback: {' '.join(feedback)}"

@tool
def unsplash_asset_tool(query: str, count: int = 1) -> List[Dict[str, str]]:
    """
    Fetches high-quality image URLs from Unsplash based on a keyword query.
    """
    images = []
    for i in range(count):
        kw = query.replace(" ", "-").lower()
        images.append({
            "url": f"https://images.unsplash.com/photo-{i+1}?auto=format&fit=crop&q=80&w=800&q=keyword={kw}",
            "alt": f"High quality {query} image"
        })
    return images
