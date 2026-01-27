from typing import TypedDict, List, Dict, Optional, Any, Literal, Annotated
import operator

def merge_usage(a: Dict[str, int], b: Dict[str, int]) -> Dict[str, int]:
    new_usage = a.copy()
    for k, v in b.items():
        new_usage[k] = new_usage.get(k, 0) + v
    return new_usage

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
    reasoning: str # Architectural reasoning
    design_tokens: Dict[str, Any] # Visual tokens
    plan_summary: str # High level summary
    copy_data: Dict[str, Any] # Elite copywriting
    seo_report: Optional[Dict[str, Any]]
    images_to_generate: List[Dict[str, str]] # [{path: str, prompt: str}]
    diagnostic_report: Optional[str]
    fix_instructions: Optional[str]
    current_step: str
    total_tokens: Annotated[int, operator.add]
    token_usage: Annotated[Dict[str, int], merge_usage] # Granular usage per agent
    project_id: Optional[str]
    retry_count: Annotated[int, operator.add]
    errors: List[str]
    suggested_actions: List[str]
    attempted_fixes: List[str] # Track attempted fixes to avoid loops
    proposed_patches: List[Dict[str, Any]] # Structured patches waiting for validation
    compile_phase: Optional[Literal["install", "build", "dev_check", "test", "complete"]] # Track build progress
