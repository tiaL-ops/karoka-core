from typing import Optional, Dict, Any
from enum import Enum
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class SessionStatusEnum(str, Enum):
    completed = 'completed'
    in_progress = 'in_progress'
    abandoned = 'abandoned'


class GameSessionBase(BaseModel):
    user_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    arena_played: Optional[str] = None
    final_score: Optional[int] = None
    hints_used_count: Optional[int] = 0
    total_time_spent_seconds: Optional[int] = None
    status: SessionStatusEnum

    checkpoint_data: Optional[Dict[str, Any]] = None
    # e.g.
    # {
    #   "room_id": "room_1",
    #   "player_x": 100,
    #   "player_y": 200,
    #   "inventory": ["key", "map"],
    #   "puzzle_states": {
    #       "diamond_puzzle": {"status": "in_progress", "buckets": {"X": 1, "Y": 0, "Z": 0}}
    #    }
    # }

    challenge_attempts_count: Optional[int] = 0
    documentation_access_count: Optional[int] = 0


class GameSessionCreate(GameSessionBase):
    # id, created_at, last_updated_at come from the database
    pass


class GameSessionRead(GameSessionBase):
    id: UUID
    created_at: datetime
    last_updated_at: datetime

    class Config:
        orm_mode = True
