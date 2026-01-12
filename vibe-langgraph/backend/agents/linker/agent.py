from backend.graph.state import CodebaseState

def run_linker(state: CodebaseState):
    from backend.utils.file_parser import extract_imports
    
    files = state.get("files", {})
    dependency_graph = {}
    
    for filename, file_data in files.items():
        content = file_data.get("content", "")
        language = file_data.get("language", "python")
        
        # Extract imports
        imports = extract_imports(content, language)
        file_data["imports"] = imports
        
        # Build dependency graph
        # This is a simplified version; real linking needs path resolution
        dependency_graph[filename] = imports
        
    return {"files": files, "dependencyGraph": dependency_graph, "current_step": "linking_complete"}
