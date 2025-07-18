from sqlalchemy.orm import Session
import uuid

from db.models.attempt import Attempt
from schemas.attempt import AttemptCreate

def create_attempt(db: Session, attempt: AttemptCreate) -> Attempt:
    """
    Create a new attempt record in the database.
    
    Args:
        db: The database session.
        attempt: The Pydantic schema containing the attempt data.
        
    Returns:
        The newly created Attempt SQLAlchemy object.
    """
    db_attempt = Attempt(**attempt.dict())
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    return db_attempt

def get_attempt(db: Session, attempt_id: str) -> Attempt | None:
    """
    Retrieve a single attempt by its ID.
    
    Args:
        db: The database session.
        attempt_id: The unique ID of the attempt.
        
    Returns:
        The Attempt object if found, otherwise None.
    """
    return db.query(Attempt).filter(Attempt.attempt_id == attempt_id).first()

def get_attempts_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> list[Attempt]:
    """
    Retrieve all attempts made by a specific user.
    
    Args:
        db: The database session.
        user_id: The ID of the user.
        skip: The number of records to skip (for pagination).
        limit: The maximum number of records to return (for pagination).
        
    Returns:
        A list of Attempt objects.
    """
    return db.query(Attempt).filter(Attempt.user_id == user_id).offset(skip).limit(limit).all()

def get_attempts_by_session(db: Session, session_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Attempt]:
    """
    Retrieve all attempts within a specific game session.
    
    Args:
        db: The database session.
        session_id: The ID of the game session.
        skip: The number of records to skip (for pagination).
        limit: The maximum number of records to return (for pagination).
        
    Returns:
        A list of Attempt objects.
    """
    return db.query(Attempt).filter(Attempt.session_id == session_id).offset(skip).limit(limit).all()

