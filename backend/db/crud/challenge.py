from sqlalchemy.orm import Session
from typing import List, Dict, Any

from db.models.challenge import Challenge


def create_challenge(db: Session, challenge_data: Dict[str, Any]) -> Challenge:
    """
    challenge_data must include:
      - name (str)
      - challenge_type (one of: 'code_puzzle', 'drag_and_drop', 'dialogue_challenge', 'navigation_puzzle')
      - expected_solution_data (dict)
    Optionally: arena_id, description, difficulty_level, associated_vark_modalities (list of str)
    """
    db_challenge = Challenge(**challenge_data)
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge


def get_challenge(db: Session, challenge_id: str) -> Challenge:
    return db.query(Challenge).filter(Challenge.id == challenge_id).first()


def list_challenges(db: Session, skip: int = 0, limit: int = 100) -> List[Challenge]:
    return db.query(Challenge).offset(skip).limit(limit).all()


def update_challenge(db: Session, challenge_id: str, updates: Dict[str, Any]) -> Challenge:
    """
    updates: any subset of Challenge fields,
      e.g. {"name": "New Puzzle", "difficulty_level": "medium"}
    """
    db_challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not db_challenge:
        return None
    for key, value in updates.items():
        setattr(db_challenge, key, value)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge


def delete_challenge(db: Session, challenge_id: str) -> Challenge:
    db_challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not db_challenge:
        return None
    db.delete(db_challenge)
    db.commit()
    return db_challenge
