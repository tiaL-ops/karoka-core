# tests/test_challenge_crud.py
import pytest
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from models.challenge import Challenge
from crud.challenge import create_challenge, get_challenge, list_challenges, update_challenge, delete_challenge

@pytest.mark.usefixtures("db_session")
def test_challenge_crud(db_session: Session):
    # 1) create_challenge
    payload = {
        # id will be auto‐generated as a UUID-string by the model’s default
        "arena_id": "arena_1",
        "name": "Sample Puzzle",
        "description": "Test puzzle description",
        "challenge_type": "code_puzzle",
        "expected_solution_data": {"expected_output": "Hello, World!"},
        "difficulty_level": "medium",
        "associated_vark_modalities": ["Visual", "Kinesthetic"]
    }
    ch = create_challenge(db=db_session, challenge_data=payload)
    assert isinstance(ch, Challenge)
    assert ch.challenge_type == "code_puzzle"
    assert ch.expected_solution_data["expected_output"] == "Hello, World!"

    # 2) get_challenge
    fetched = get_challenge(db=db_session, challenge_id=ch.id)
    assert fetched is not None
    assert fetched.id == ch.id
    assert fetched.name == "Sample Puzzle"

    # 3) list_challenges
    all_chals = list_challenges(db=db_session, skip=0, limit=5)
    assert any(c.id == ch.id for c in all_chals)

    # 4) update_challenge: change difficulty to 'hard'
    updates = {"difficulty_level": "hard", "name": "Renamed Puzzle"}
    updated = update_challenge(db=db_session, challenge_id=ch.id, updates=updates)
    assert updated.difficulty_level == "hard"
    assert updated.name == "Renamed Puzzle"

    # 5) delete_challenge
    deleted = delete_challenge(db=db_session, challenge_id=ch.id)
    assert deleted.id == ch.id

    # confirm it’s gone
    assert get_challenge(db=db_session, challenge_id=ch.id) is None
