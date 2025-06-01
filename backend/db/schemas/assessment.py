from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class AssessmentTypeEnum(str, Enum):
    pre_assessment = 'pre_assessment'
    post_assessment = 'post_assessment'
    in_game_challenge = 'in_game_challenge'
    vark_test = 'vark_test'


class AssessmentBase(BaseModel):
    user_id: str
    type: AssessmentTypeEnum
    challenge_id: Optional[str] = None

    score: Optional[float] = None
    completion_time_seconds: Optional[int] = None
    raw_responses_json: Optional[Dict[str, Any]] = None


class AssessmentCreate(AssessmentBase):
    # id and submitted_at come from DB
    pass


class AssessmentRead(AssessmentBase):
    id: UUID
    submitted_at: datetime

    class Config:
        orm_mode = True
