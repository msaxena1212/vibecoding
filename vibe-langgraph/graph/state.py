from typing import TypedDict, List, Dict, Optional, Any, Literal

class FileState(TypedDict):
    content: str
    language: str
    imports: List[str]
    exports: List[str]
    lastEditedBy: str

class CodebaseState(TypedDict):
    files: Dict[str, FileState]
    dependencyGraph: Dict[str, List[str]]
    framework: Literal["nextjs", "react", "expo"]
    userIntent: str
    messages: List[Any] # To track conversation history/agent messages
    plan: Dict[str, Any] # The generated plan
    current_step: str
    total_tokens: int
    errors: List[str]
