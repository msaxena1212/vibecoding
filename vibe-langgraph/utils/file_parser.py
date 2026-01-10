import re
from typing import List, Dict

def extract_imports(content: str, language: str) -> List[str]:
    """
    Simple regex-based import extractor. 
    Real implementation would use tree-sitter or language-specific parsers.
    """
    imports = []
    if language in ["python", "py"]:
        imports.extend(re.findall(r'^import (\w+)', content, re.MULTILINE))
        imports.extend(re.findall(r'^from (\w+) import', content, re.MULTILINE))
    elif language in ["javascript", "typescript", "react", "nextjs", "js", "ts", "tsx"]:
        # Match import ... from '...'
        imports.extend(re.findall(r'from\s+[\'"](.*?)[\'"]', content))
        # Match require('...')
        imports.extend(re.findall(r'require\s*\(\s*[\'"](.*?)[\'"]\s*\)', content))
    return list(set(imports))

def parse_file(content: str, filename: str) -> Dict:
    language = "python" if filename.endswith(".py") else "typescript" # Simplification
    return {
        "content": content,
        "language": language,
        "imports": extract_imports(content, language),
    }
