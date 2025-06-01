from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from models.llm_template import LLMTemplate


def create_llm_template(db: Session, template_data: Dict[str, Any]) -> LLMTemplate:
    """
    template_data must include:
      - template_name (str)
      - system_prompt (str)
      - user_prompt_template (str)
    Optionally: max_tokens (int), temperature (float), model_name (str), description (str)
    """
    db_tmpl = LLMTemplate(**template_data)
    db.add(db_tmpl)
    db.commit()
    db.refresh(db_tmpl)
    return db_tmpl


def get_llm_template(db: Session, template_id: UUID) -> LLMTemplate:
    return db.query(LLMTemplate).filter(LLMTemplate.id == template_id).first()


def list_llm_templates(db: Session, skip: int = 0, limit: int = 100) -> List[LLMTemplate]:
    return db.query(LLMTemplate).offset(skip).limit(limit).all()


def update_llm_template(db: Session, template_id: UUID, updates: Dict[str, Any]) -> LLMTemplate:
    """
    updates: any subset of LLMTemplate fields,
      e.g. {"temperature": 0.7, "description": "Revised purpose"}
    """
    db_tmpl = db.query(LLMTemplate).filter(LLMTemplate.id == template_id).first()
    if not db_tmpl:
        return None
    for key, value in updates.items():
        setattr(db_tmpl, key, value)
    db.commit()
    db.refresh(db_tmpl)
    return db_tmpl


def delete_llm_template(db: Session, template_id: UUID) -> LLMTemplate:
    db_tmpl = db.query(LLMTemplate).filter(LLMTemplate.id == template_id).first()
    if not db_tmpl:
        return None
    db.delete(db_tmpl)
    db.commit()
    return db_tmpl
