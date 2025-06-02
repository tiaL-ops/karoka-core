from sqlalchemy.orm import Session
from typing import List, Dict, Any

from db.models.user import User


def create_user(db: Session, user_data: Dict[str, Any]) -> User:
    """
    user_data must include:
      - id (Firebase UID, str)
      - name (str)
      - optionally: bio, age, sex, vark_*_score
    """
    db_user = User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user(db: Session, user_id: str) -> User:
    return db.query(User).filter(User.id == user_id).first()


def list_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: str, updates: Dict[str, Any]) -> User:
    """
    updates: any subset of User fields (e.g. {"name": "New Name", "age": 30})
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    for key, value in updates.items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: str) -> User:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    db.delete(db_user)
    db.commit()
    return db_user
