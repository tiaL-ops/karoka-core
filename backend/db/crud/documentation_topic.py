from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from db.models.documentation_topic import DocumentationTopic


def create_documentation_topic(db: Session, topic_data: Dict[str, Any]) -> DocumentationTopic:
    """
    topic_data must include:
      - topic_name (str)
      - content (str)
    Optionally: difficulty_level (int), associated_vark_modalities (list of str), llm_template_id (UUID)
    """
    db_topic = DocumentationTopic(**topic_data)
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic


def get_documentation_topic(db: Session, topic_id: UUID) -> DocumentationTopic:
    return db.query(DocumentationTopic).filter(DocumentationTopic.id == topic_id).first()


def list_documentation_topics(db: Session, skip: int = 0, limit: int = 100) -> List[DocumentationTopic]:
    return db.query(DocumentationTopic).offset(skip).limit(limit).all()


def update_documentation_topic(db: Session, topic_id: UUID, updates: Dict[str, Any]) -> DocumentationTopic:
    """
    updates: any subset of DocumentationTopic fields,
      e.g. {"content": "Updated docs", "difficulty_level": 2}
    """
    db_topic = db.query(DocumentationTopic).filter(DocumentationTopic.id == topic_id).first()
    if not db_topic:
        return None
    for key, value in updates.items():
        setattr(db_topic, key, value)
    db.commit()
    db.refresh(db_topic)
    return db_topic


def delete_documentation_topic(db: Session, topic_id: UUID) -> DocumentationTopic:
    db_topic = db.query(DocumentationTopic).filter(DocumentationTopic.id == topic_id).first()
    if not db_topic:
        return None
    db.delete(db_topic)
    db.commit()
    return db_topic
