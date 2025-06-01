import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, func, ForeignKey, Numeric, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from database import Base

ContentTypeEnum = SAEnum('hint', 'documentation', 'dialogue', name='llm_content_type_enum')

class LLMContentHistory(Base):
    __tablename__ = 'llm_content_history'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey('game_sessions.id', ondelete='CASCADE'),
        nullable=False
    )
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    request_timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    inferred_modality = Column(String, nullable=True)

    prompt_used = Column(Text, nullable=False)
    generated_content = Column(Text, nullable=False)
    content_type = Column(ContentTypeEnum, nullable=False)

    llm_template_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey('llm_templates.id', ondelete='SET NULL'),
        nullable=True
    )
    challenge_id = Column(String, ForeignKey('challenges.id', ondelete='SET NULL'), nullable=True)

    response_time_ms = Column(Integer, nullable=True)
    token_usage_input = Column(Integer, nullable=True)
    token_usage_output = Column(Integer, nullable=True)
    cost_estimate = Column(Numeric(10, 8), nullable=True)

    # Relationships
    session = relationship('GameSession', back_populates='llm_content')
    user = relationship('User', back_populates='llm_content')
    llm_template = relationship('LLMTemplate', back_populates='llm_content')
    challenge = relationship('Challenge', back_populates='llm_content', foreign_keys=[challenge_id])

    def __repr__(self):
        return f"<LLMContentHistory(id={self.id}, type={self.content_type}, ts={self.request_timestamp})>"
