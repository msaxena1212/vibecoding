from sqlmodel import SQLModel, create_engine, text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from typing import AsyncGenerator
import os
from dotenv import load_dotenv
import backend.memory.models # Ensure models are loaded

load_dotenv()

# Get DB URL from .env, handle the typical "postgresql://" vs "postgres://"
# Get DB URL from .env
DATABASE_URL = os.getenv("DATABASE_URL", "")
IS_SQLITE = False

if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./local_dev.db"
    IS_SQLITE = True
    print("WARNING: No DATABASE_URL found. Using local SQLite database.")
else:
    # Handle Supabase/Postgres URL conversion
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create Async Engine
connect_args = {}
if not IS_SQLITE:
    # Necessary for Supabase SSL and PgBouncer compatibility
    connect_args = {
        "statement_cache_size": 0
    }
    if "supabase.co" in DATABASE_URL:
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ctx

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    connect_args=connect_args
)

async def init_db():
    async with engine.begin() as conn:
        # await conn.run_sync(SQLModel.metadata.drop_all) # WARNING: Dev only
        await conn.run_sync(SQLModel.metadata.create_all)
        
        if not IS_SQLITE:
            # Create function to update updated_at timestamp
            await conn.execute(text("""
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = now();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
            """))
            
            # Create trigger for project table if it doesn't exist
            await conn.execute(text("DROP TRIGGER IF EXISTS update_project_updated_at ON project;"))
            
            await conn.execute(text("""
            CREATE TRIGGER update_project_updated_at
            BEFORE UPDATE ON project
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
            """))

async def get_db_engine() -> AsyncEngine:
    return engine
