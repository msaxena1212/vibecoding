import chromadb
from chromadb.utils import embedding_functions
import os
from typing import List, Dict, Any, Optional
import uuid

class VectorStore:
    def __init__(self, collection_name: str = "codebase_index", persist_directory: str = "./.chroma_db"):
        try:
            self.client = chromadb.PersistentClient(path=persist_directory)
            self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                embedding_function=self.embedding_fn
            )
            self.active = True
        except Exception as e:
            print(f"[VectorStore] Initialization failed: {e}")
            self.active = False
            self.collection = None

    def add_documents(self, documents: List[str], metadatas: List[Dict[str, Any]], ids: Optional[List[str]] = None):
        """
        Add documents to the vector store safely.
        """
        if not self.active or not self.collection:
            return

        try:
            if not ids:
                ids = [str(uuid.uuid4()) for _ in documents]
                
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
        except Exception as e:
            print(f"[VectorStore] add_documents failed: {e}")

    def search(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search for relevant documents safely.
        """
        if not self.active or not self.collection:
            return []

        try:
            # Safety check for empty collection
            if self.collection.count() == 0:
                return []

            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            # Format results
            formatted_results = []
            if results["documents"]:
                for i in range(len(results["documents"][0])):
                    formatted_results.append({
                        "content": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                        "id": results["ids"][0][i],
                        "distance": results["distances"][0][i] if results["distances"] else None
                    })
                    
            return formatted_results
        except Exception as e:
            print(f"[VectorStore] search failed: {e}")
            return []

    def delete_collection(self):
        """
        Delete the entire collection safely.
        """
        if not self.active:
            return
        try:
            self.client.delete_collection(self.collection.name)
        except Exception as e:
            print(f"[VectorStore] delete_collection failed: {e}")

    def count(self):
        if not self.active or not self.collection:
            return 0
        try:
            return self.collection.count()
        except Exception as e:
            return 0
