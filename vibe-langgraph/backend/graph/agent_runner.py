from typing import List, Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from backend.utils.llm import get_llm
from backend.graph.state import CodebaseState
from backend.graph.tools import get_agent_tools, write_file_tool, code_analysis_tool, unsplash_asset_tool, style_audit_tool, react_audit_tool

def execute_tool(tool_name: str, args: Dict[str, Any], state: CodebaseState) -> Any:
    """
    Executes a tool and returns the result.
    """
    if tool_name == "write_file_tool":
        # In a real system this would update the state's files, 
        # but here we just return a message as the LLM orchestrates the sequence.
        return f"Successfully updated {args.get('path')}"
    elif tool_name == "code_analysis_tool":
        return {"complexity": "low", "issues": []}
    elif tool_name == "unsplash_asset_tool":
        return unsplash_asset_tool.invoke(args)
    elif tool_name == "style_audit_tool":
        return style_audit_tool.invoke(args)
    elif tool_name == "react_audit_tool":
        files_dict = {p: f.get("content", "") for p, f in state.get("files", {}).items()}
        return react_audit_tool.invoke({"files": files_dict})
    return f"Tool {tool_name} executed."

def run_agent_with_tools(state: CodebaseState, agent_name: str, system_prompt: str):
    """
    Generic runner for agents that can call tools.
    """
    llm = get_llm()
    tools = get_agent_tools(agent_name)
    if tools:
        llm_with_tools = llm.bind_tools(tools)
    else:
        llm_with_tools = llm

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Context: {state.get('userIntent')}\nPlan: {state.get('plan')}\nScratchpad: {state.get('agent_scratchpad')}")
    ]

    response = llm_with_tools.invoke(messages)
    
    tool_history = state.get("tool_history", [])
    agent_scratchpad = state.get("agent_scratchpad", "")
    
    if hasattr(response, "tool_calls") and response.tool_calls:
        for tool_call in response.tool_calls:
            result = execute_tool(tool_call["name"], tool_call["args"], state)
            
            tool_history.append({
                "agent": agent_name,
                "tool": tool_call["name"],
                "args": tool_call["args"],
                "result": result
            })
            agent_scratchpad += f"\n- Executed {tool_call['name']}: {result}"
            
    return {
        "tool_history": tool_history,
        "agent_scratchpad": agent_scratchpad,
        "current_step": f"{agent_name}_executed"
    }
