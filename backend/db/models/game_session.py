from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
import uuid
from sqlalchemy import Column, String, Integer, DateTime, func, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship

from database import Base

StatusEnum = SAEnum('completed', 'in_progress', 'abandoned', name='session_status_enum')

class GameSession(Base):
    __tablename__ = 'game_sessions'

    # If you prefer SERIAL/BIGINT, change to Integer/BigInteger + autoincrement=True
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)

    arena_played = Column(String, nullable=True)
    final_score = Column(Integer, nullable=True)
    hints_used_count = Column(Integer, nullable=False, default=0)
    total_time_spent_seconds = Column(Integer, nullable=True)

    status = Column(StatusEnum, nullable=False, default='in_progress')

    checkpoint_data = Column(JSONB, nullable=True)
    # example structure for checkpoint_data:
    # {
    #   "room_id": "room_1",
    #   "player_x": 100,
    #   "player_y": 200,
    #   "inventory": ["key", "map"],
    #   "puzzle_states": {
    #       "diamond_puzzle": {"status": "in_progress", "buckets": {"X": 1, "Y": 0, "Z": 0}}
    #    }
    # }

    challenge_attempts_count = Column(Integer, nullable=False, default=0)
    documentation_access_count = Column(Integer, nullable=False, default=0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    last_updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    user = relationship('User', back_populates='game_sessions')
    log_events = relationship('LogEvent', back_populates='session', cascade='all, delete-orphan')
    llm_content = relationship('LLMContentHistory', back_populates='session', cascade='all, delete-orphan')
    assessments = relationship('Assessment', back_populates='session', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<GameSession(id={self.id}, user_id={self.user_id}, status={self.status})>"
