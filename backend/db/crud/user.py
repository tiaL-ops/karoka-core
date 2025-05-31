# db/crud/user.py

from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate

# Create a new user
def create_user(db: Session, user_data: UserCreate) -> User:
    user = User(username=user_data.username, email=user_data.email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Get user by ID
def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

# Get all users
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

# Delete a user
def delete_user(db: Session, user_id: int) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False
