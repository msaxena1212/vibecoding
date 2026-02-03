
import os
import sys
from typing import List

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.vector_store import VectorStore

def get_files_to_index(root_dir: str) -> List[str]:
    files_to_index = []
    skipped_dirs = {'.git', '__pycache__', 'node_modules', '.venv', '.chroma_db', 'site-packages'}
    allowed_extensions = {'.py', '.md', '.txt', '.yaml', '.yml', '.json'}
    
    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to skip specific directories
        dirs[:] = [d for d in dirs if d not in skipped_dirs]
        
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in allowed_extensions:
                files_to_index.append(os.path.join(root, file))
                
    return files_to_index

def index_codebase():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"Indexing codebase at: {root_dir}")
    
    vs = VectorStore(collection_name="codebase_index", persist_directory=os.path.join(root_dir, ".chroma_db"))
    
    files = get_files_to_index(root_dir)
    print(f"Found {len(files)} files to index.")
    
    documents = []
    metadatas = []
    ids = []
    
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if not content.strip():
                continue
                
            # Naive chunking: just entire file for now
            # For better results, use a TextSplitter
            rel_path = os.path.relpath(file_path, root_dir)
            documents.append(content)
            metadatas.append({"source": rel_path})
            ids.append(rel_path)
            
        except Exception as e:
            print(f"Skipping {file_path}: {e}")
            
    if documents:
        print(f"Adding {len(documents)} documents to ChromaDB...")
        # Add in batches to avoid hitting limits
        batch_size = 50
        for i in range(0, len(documents), batch_size):
            end = i + batch_size
            try:
                vs.add_documents(
                    documents=documents[i:end],
                    metadatas=metadatas[i:end],
                    ids=ids[i:end]
                )
                print(f"Indexed batch {i} to {end}")
            except Exception as e:
                print(f"Error indexing batch {i}: {e}")
    
    print("Indexing complete.")
    print(f"Total documents in index: {vs.count()}")

if __name__ == "__main__":
    index_codebase()
