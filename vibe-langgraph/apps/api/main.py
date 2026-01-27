from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from apps.api.routes import generate, edit, validate, report
import uvicorn
import os

app = FastAPI(title="Vibe LangGraph API", version="0.1.0")

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

app.mount("/static/p", StaticFiles(directory=PROJECTS_DIR, html=True), name="project_static")
app.mount("/static", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")

@app.get("/")
async def root():
    return FileResponse(os.path.join(FRONTEND_DIR, 'index.html'))

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
