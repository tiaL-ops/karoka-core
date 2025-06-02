from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB

import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship

from database import Base

class DocumentationTopic(Base):
    __tablename__ = 'documentation_topics'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)

    difficulty_level = Column(Integer, nullable=True)
    associated_vark_modalities = Column(JSONB, nullable=True)
    # e.g. ["Visual", "Auditory"]

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
    llm_template = relationship('LLMTemplate', back_populates='documentation_topics')
    log_events = relationship('LogEvent', back_populates='documentation_topic', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<DocumentationTopic(id={self.id}, topic_name={self.topic_name!r})>"
