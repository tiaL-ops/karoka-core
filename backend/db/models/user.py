from sqlalchemy.dialects.postgresql import JSONB
import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, func, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base

# If you want to constrain sex to a fixed set of values, you can define an Enum here:
SexEnum = SAEnum('male', 'female', 'other', name='sex_enum')

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True)  # Firebase UID
    name = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(SexEnum, nullable=True)

    vark_visual_score = Column(Integer, nullable=True)
    vark_auditory_score = Column(Integer, nullable=True)
    vark_readwrite_score = Column(Integer, nullable=True)
    vark_kinesthetic_score = Column(Integer, nullable=True)

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
    game_sessions = relationship('GameSession', back_populates='user', cascade='all, delete-orphan')
    log_events = relationship('LogEvent', back_populates='user', cascade='all, delete-orphan')
    assessments = relationship('Assessment', back_populates='user', cascade='all, delete-orphan')
    llm_content = relationship('LLMContentHistory', back_populates='user', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<User(id={self.id!r}, name={self.name!r})>"
