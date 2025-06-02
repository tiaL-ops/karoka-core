from sqlalchemy.dialects.postgresql import JSONB
import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, func, Enum as SAEnum, JSON
from sqlalchemy.orm import relationship

from database import Base

ChallengeTypeEnum = SAEnum(
    'code_puzzle',
    'drag_and_drop',
    'dialogue_challenge',
    'navigation_puzzle',
    name='challenge_type_enum'
)

DifficultyEnum = SAEnum('easy', 'medium', 'hard', name='difficulty_level_enum')

class Challenge(Base):
    __tablename__ = 'challenges'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    arena_id = Column(String, nullable=True)

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    challenge_type = Column(ChallengeTypeEnum, nullable=False)
    expected_solution_data = Column(JSONB, nullable=False)
    # e.g. {"expected_output": "Rasoa is 2 years old"}
    # or {"validation_function_name": "validate_rasoa_puzzle"}

    difficulty_level = Column(DifficultyEnum, nullable=True)
    associated_vark_modalities = Column(JSONB, nullable=True)
    # e.g. ["Visual", "Kinesthetic"]

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    hints = relationship('Hint', back_populates='challenge', cascade='all, delete-orphan')
    log_events = relationship('LogEvent', back_populates='challenge', cascade='all, delete-orphan')
    assessments = relationship('Assessment', back_populates='challenge', cascade='all, delete-orphan')
    llm_content = relationship('LLMContentHistory', back_populates='challenge', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Challenge(id={self.id}, name={self.name!r}, type={self.challenge_type})>"
