from fastapi import FastAPI
from .routes import generate, edit, validate
import uvicorn

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vibe LangGraph API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api/v1/generate", tags=["generate"])
app.include_router(edit.router, prefix="/api/v1/edit", tags=["edit"])
app.include_router(validate.router, prefix="/api/v1/validate", tags=["validate"])

from backend.utils.db import init_db

@app.on_event("startup")
async def on_startup():
    try:
        await init_db()
        print("INFO: Database initialized successfully.")
    except Exception as e:
        print(f"ERROR: Could not connect to the database: {e}")
        print("HINT: If you are seeing 'getaddrinfo failed', your network might not support IPv6.")
        print("HINT: Try using the Supabase 'Pooled' connection string from your dashboard.")
        print("HINT: Alternatively, comment out DATABASE_URL in .env to use local SQLite.")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Vibe-LangGraph API is online"}

@app.get("/api/v1/projects")
async def get_projects():
    from backend.apps.api.deps import get_project_store
    store = get_project_store()
    projects = await store.get_history()
    return projects

@app.get("/api/v1/projects/{project_id}/messages")
async def get_project_messages(project_id: str):
    from backend.apps.api.deps import get_project_store
    store = get_project_store()
    messages = await store.get_chat_messages(project_id)
    return messages

@app.get("/api/v1/projects/{project_id}")
async def get_project(project_id: str):
    from backend.apps.api.deps import get_project_store
    from fastapi import HTTPException
    
    store = get_project_store()
    project = await store.get_latest(project_id)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return project

@app.get("/api/v1/projects/{project_id}/files/{file_path:path}")
async def get_project_file(project_id: str, file_path: str):
    from backend.apps.api.deps import get_project_store
    from fastapi import HTTPException, Response
    import mimetypes
    
    store = get_project_store()
    project = await store.get_latest(project_id)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    files = project.get("files", {})
    content = files.get(file_path)
    
    if content is None:
        # Try adding leading slash if missing
        content = files.get(f"/{file_path}")
        
    if content is None:
         # Try removing leading slash if present
        if file_path.startswith("/"):
            content = files.get(file_path[1:])
            
    if content is None:
        raise HTTPException(status_code=404, detail="File not found")
        
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "text/plain"
        
    return Response(content=content, media_type=mime_type)

    uvicorn.run("backend.apps.api.main:app", host="0.0.0.0", port=8000, reload=True)
