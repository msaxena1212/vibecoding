from fastapi import FastAPI
from .routes import generate, edit, validate
import uvicorn

app = FastAPI(title="Vibe LangGraph API", version="0.1.0")

app.include_router(generate.router, prefix="/api/v1/generate", tags=["generate"])
app.include_router(edit.router, prefix="/api/v1/edit", tags=["edit"])
app.include_router(validate.router, prefix="/api/v1/validate", tags=["validate"])

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Create frontend directory if it doesn't exist
if not os.path.exists("frontend"):
    os.makedirs("frontend", exist_ok=True)

app.mount("/static", StaticFiles(directory="frontend"), name="static")

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
    return FileResponse('frontend/index.html')

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

    uvicorn.run("backend.apps.api.main:app", host="0.0.0.0", port=8000, reload=True)
