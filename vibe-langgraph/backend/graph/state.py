from typing import TypedDict, List, Dict, Optional, Any, Literal

class FileState(TypedDict):
    content: str
    language: str
    imports: List[str]
    exports: List[str]
    artifactType: Literal["code", "config", "doc"]
    generatedBy: str
    lastEditedBy: str

class RouterOutput(TypedDict):
    primaryMode: Literal["generate", "modify", "debug", "explain"]
    secondaryModes: Optional[List[str]]
    confidence: float
    reasoning: Optional[str]

class AgentEvent(TypedDict):
    agent: str
    action: str
    durationMs: float
    stateDelta: List[str]
    timestamp: str

class ValidationError(TypedDict):
    id: str
    type: Literal["syntax", "import", "config", "framework"]
    file: str
    message: str
    severity: Literal["warning", "blocking", "critical", "minor"]
    autoFixable: bool

class Diagnostics(TypedDict):
    errors: List[ValidationError]
    warnings: List[ValidationError]

class PlanState(TypedDict):
    steps: List[str]
    filesToCreate: List[str]
    filesToModify: List[str]
    version: int

class FrameworkState(TypedDict):
    name: Literal["react", "next", "node", "custom"]
    version: Optional[str]

class ConversationState(TypedDict):
    messages: List[Any]
    lastAgentResponse: str

class CodebaseState(TypedDict):
    # --- Stratified State Layers (HOW_IT_WORKS.md Section 14.2) ---
    intent: RouterOutput
    plan: PlanState
    files: Dict[str, FileState] # Maps to codeState
    diagnostics: Diagnostics
    conversation: ConversationState
    observability: List[AgentEvent] # Maps to executionState
    
    # --- Core Fields (for backward compatibility and convenience) ---
    userIntent: str
    mode: Literal["generate", "modify", "debug", "explain"]
    framework: FrameworkState
    
    # --- Internal Orchestration & Legacy Fields ---
    agent_config: Dict[str, Any]
    flow_type: Literal["code", "conversation"]
    needs_modification: bool
    is_debug_explain: bool
    change_summary: str
    current_step: str
    total_tokens: int
    gemini_hits: int
    
    # --- Versioning ---
    planVersion: int
    fileVersions: Dict[str, int]
    
    # --- Specialized/Legacy Agent Fields ---
    dependencyGraph: Dict[str, List[str]]
    copy: Optional[str]
    image_prompts: Optional[List[str]]
    seo_audit: Optional[str]
    images: Optional[List[Dict[str, str]]]
    
    # Production Agentic fields
    tool_history: List[Dict[str, Any]]
    agent_scratchpad: str
    errors: List[str] # Deprecated, use diagnostics
