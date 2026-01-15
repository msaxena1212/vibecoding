from backend.graph.state import CodebaseState

def run_linker(state: CodebaseState):
    from backend.utils.file_parser import extract_imports
    import os
    
    files = state.get("files", {})
    dependency_graph = {}
    missing_imports = []
    
    for filename, file_data in files.items():
        content = file_data.get("content", "")
        language = file_data.get("language", "react") # Default to react for generative context
        
        # 1. Extract raw import strings
        raw_imports = extract_imports(content, language)
        file_data["raw_imports"] = raw_imports
        
        # 2. Resolve paths
        resolved_imports = []
        base_dir = os.path.dirname(filename)
        
        for imp in raw_imports:
            # Skip absolute/library imports (no dot)
            if not imp.startswith("."):
                resolved_imports.append(imp)
                continue
            
            # Resolve relative path
            # Normalize to avoid .././ etc.
            normalized_path = os.path.normpath(os.path.join(base_dir, imp)).replace("\\", "/")
            
            # Check for possible extensions if not provided
            possible_paths = [normalized_path]
            if not any(normalized_path.endswith(ext) for ext in [".jsx", ".js", ".css", ".png", ".jpg"]):
                possible_paths.extend([f"{normalized_path}.jsx", f"{normalized_path}.js", f"{normalized_path}.css"])
            
            # Verify existence in state
            found = False
            for p in possible_paths:
                if p in files:
                    resolved_imports.append(p)
                    found = True
                    break
            
            if not found:
                missing_imports.append({
                    "file": filename,
                    "target": imp,
                    "resolved_path_attempt": normalized_path
                })
        
        file_data["imports"] = resolved_imports
        dependency_graph[filename] = resolved_imports
        
    return {
        "files": files, 
        "dependencyGraph": dependency_graph, 
        "missing_imports": missing_imports,
        "current_step": "linking_complete"
    }
