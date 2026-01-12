from sqlmodel import select
from typing import Dict, Any, Optional, List
from datetime import datetime
from backend.utils.db import engine
from backend.memory.models import Project, ChatMessage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

class ProjectStore:
    def __init__(self):
        self.async_session = sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )

    async def save_snapshot(self, user_intent: str, state: Dict[str, Any], project_id: Optional[str] = None) -> str:
        async with self.async_session() as session:
            if project_id:
                statement = select(Project).where(Project.id == project_id)
                result = await session.execute(statement)
                project = result.scalar_one_or_none()
                
                if project:
                    project.files = state.get("files", {})
                    project.dependency_graph = state.get("dependencyGraph", {})
                    project.total_tokens = state.get("total_tokens", 0)
                    # Keep the original title (user_intent) if it already has one
                    if not project.user_intent:
                        project.user_intent = user_intent
                    
                    # Only update description if it's missing or if we have a new plan summary
                    new_desc = state.get("plan", {}).get("plan_summary")
                    if new_desc:
                        project.description = new_desc
                        
                    project.updated_at = datetime.utcnow()
                    session.add(project)
                    await session.commit()
                    return project.id

            # Create new if no ID or ID not found
            project = Project(
                user_intent=user_intent,
                description=state.get("plan", {}).get("plan_summary"),
                framework=state.get("framework", "vanilla"),
                status="completed",
                files=state.get("files", {}),
                dependency_graph=state.get("dependencyGraph", {}),
                total_tokens=state.get("total_tokens", 0)
            )
            session.add(project)
            await session.commit()
            await session.refresh(project)
            return project.id

    async def add_chat_message(self, project_id: str, role: str, content: str) -> str:
        async with self.async_session() as session:
            msg = ChatMessage(
                project_id=project_id,
                role=role,
                content=content
            )
            session.add(msg)
            await session.commit()
            await session.refresh(msg)
            return msg.id

    async def get_history(self) -> List[Project]:
        async with self.async_session() as session:
            statement = select(Project).order_by(Project.created_at.desc())
            result = await session.execute(statement)
            return result.scalars().all()

    async def get_chat_messages(self, project_id: str) -> List[ChatMessage]:
        async with self.async_session() as session:
            statement = select(ChatMessage).where(ChatMessage.project_id == project_id).order_by(ChatMessage.created_at.asc())
            result = await session.execute(statement)
            return result.scalars().all()

    async def get_latest(self, project_id: str) -> Optional[Dict]:
        async with self.async_session() as session:
            statement = select(Project).where(Project.id == project_id)
            result = await session.execute(statement)
            project = result.scalar_one_or_none()
            
            if project:
                return {
                    "files": project.files,
                    "dependencyGraph": project.dependency_graph,
                    "userIntent": project.user_intent,
                    "framework": project.framework,
                    "total_tokens": project.total_tokens,
                    "description": project.description
                }
            return None

project_store = ProjectStore()
