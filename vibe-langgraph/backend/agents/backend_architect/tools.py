from langchain_core.tools import tool
from typing import List, Dict

@tool
def code_analysis_tool(files: Dict[str, str]) -> Dict[str, List[str]]:
    """
    Analyzes a set of files to extract imports, exports, and basic structural metadata.
    Pass a dictionary of {path: content}.
    """
    from backend.utils.file_parser import extract_imports
    results = {}
    for path, content in files.items():
        lang = "python" if path.endswith(".py") else "javascript"
        results[path] = extract_imports(content, lang)
    return results
