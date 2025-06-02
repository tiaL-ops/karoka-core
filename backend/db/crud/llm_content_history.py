from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from db.models.llm_content_history import LLMContentHistory


def create_llm_content_history(db: Session, content_data: Dict[str, Any]) -> LLMContentHistory:
    """
    content_data must include:
      - session_id (UUID)
      - user_id (str)
      - prompt_used (str)
      - generated_content (str)
      - content_type (one of: 'hint', 'documentation', 'dialogue')
    Optionally: inferred_modality (str), llm_template_id (UUID), challenge_id (str),
                response_time_ms (int), token_usage_input (int), token_usage_output (int), cost_estimate (float)
    """
    db_content = LLMContentHistory(**content_data)
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content


def get_llm_content_history(db: Session, record_id: UUID) -> LLMContentHistory:
    return db.query(LLMContentHistory).filter(LLMContentHistory.id == record_id).first()


def list_llm_content_history(db: Session, skip: int = 0, limit: int = 100) -> List[LLMContentHistory]:
    return db.query(LLMContentHistory).offset(skip).limit(limit).all()


def list_llm_content_for_session(db: Session, session_id: UUID) -> List[LLMContentHistory]:
    return (
        db.query(LLMContentHistory)
          .filter(LLMContentHistory.session_id == session_id)
          .order_by(LLMContentHistory.request_timestamp)
          .all()
    )


def update_llm_content_history(db: Session, record_id: UUID, updates: Dict[str, Any]) -> LLMContentHistory:
    """
    updates: any subset of LLMContentHistory fields,
      e.g. {"generated_content": "Revised answer", "cost_estimate": 0.0025}
    """
    db_content = db.query(LLMContentHistory).filter(LLMContentHistory.id == record_id).first()
    if not db_content:
        return None
    for key, value in updates.items():
        setattr(db_content, key, value)
    db.commit()
    db.refresh(db_content)
    return db_content


def delete_llm_content_history(db: Session, record_id: UUID) -> LLMContentHistory:
    db_content = db.query(LLMContentHistory).filter(LLMContentHistory.id == record_id).first()
    if not db_content:
        return None
    db.delete(db_content)
    db.commit()
    return db_content
