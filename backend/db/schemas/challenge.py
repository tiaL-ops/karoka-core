from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

from pydantic import BaseModel


class ChallengeTypeEnum(str, Enum):
    code_puzzle = 'code_puzzle'
    drag_and_drop = 'drag_and_drop'
    dialogue_challenge = 'dialogue_challenge'
    navigation_puzzle = 'navigation_puzzle'


class DifficultyEnum(str, Enum):
    easy = 'easy'
    medium = 'medium'
    hard = 'hard'


class ChallengeBase(BaseModel):
    arena_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    challenge_type: ChallengeTypeEnum

    expected_solution_data: Dict[str, Any]
    # e.g. {"expected_output": "Rasoa is 2 years old"}
    # or {"validation_function_name": "validate_rasoa_puzzle"}

    difficulty_level: Optional[DifficultyEnum] = None
    associated_vark_modalities: Optional[List[str]] = None
    # e.g. ["Visual", "Kinesthetic"]


class ChallengeCreate(ChallengeBase):
    # id, created_at, updated_at come from DB
    pass


class ChallengeRead(ChallengeBase):
    id: str  # UUID or VARCHAR
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
