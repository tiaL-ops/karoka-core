# tests/test_assessment_crud.py
import pytest
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from models.assessment import Assessment
from models.user import User
from models.challenge import Challenge
from crud.assessment import (
    create_assessment,
    get_assessment,
    list_assessments,
    list_assessments_for_user,
    update_assessment,
    delete_assessment
)
from crud.user import create_user
from crud.challenge import create_challenge

@pytest.mark.usefixtures("db_session")
def test_assessment_crud(db_session: Session):
    # 1) Create prerequisites: User + Challenge
    user_payload = {
        "id": "assess-user-1",
        "name": "Dave",
        "bio": None, "age": None, "sex": None,
        "vark_visual_score": None, "vark_auditory_score": None,
        "vark_readwrite_score": None, "vark_kinesthetic_score": None
    }
    user = create_user(db=db_session, user_data=user_payload)

    challenge_payload = {
        "arena_id": None,
        "name": "Assessment Puzzle",
        "description": None,
        "challenge_type": "navigation_puzzle",
        "expected_solution_data": {},
        "difficulty_level": "easy",
        "associated_vark_modalities": []
    }
    chal = create_challenge(db=db_session, challenge_data=challenge_payload)

    # 2) create_assessment
    payload = {
        "user_id": user.id,
        "type": "in_game_challenge",
        "challenge_id": chal.id,
        "score": 95.0,
        "completion_time_seconds": 120,
        "raw_responses_json": {"answer": "foo"}
    }
    assess = create_assessment(db=db_session, assessment_data=payload)
    assert isinstance(assess, Assessment)
    assert float(assess.score) == 95.0

    # 3) get_assessment
    fetched = get_assessment(db=db_session, assessment_id=assess.id)
    assert fetched is not None
    assert fetched.user_id == user.id

    # 4) list_assessments & list_assessments_for_user
    all_assess = list_assessments(db=db_session, skip=0, limit=10)
    assert any(a.id == assess.id for a in all_assess)

    user_assess = list_assessments_for_user(db=db_session, user_id=user.id)
    assert len(user_assess) == 1
    assert user_assess[0].id == assess.id

    # 5) update_assessment
    updates = {"score": 97.5, "completion_time_seconds": 110}
    updated = update_assessment(db=db_session, assessment_id=assess.id, updates=updates)
    assert float(updated.score) == 97.5
    assert updated.completion_time_seconds == 110

    # 6) delete_assessment
    deleted = delete_assessment(db=db_session, assessment_id=assess.id)
    assert deleted.id == assess.id

    # confirm gone
    assert get_assessment(db=db_session, assessment_id=assess.id) is None
