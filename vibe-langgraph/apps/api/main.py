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

from utils.db import init_db

@app.on_event("startup")
async def on_startup():
    # Transaction Poolers often fail with DDL (CREATE TABLE).
    # We will run the schema manually via Supabase SQL Editor.
    # await init_db()
    pass

@app.get("/")
async def root():
    return FileResponse('frontend/index.html')

@app.get("/api/v1/projects")
async def get_projects():
    from apps.api.deps import get_project_store
    store = get_project_store()
    projects = await store.get_history()
    return projects

if __name__ == "__main__":
    uvicorn.run("apps.api.main:app", host="0.0.0.0", port=8000, reload=True)
