from sqlalchemy.dialects.postgresql import JSONB
import uuid
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from database import Base

ModalityEnum = SAEnum(
    'visual',
    'aural',
    'read_write',
    'kinesthetic',
    'general',
    name='hint_modality_enum'
)

class Hint(Base):
    __tablename__ = 'hints'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id = Column(String, ForeignKey('challenges.id', ondelete='CASCADE'), nullable=False)

    hint_sequence_number = Column(Integer, nullable=False)
    modality_preference = Column(ModalityEnum, nullable=False)

    content_text = Column(Text, nullable=False)
    content_audio_url = Column(String, nullable=True)

    is_llm_generated_template = Column(Boolean, nullable=False, default=False)
    llm_template_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey('llm_templates.id', ondelete='SET NULL'),
        nullable=True
    )

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
    challenge = relationship('Challenge', back_populates='hints')
    llm_template = relationship('LLMTemplate', back_populates='hints')
    log_events = relationship('LogEvent', back_populates='hint', cascade='all, delete-orphan')

    def __repr__(self):
        return (
            f"<Hint(id={self.id}, challenge_id={self.challenge_id!r}, "
            f"seq={self.hint_sequence_number}, modality={self.modality_preference})>"
        )
