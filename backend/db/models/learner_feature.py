import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    func,
    ForeignKey,
    Float,
   
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import relationship

from db.database import Base

class LearnerFeature(Base):
    """
    Represents a set of derived features about a learner's performance,
    computed at a specific point in time. This maps to the `learner_features` table.
    """
    __tablename__ = 'learner_features'

    # Auto-incrementing primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign key to the user these features describe
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Foreign key to the session during which these features were computed (optional)
    session_id = Column(PGUUID(as_uuid=True), ForeignKey('game_sessions.id', ondelete='SET NULL'), nullable=True)

    # Timestamp of when the features were calculated
    computed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # --- DERIVED FEATURES ---
    # Rolling % correct by concept, e.g., {"fractions":[0.8,0.85], …}
    accuracy_history = Column(JSONB)
    
    # Median seconds per successful action (e.g., drop)
    latency = Column(Float)
    
    # Analysis of common errors, e.g., {"firstDropBias":"over","zoneX":1.2}
    error_patterns = Column(JSONB)
    
    # Probability of getting a correct answer after using help
    help_efficacy = Column(Float)
    
    # Average number of attempts before quitting or succeeding
    persistence = Column(Float)
    
    # Change in time-per-attempt over recent puzzles
    fluency_slope = Column(Float)

    # Relationships to parent models
    user = relationship('User', back_populates='learner_features')
    session = relationship('GameSession', back_populates='learner_features')

    def __repr__(self):
        return f"<LearnerFeature(id={self.id}, user_id={self.user_id}, computed_at={self.computed_at})>"
