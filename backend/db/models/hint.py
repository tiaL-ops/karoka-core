from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    func,
    ForeignKey,
    Boolean,
    Integer,
    cast,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship

from db.database import Base

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
    challenge_id = Column(
        String,
        ForeignKey('challenges.id', ondelete='CASCADE'),
        nullable=False
    )

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

    # THIS is the fix: explicitly tell SQLAlchemy how to join LogEvent ↔ Hint
    log_events = relationship(
        'LogEvent',
        back_populates='hint',
        viewonly=True,
        primaryjoin=(
            # Compare the JSONB field 'hint_id' (as text) to this Hint.id (cast to string)
            "LogEvent.event_details_json['hint_id'].astext == cast(Hint.id, String)"
        ),
        foreign_keys='LogEvent.event_details_json'
    )

    def __repr__(self):
        return (
            f"<Hint(id={self.id}, challenge_id={self.challenge_id!r}, "
            f"seq={self.hint_sequence_number}, modality={self.modality_preference})>"
        )