from sqlalchemy.dialects.postgresql import JSONB
import uuid
from sqlalchemy import Column, String, Text, Integer, Numeric, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from database import Base

class LLMTemplate(Base):
    __tablename__ = 'llm_templates'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_name = Column(String, unique=True, nullable=False)

    system_prompt = Column(Text, nullable=False)
    user_prompt_template = Column(Text, nullable=False)

    max_tokens = Column(Integer, nullable=True)
    temperature = Column(Numeric(3, 2), nullable=True)
    model_name = Column(String, nullable=True)
    description = Column(Text, nullable=True)

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
    hints = relationship('Hint', back_populates='llm_template')
    documentation_topics = relationship('DocumentationTopic', back_populates='llm_template')
    llm_content = relationship('LLMContentHistory', back_populates='llm_template')

    def __repr__(self):
        return f"<LLMTemplate(id={self.id}, name={self.template_name!r})>"
