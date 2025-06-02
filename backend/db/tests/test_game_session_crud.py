# tests/test_game_session_crud.py
import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from models.game_session import GameSession
from models.user import User
from crud.game_session import (
    create_game_session,
    get_game_session,
    list_game_sessions,
    update_game_session,
    delete_game_session
)
from crud.user import create_user

@pytest.mark.usefixtures("db_session")
def test_game_session_crud(db_session: Session):
    # Create a prerequisite User
    user_payload = {
        "id": "user-session-test",
        "name": "Bob",
        "bio": None,
        "age": None,
        "sex": None,
        "vark_visual_score": None,
        "vark_auditory_score": None,
        "vark_readwrite_score": None,
        "vark_kinesthetic_score": None
    }
    user = create_user(db=db_session, user_data=user_payload)

    # 1) Create a GameSession
    now = datetime.utcnow()
    session_payload = {
        "user_id": user.id,
        "start_time": now,
        "status": "in_progress",
        # optional:
        "arena_played": "tutorial_arena",
        "hints_used_count": 0,
        "checkpoint_data": {"room_id": "room_1", "player_x": 10, "player_y": 20},
        "challenge_attempts_count": 0,
        "documentation_access_count": 0
    }
    gs = create_game_session(db=db_session, session_data=session_payload)
    assert isinstance(gs, GameSession)
    assert gs.user_id == user.id
    assert gs.arena_played == "tutorial_arena"

    # 2) get_game_session
    fetched = get_game_session(db=db_session, session_id=gs.id)
    assert fetched is not None
    assert fetched.id == gs.id
    assert fetched.checkpoint_data["room_id"] == "room_1"

    # 3) list_game_sessions
    all_sessions = list_game_sessions(db=db_session, skip=0, limit=10)
    assert len(all_sessions) == 1
    assert all_sessions[0].id == gs.id

    # 4) update_game_session: set final_score and status to 'completed'
    updates = {
        "final_score": 1500,
        "status": "completed",
        "end_time": now + timedelta(minutes=5),
        "hints_used_count": 1
    }
    updated = update_game_session(db=db_session, session_id=gs.id, updates=updates)
    assert updated.final_score == 1500
    assert updated.status == "completed"
    assert updated.hints_used_count == 1

    # 5) delete_game_session
    deleted = delete_game_session(db=db_session, session_id=gs.id)
    assert deleted.id == gs.id

    # confirm it’s gone
    assert get_game_session(db=db_session, session_id=gs.id) is None
