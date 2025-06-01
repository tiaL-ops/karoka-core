from typing import Optional
from enum import Enum
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class HintModalityEnum(str, Enum):
    visual = 'visual'
    aural = 'aural'
    read_write = 'read_write'
    kinesthetic = 'kinesthetic'
    general = 'general'


class HintBase(BaseModel):
    challenge_id: str
    hint_sequence_number: int
    modality_preference: HintModalityEnum

    content_text: str
    content_audio_url: Optional[str] = None

    is_llm_generated_template: bool = False
    llm_template_id: Optional[UUID] = None


class HintCreate(HintBase):
    # id, created_at, updated_at come from DB
    pass


class HintRead(HintBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
