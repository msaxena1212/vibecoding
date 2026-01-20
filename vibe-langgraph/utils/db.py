from sqlmodel import SQLModel, create_engine, text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from typing import AsyncGenerator
import os
from dotenv import load_dotenv

load_dotenv()

# Get DB URL from .env, handle the typical "postgresql://" vs "postgres://"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create Async Engine
# Note: "statement_cache_size": 0 is required for Supabase Transaction/Session poolers 
# because they don't support prepared statements in this mode.
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"statement_cache_size": 0} 
)

async def init_db():
    async with engine.begin() as conn:
        # await conn.run_sync(SQLModel.metadata.drop_all) # WARNING: Dev only
        await conn.run_sync(SQLModel.metadata.create_all)
        
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
        # We split commands because asyncpg/sqlalchemy doesn't support multiple statements in one execute call easily
        await conn.execute(text("DROP TRIGGER IF EXISTS update_project_updated_at ON project;"))
        
        await conn.execute(text("""
        CREATE TRIGGER update_project_updated_at
        BEFORE UPDATE ON project
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
        """))

async def get_db_engine() -> AsyncEngine:
    return engine
