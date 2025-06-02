
import uuid
from sqlalchemy import Column, String, Integer, DateTime, func, ForeignKey, Numeric, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship

from db.database import Base

AssessmentTypeEnum = SAEnum(
    'pre_assessment',
    'post_assessment',
    'in_game_challenge',
    'vark_test',
    name='assessment_type_enum'
)

class Assessment(Base):
    __tablename__ = 'assessments'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    

    game_session_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey('game_sessions.id', ondelete='SET NULL'),
        nullable=True
    )
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    type = Column(AssessmentTypeEnum, nullable=False)
    challenge_id = Column(String, ForeignKey('challenges.id', ondelete='SET NULL'), nullable=True)

    score = Column(Numeric(5, 2), nullable=True)
    completion_time_seconds = Column(Integer, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    raw_responses_json = Column(JSONB, nullable=True)

    # Relationships
    user = relationship('User', back_populates='assessments')
    challenge = relationship('Challenge', back_populates='assessments', foreign_keys=[challenge_id])
    session = relationship(
        'GameSession',
        back_populates='assessments',
        foreign_keys=[game_session_id]
    )
    def __repr__(self):
        return f"<Assessment(id={self.id}, user_id={self.user_id}, type={self.type})>"
