from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from db.models.assessment import Assessment


def create_assessment(db: Session, assessment_data: Dict[str, Any]) -> Assessment:
    """
    assessment_data must include:
      - user_id (str)
      - type (one of: 'pre_assessment', 'post_assessment', 'in_game_challenge', 'vark_test')
    Optionally: challenge_id (str), score (float), completion_time_seconds (int), raw_responses_json (dict)
    """
    db_assess = Assessment(**assessment_data)
    db.add(db_assess)
    db.commit()
    db.refresh(db_assess)
    return db_assess


def get_assessment(db: Session, assessment_id: UUID) -> Assessment:
    return db.query(Assessment).filter(Assessment.id == assessment_id).first()


def list_assessments(db: Session, skip: int = 0, limit: int = 100) -> List[Assessment]:
    return db.query(Assessment).offset(skip).limit(limit).all()


def list_assessments_for_user(db: Session, user_id: str) -> List[Assessment]:
    return (
        db.query(Assessment)
          .filter(Assessment.user_id == user_id)
          .order_by(Assessment.submitted_at.desc())
          .all()
    )


def update_assessment(db: Session, assessment_id: UUID, updates: Dict[str, Any]) -> Assessment:
    """
    updates: any subset of Assessment fields,
      e.g. {"score": 85.5, "completion_time_seconds": 120}
    """
    db_assess = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not db_assess:
        return None
    for key, value in updates.items():
        setattr(db_assess, key, value)
    db.commit()
    db.refresh(db_assess)
    return db_assess


def delete_assessment(db: Session, assessment_id: UUID) -> Assessment:
    db_assess = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not db_assess:
        return None
    db.delete(db_assess)
    db.commit()
    return db_assess
