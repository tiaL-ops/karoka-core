from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class ContentTypeEnum(str, Enum):
    hint = 'hint'
    documentation = 'documentation'
    dialogue = 'dialogue'


class LLMContentHistoryBase(BaseModel):
    session_id: UUID
    user_id: str
    inferred_modality: Optional[str] = None

    prompt_used: str
    generated_content: str
    content_type: ContentTypeEnum

    llm_template_id: Optional[UUID] = None
    challenge_id: Optional[str] = None

    response_time_ms: Optional[int] = None
    token_usage_input: Optional[int] = None
    token_usage_output: Optional[int] = None
    cost_estimate: Optional[float] = None


class LLMContentHistoryCreate(LLMContentHistoryBase):
    # id and request_timestamp come from DB
    pass


class LLMContentHistoryRead(LLMContentHistoryBase):
    id: UUID
    request_timestamp: datetime

    class Config:
        orm_mode = True
