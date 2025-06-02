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
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    event_type = Column(String, nullable=False)
    event_details_json = Column(JSONB, nullable=True)

    # Example structures for event_details_json based on event_type:
    # - 'code_submitted': {
    #       "challenge_id": "<challenge.id>",
    #       "submitted_code": "print('hi')",
    #       "run_result": "hi\n",
    #       "is_correct": True,
    #       "error_type": null,
    #       "error_message": null,
    #       "attempt_number": 1
    #   }
    # - 'documentation_accessed': {
    #       "document_id": "<doc_topic.id>",
    #       "time_spent_seconds": 120,
    #       "challenge_context_id": "<challenge.id>" (optional)
    #   }
    # - 'hint_requested': {
    #       "hint_id": "<hint.id>",
    #       "challenge_id": "<challenge.id>",
    #       "requested_modality": "visual"
    #   }
    # - 'drag_and_drop_attempt': {
    #       "challenge_id": "<challenge.id>",
    #       "item_id": "item_42",
    #       "target_id": "bucket_X",
    #       "is_correct_action": False,
    #       "current_state": {"bucket_X": 1, "bucket_Y": 0}
    #   }
    # - 'map_area_entered': {
    #       "area_id": "vark_visual_zone",
    #       "vark_association": "Visual"
    #   }

    # Relationships
    session = relationship('GameSession', back_populates='log_events')
    user = relationship('User', back_populates='log_events')

    # These are nullable because only certain event types reference them:
    challenge = relationship('Challenge', back_populates='log_events', foreign_keys='LogEvent.event_details_json', primaryjoin="LogEvent.event_details_json['challenge_id'].astext == Challenge.id", viewonly=True)
    hint = relationship('Hint', back_populates='log_events', foreign_keys='LogEvent.event_details_json', primaryjoin="LogEvent.event_details_json['hint_id'].astext == Hint.id", viewonly=True)
    documentation_topic = relationship('DocumentationTopic', back_populates='log_events', foreign_keys='LogEvent.event_details_json', primaryjoin="LogEvent.event_details_json['document_id'].astext == DocumentationTopic.id", viewonly=True)

    def __repr__(self):
        return f"<LogEvent(id={self.id}, type={self.event_type}, ts={self.timestamp})>"
