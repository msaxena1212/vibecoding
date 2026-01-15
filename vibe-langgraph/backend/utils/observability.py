from typing import List, Dict, Any
from datetime import datetime
from backend.graph.state import CodebaseState, AgentEvent

def log_agent_event(state: CodebaseState, agent_name: str, action: str, duration_ms: float = 0, state_delta: List[str] = None) -> Dict[str, Any]:
    """
    Log an event to the state's observability layer.
    """
    event: AgentEvent = {
        "agent": agent_name,
        "action": action,
        "durationMs": duration_ms,
        "stateDelta": state_delta or [],
        "timestamp": datetime.utcnow().isoformat()
    }
    
    events = state.get("observability", [])
    events.append(event)
    
    return {"observability": events}
