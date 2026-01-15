from typing import Optional, List, Dict
from sqlmodel import SQLModel, Field, JSON
from datetime import datetime
import uuid

class Project(SQLModel, table=True):
    __tablename__ = "project"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_intent: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    framework: Dict = Field(default={"name": "react", "version": "18"}, sa_type=JSON)
    status: str = Field(default="draft") # draft, generating, completed, error
    mode: str = Field(default="generate")
    flow_type: Optional[str] = Field(default="code") # code, conversation
    assigned_agents: Dict = Field(default={}, sa_type=JSON)
    plan: Dict = Field(default={}, sa_type=JSON)
    current_node: str = Field(default="start")
    files: Dict = Field(default={}, sa_type=JSON)
    dependency_graph: Dict = Field(default={}, sa_type=JSON)
    diagnostics: Dict = Field(default={"errors": [], "warnings": []}, sa_type=JSON)
    total_tokens: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        arbitrary_types_allowed = True

class GenerationLog(SQLModel, table=True):
    __tablename__ = "generation_log"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    project_id: str = Field(foreign_key="project.id", index=True)
    agent_name: str
    step_name: str
    content: str # Can be JSON string or text
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_message"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    project_id: str = Field(foreign_key="project.id", index=True)
    role: str # user, assistant, system
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectSnapshot(SQLModel, table=True):
    __tablename__ = "project_snapshot"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    project_id: str = Field(foreign_key="project.id", index=True)
    files: Dict = Field(default={}, sa_type=JSON)
    dependency_graph: Dict = Field(default={}, sa_type=JSON)
    change_summary: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)
