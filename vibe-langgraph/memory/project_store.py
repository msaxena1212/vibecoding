from sqlmodel import select
from typing import Dict, Any, Optional, List
from datetime import datetime
from utils.db import engine
from memory.models import Project, ChatMessage
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
                    project.token_usage = state.get("token_usage", {})
                    project.reasoning = state.get("reasoning")
                    project.plan_summary = state.get("plan_summary")
                    project.design_tokens = state.get("design_tokens", {})
                    project.mock_data = state.get("mock_data", {})
                    project.copy_data = state.get("copy_data", {})
                    project.seo_report = state.get("seo_report", {})
                    project.images_to_generate = state.get("images_to_generate", [])
                    project.updated_at = datetime.utcnow()
                    session.add(project)
                    await session.commit()
                    return project.id

            # Create new if no ID or ID not found
            project = Project(
                id=project_id if project_id else str(uuid.uuid4()),
                user_intent=user_intent,
                description=state.get("plan", {}).get("plan_summary"),
                framework=state.get("framework", "vanilla"),
                status="completed",
                files=state.get("files", {}),
                dependency_graph=state.get("dependencyGraph", {}),
                total_tokens=state.get("total_tokens", 0),
                token_usage=state.get("token_usage", {}),
                reasoning=state.get("reasoning"),
                plan_summary=state.get("plan_summary"),
                design_tokens=state.get("design_tokens", {}),
                mock_data=state.get("mock_data", {}),
                copy_data=state.get("copy_data", {}),
                seo_report=state.get("seo_report", {}),
                images_to_generate=state.get("images_to_generate", [])
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
                    "token_usage": project.token_usage,
                    "reasoning": project.reasoning,
                    "plan_summary": project.plan_summary,
                    "design_tokens": project.design_tokens,
                    "mock_data": project.mock_data,
                    "copy_data": project.copy_data,
                    "seo_report": project.seo_report,
                    "images_to_generate": project.images_to_generate
                }
            return None

project_store = ProjectStore()
