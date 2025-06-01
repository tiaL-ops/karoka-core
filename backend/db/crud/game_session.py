from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from models.game_session import GameSession


def create_game_session(db: Session, session_data: Dict[str, Any]) -> GameSession:
    """
    session_data must include:
      - user_id (str)
      - start_time (datetime)
      - status (one of: 'completed', 'in_progress', 'abandoned')
    Optionally: end_time, arena_played, final_score, hints_used_count,
                total_time_spent_seconds, checkpoint_data (dict),
                challenge_attempts_count, documentation_access_count
    """
    db_session = GameSession(**session_data)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def get_game_session(db: Session, session_id: UUID) -> GameSession:
    return db.query(GameSession).filter(GameSession.id == session_id).first()


def list_game_sessions(db: Session, skip: int = 0, limit: int = 100) -> List[GameSession]:
    return db.query(GameSession).offset(skip).limit(limit).all()


def update_game_session(db: Session, session_id: UUID, updates: Dict[str, Any]) -> GameSession:
    """
    updates: any subset of GameSession fields,
      e.g. {"end_time": now, "final_score": 500, "status": "completed"}
    """
    db_session = db.query(GameSession).filter(GameSession.id == session_id).first()
    if not db_session:
        return None
    for key, value in updates.items():
        setattr(db_session, key, value)
    db.commit()
    db.refresh(db_session)
    return db_session


def delete_game_session(db: Session, session_id: UUID) -> GameSession:
    db_session = db.query(GameSession).filter(GameSession.id == session_id).first()
    if not db_session:
        return None
    db.delete(db_session)
    db.commit()
    return db_session
