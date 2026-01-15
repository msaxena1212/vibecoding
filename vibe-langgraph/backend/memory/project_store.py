from sqlmodel import select
from typing import Dict, Any, Optional, List
from datetime import datetime
from backend.utils.db import engine
from backend.memory.models import Project, ChatMessage, ProjectSnapshot
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
                    files = state.get("files", {})
                    deps = state.get("dependencyGraph", {})
                    agent_config = state.get("agent_config", project.assigned_agents)
                    
                    # Force dict type for JSON fields to avoid Pydantic errors
                    if not isinstance(files, dict): files = {}
                    if not isinstance(deps, dict): deps = {}
                    if not isinstance(agent_config, dict): agent_config = {}
                    
                    project.files = files
                    project.dependency_graph = deps
                    project.total_tokens = state.get("total_tokens", 0)
                    project.flow_type = state.get("flow_type", project.flow_type)
                    project.assigned_agents = agent_config
                    project.current_node = state.get("current_node", project.current_node)
                    project.framework = state.get("framework", project.framework)
                    project.plan = state.get("plan", project.plan)
                    project.diagnostics = state.get("diagnostics", project.diagnostics)
                    project.mode = state.get("mode", project.mode)
                    
                    if not project.user_intent:
                        project.user_intent = user_intent
                    
                    new_desc = state.get("plan", {}).get("plan_summary")
                    if new_desc:
                        project.description = new_desc
                        
                    project.updated_at = datetime.utcnow()
                    session.add(project)
                    
                    snapshot = ProjectSnapshot(
                        project_id=project.id,
                        files=files,
                        dependency_graph=deps,
                        change_summary=state.get("change_summary", "")
                    )
                    session.add(snapshot)
                    
                    await session.commit()
                    return project.id

            # Create new if no ID or ID not found
            files = state.get("files", {})
            deps = state.get("dependencyGraph", {})
            agent_config = state.get("agent_config", {})
            
            if not isinstance(files, dict): files = {}
            if not isinstance(deps, dict): deps = {}
            if not isinstance(agent_config, dict): agent_config = {}

            project = Project(
                user_intent=user_intent,
                description=state.get("plan", {}).get("plan_summary"),
                framework=state.get("framework", {"name": "react", "version": "18"}),
                status="completed",
                mode=state.get("mode", "generate"),
                flow_type=state.get("flow_type", "code"),
                assigned_agents=agent_config,
                plan=state.get("plan", {}),
                diagnostics=state.get("diagnostics", {"errors": [], "warnings": []}),
                current_node=state.get("current_node", "start"),
                files=files,
                dependency_graph=deps,
                total_tokens=state.get("total_tokens", 0)
            )
            session.add(project)
            await session.flush()
            
            snapshot = ProjectSnapshot(
                project_id=project.id,
                files=files,
                dependency_graph=deps,
                change_summary="Initial commit"
            )
            session.add(snapshot)
            
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
                    "plan": project.plan,
                    "diagnostics": project.diagnostics,
                    "mode": project.mode,
                    "total_tokens": project.total_tokens,
                    "description": project.description
                }
            return None

project_store = ProjectStore()
