from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class DocumentationTopicBase(BaseModel):
    topic_name: str
    content: str
    difficulty_level: Optional[int] = None
    associated_vark_modalities: Optional[List[str]] = None
    llm_template_id: Optional[UUID] = None


class DocumentationTopicCreate(DocumentationTopicBase):
    # id, created_at, updated_at come from DB
    pass


class DocumentationTopicRead(DocumentationTopicBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
