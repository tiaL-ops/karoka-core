from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
import uuid
from sqlalchemy import Column, String, Text, DateTime, func, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship

from database import Base

class LogEvent(Base):
    __tablename__ = 'log_events'

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey('game_sessions.id', ondelete='CASCADE'),
        nullable=False
    )
    user_id = Column(
        String,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False
    )

    challenge_id = Column(
        String,  # or PGUUID if Challenge.id is a UUID
        ForeignKey('challenges.id', ondelete='SET NULL'),
        nullable=True
    )

    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    event_type = Column(String, nullable=False)
    event_details_json = Column(JSONB, nullable=True)

    # Relationships
    session = relationship('GameSession', back_populates='log_events')
    user = relationship('User', back_populates='log_events')

    # challenge relationship (you likely already have this working)
    challenge = relationship(
        'Challenge',
        back_populates='log_events',
        foreign_keys=[challenge_id]
    )

    # THIS is the corresponding “reverse” side of Hint.log_events
    hint = relationship(
        'Hint',
        back_populates='log_events',
        viewonly=True,
        primaryjoin=(
            # Take the 'hint_id' from event_details_json (as text) and compare it to Hint.id
            "LogEvent.event_details_json['hint_id'].astext == cast(Hint.id, String)"
        ),
        foreign_keys=[event_details_json]
    )

    # documentation_topic relationship (same pattern if you use JSONB to store a document_id)
    documentation_topic = relationship(
    'DocumentationTopic',
    back_populates='log_events',
    viewonly=True,
    primaryjoin=(
        "LogEvent.event_details_json['document_id'].astext == cast(DocumentationTopic.id, String)"
    ),
    foreign_keys=[event_details_json]
)


    def __repr__(self):
        return f"<LogEvent(id={self.id}, type={self.event_type}, ts={self.timestamp})>"