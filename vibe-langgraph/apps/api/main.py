from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from apps.api.routes import generate, edit, validate, report
import uvicorn
import os

app = FastAPI(title="Vibe LangGraph API", version="0.1.0")

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api/v1/generate", tags=["generate"])
app.include_router(edit.router, prefix="/api/v1/edit", tags=["edit"])
app.include_router(validate.router, prefix="/api/v1/validate", tags=["validate"])
app.include_router(report.router, prefix="/api/v1/projects", tags=["report"])

import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/javascript', '.jsx')

# ROBUST PATH RESOLUTION
# Get the project root directory (3 levels up from apps/api/main.py)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
PROJECTS_DIR = os.path.join(FRONTEND_DIR, "p")

if not os.path.exists(FRONTEND_DIR):
    os.makedirs(FRONTEND_DIR, exist_ok=True)
if not os.path.exists(PROJECTS_DIR):
    os.makedirs(PROJECTS_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")

@app.get("/")
async def root():
    return FileResponse(os.path.join(FRONTEND_DIR, 'index.html'))

# SPA Fallback for Projects
@app.get("/static/p/{project_id}/{file_path:path}")
async def serve_project_files(project_id: str, file_path: str):
    import os
    from fastapi import HTTPException
    
    project_root = os.path.join(PROJECTS_DIR, project_id)
    
    # Security check: prevent directory traversal
    if ".." in file_path:
        raise HTTPException(status_code=400, detail="Invalid path")

    # 1. Try exact match in dist (Priority for built apps)
    dist_full_path = os.path.join(project_root, "dist", file_path)
    if os.path.exists(dist_full_path) and os.path.isfile(dist_full_path):
        return FileResponse(dist_full_path)

    # 2. Try exact match in root (For source files or raw assets)
    full_path = os.path.join(project_root, file_path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return FileResponse(full_path)
    
    # 3. SPA Fallback: If not found, and likely a route, serve index.html
    # Only fallback if it DOES NOT have an extension (likely a route like /about)
    filename = os.path.basename(file_path)
    if "." not in filename:
        # Serve dist/index.html if built
        dist_index = os.path.join(project_root, "dist", "index.html")
        if os.path.exists(dist_index):
             return FileResponse(dist_index)
        # Fallback to root index.html (experimental/dev)
        root_index = os.path.join(project_root, "index.html")
        if os.path.exists(root_index):
             return FileResponse(root_index)

    raise HTTPException(status_code=404, detail="File not found")

from utils.db import init_db

@app.on_event("startup")
async def on_startup():
    pass

@app.get("/api/v1/projects")
async def get_projects():
    from apps.api.deps import get_project_store
    import traceback
    try:
        store = get_project_store()
        projects = await store.get_history()
        
        return [p.model_dump() for p in projects]
    except Exception as e:
        print(f"CRITICAL ERROR in get_projects: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/projects/{project_id}/messages")
async def get_project_messages(project_id: str):
    from apps.api.deps import get_project_store
    store = get_project_store()
    messages = await store.get_chat_messages(project_id)
    return messages

if __name__ == "__main__":
    uvicorn.run("apps.api.main:app", host="0.0.0.0", port=8000, reload=True)
