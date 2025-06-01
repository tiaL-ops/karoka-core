from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID

from models.log_event import LogEvent


def create_log_event(db: Session, event_data: Dict[str, Any]) -> LogEvent:
    """
    event_data must include:
      - session_id (UUID)
      - user_id (str)
      - event_type (str)
    Optionally: event_details_json (dict)
    """
    db_event = LogEvent(**event_data)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def get_log_event(db: Session, event_id: UUID) -> LogEvent:
    return db.query(LogEvent).filter(LogEvent.id == event_id).first()


def list_log_events(db: Session, skip: int = 0, limit: int = 100) -> List[LogEvent]:
    return db.query(LogEvent).offset(skip).limit(limit).all()


def list_log_events_for_session(db: Session, session_id: UUID) -> List[LogEvent]:
    return (
        db.query(LogEvent)
          .filter(LogEvent.session_id == session_id)
          .order_by(LogEvent.timestamp)
          .all()
    )


def update_log_event(db: Session, event_id: UUID, updates: Dict[str, Any]) -> LogEvent:
    """
    updates: any subset of LogEvent fields,
      e.g. {"event_type": "hint_requested", "event_details_json": {...}}
    """
    db_event = db.query(LogEvent).filter(LogEvent.id == event_id).first()
    if not db_event:
        return None
    for key, value in updates.items():
        setattr(db_event, key, value)
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_log_event(db: Session, event_id: UUID) -> LogEvent:
    db_event = db.query(LogEvent).filter(LogEvent.id == event_id).first()
    if not db_event:
        return None
    db.delete(db_event)
    db.commit()
    return db_event
