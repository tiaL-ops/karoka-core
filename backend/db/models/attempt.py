import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    func,
    ForeignKey,
    Boolean,
    Float
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import relationship

from db.database import Base

class Attempt(Base):
    """
    Represents a single attempt by a user to solve a puzzle.
    This maps to the `attempts` table.
    """
    __tablename__ = 'attempts'

    # The unique identifier for the attempt, e.g., "sess-…-3"
    attempt_id = Column(String, primary_key=True)

    # Foreign key to the game session this attempt belongs to
    session_id = Column(PGUUID(as_uuid=True), ForeignKey('game_sessions.id', ondelete='CASCADE'), nullable=False)
    
    # Foreign key to the user who made the attempt
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    # Identifier for the puzzle being attempted, e.g., "room-earthquake-balance"
    puzzle_id = Column(String, nullable=False)

    # Timestamps for the duration of the attempt
    start_ts = Column(DateTime(timezone=True), nullable=False)
    end_ts = Column(DateTime(timezone=True), nullable=False)

    # Metrics related to the user's performance in the attempt
    moves = Column(Integer)
    help_opened = Column(Boolean)
    time_in_code_panel = Column(Float) # Stored in seconds
    was_correct = Column(Boolean)

    # A JSON object storing the final state of the puzzle zones, e.g., {"x": 2, "y": 1, "z": 2}
    zone_counts = Column(JSONB)

    # Timestamp for when the record was created
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships to parent models
    session = relationship('GameSession', back_populates='attempts')
    user = relationship('User', back_populates='attempts')

    def __repr__(self):
        return f"<Attempt(id={self.attempt_id}, user_id={self.user_id}, puzzle_id={self.puzzle_id})>"

