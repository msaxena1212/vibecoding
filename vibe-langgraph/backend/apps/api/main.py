from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .routes import generate, edit, validate
import uvicorn
import os

app = FastAPI(title="Vibe LangGraph API", version="0.1.0")

app.include_router(generate.router, prefix="/api/v1/generate", tags=["generate"])
app.include_router(edit.router, prefix="/api/v1/edit", tags=["edit"])
app.include_router(validate.router, prefix="/api/v1/validate", tags=["validate"])

# Create frontend directory if it doesn't exist
if not os.path.exists("../frontend"):
    os.makedirs("../frontend", exist_ok=True)

# Mount frontend directory for static assets and generated files
# We mount it at /static so that /static/p/{id}/index.html works
# html=True allows serving HTML files from subdirectories
app.mount("/static", StaticFiles(directory="../frontend", html=True), name="static")

# Serve the main index.html for the root route
@app.get("/")
async def root():
    return FileResponse('../frontend/index.html')

from utils.db import init_db

@app.on_event("startup")
async def on_startup():
    # Transaction Poolers often fail with DDL (CREATE TABLE).
    # We will run the schema manually via Supabase SQL Editor.
    # await init_db()
    pass

@app.get("/api/v1/projects")
async def get_projects():
    from apps.api.deps import get_project_store
    import traceback
    try:
        store = get_project_store()
        projects = await store.get_history()
        # Explicitly convert models to dicts to avoid serialization edge cases
        # Using model_dump() as recommended for Pydantic v2 / SQLModel
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
