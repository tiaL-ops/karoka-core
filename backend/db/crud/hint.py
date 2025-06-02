from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from db.models.hint import Hint


def create_hint(db: Session, hint_data: Dict[str, Any]) -> Hint:
    """
    hint_data must include:
      - challenge_id (str)
      - hint_sequence_number (int)
      - modality_preference (one of: 'visual', 'aural', 'read_write', 'kinesthetic', 'general')
      - content_text (str)
    Optionally: content_audio_url, is_llm_generated_template (bool), llm_template_id (UUID)
    """
    db_hint = Hint(**hint_data)
    db.add(db_hint)
    db.commit()
    db.refresh(db_hint)
    return db_hint


def get_hint(db: Session, hint_id: UUID) -> Hint:
    return db.query(Hint).filter(Hint.id == hint_id).first()


def list_hints(db: Session, skip: int = 0, limit: int = 100) -> List[Hint]:
    return db.query(Hint).offset(skip).limit(limit).all()


def list_hints_for_challenge(db: Session, challenge_id: str) -> List[Hint]:
    return (
        db.query(Hint)
          .filter(Hint.challenge_id == challenge_id)
          .order_by(Hint.hint_sequence_number)
          .all()
    )


def update_hint(db: Session, hint_id: UUID, updates: Dict[str, Any]) -> Hint:
    """
    updates: any subset of Hint fields,
      e.g. {"content_text": "New hint text", "modality_preference": "aural"}
    """
    db_hint = db.query(Hint).filter(Hint.id == hint_id).first()
    if not db_hint:
        return None
    for key, value in updates.items():
        setattr(db_hint, key, value)
    db.commit()
    db.refresh(db_hint)
    return db_hint


def delete_hint(db: Session, hint_id: UUID) -> Hint:
    db_hint = db.query(Hint).filter(Hint.id == hint_id).first()
    if not db_hint:
        return None
    db.delete(db_hint)
    db.commit()
    return db_hint
