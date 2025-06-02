from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, func, ForeignKey, cast
from sqlalchemy.orm import relationship

from database import Base

class DocumentationTopic(Base):
    __tablename__ = 'documentation_topics'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)

    difficulty_level = Column(Integer, nullable=True)
    associated_vark_modalities = Column(JSONB, nullable=True)

    llm_template_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey('llm_templates.id', ondelete='SET NULL'),
        nullable=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    llm_template = relationship('LLMTemplate', back_populates='documentation_topics')

    # FIX: Join using JSONB-based doc ID
    log_events = relationship(
        'LogEvent',
        back_populates='documentation_topic',
        viewonly=True,
        primaryjoin=(
            "cast(DocumentationTopic.id, String) == LogEvent.event_details_json['document_id'].astext"
        ),
        foreign_keys='LogEvent.event_details_json'
    )

    def __repr__(self):
        return f"<DocumentationTopic(id={self.id}, topic_name={self.topic_name!r})>"
