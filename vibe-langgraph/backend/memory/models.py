from typing import Optional, List, Dict
from sqlmodel import SQLModel, Field, JSON
from datetime import datetime
import uuid

class Project(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_intent: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    framework: Optional[str] = Field(default="vanilla")
    status: str = Field(default="draft") # draft, generating, completed, error
    files: Dict = Field(default={}, sa_type=JSON)
    dependency_graph: Dict = Field(default={}, sa_type=JSON)
    reasoning: Optional[str] = Field(default=None)
    plan_summary: Optional[str] = Field(default=None)
    design_tokens: Dict = Field(default={}, sa_type=JSON)
    mock_data: Dict = Field(default={}, sa_type=JSON)
    copy_data: Dict = Field(default={}, sa_type=JSON)
    seo_report: Dict = Field(default={}, sa_type=JSON)
    images_to_generate: List[Dict] = Field(default=[], sa_type=JSON)
    total_tokens: int = Field(default=0)
    token_usage: Dict = Field(default={}, sa_type=JSON)
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
