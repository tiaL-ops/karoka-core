from sqlalchemy.orm import Session
import uuid

from db.models.learner_feature import LearnerFeature
from schemas.learner_feature import LearnerFeatureCreate

def create_learner_feature(db: Session, feature: LearnerFeatureCreate) -> LearnerFeature:
    """
    Create a new learner feature record.
    
    Args:
        db: The database session.
        feature: The Pydantic schema containing the feature data.
        
    Returns:
        The newly created LearnerFeature SQLAlchemy object.
    """
    db_feature = LearnerFeature(**feature.dict())
    db.add(db_feature)
    db.commit()
    db.refresh(db_feature)
    return db_feature

def get_learner_feature(db: Session, feature_id: int) -> LearnerFeature | None:
    """
    Retrieve a single learner feature record by its ID.
    
    Args:
        db: The database session.
        feature_id: The primary key ID of the feature record.
        
    Returns:
        The LearnerFeature object if found, otherwise None.
    """
    return db.query(LearnerFeature).filter(LearnerFeature.id == feature_id).first()

def get_latest_learner_feature_for_user(db: Session, user_id: str) -> LearnerFeature | None:
    """
    Retrieve the most recently computed learner features for a specific user.
    
    Args:
        db: The database session.
        user_id: The ID of the user.
        
    Returns:
        The most recent LearnerFeature object for the user, or None if none exist.
    """
    return db.query(LearnerFeature).filter(LearnerFeature.user_id == user_id).order_by(LearnerFeature.computed_at.desc()).first()

def get_learner_features_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> list[LearnerFeature]:
    """
    Retrieve all learner feature records for a specific user.
    
    Args:
        db: The database session.
        user_id: The ID of the user.
        skip: The number of records to skip (for pagination).
        limit: The maximum number of records to return (for pagination).
        
    Returns:
        A list of LearnerFeature objects.
    """
    return db.query(LearnerFeature).filter(LearnerFeature.user_id == user_id).order_by(LearnerFeature.computed_at.desc()).offset(skip).limit(limit).all()
