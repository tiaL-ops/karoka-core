# tests/test_log_event_crud.py
import pytest
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from models.log_event import LogEvent
from models.user import User
from models.game_session import GameSession
from crud.log_event import (
    create_log_event,
    get_log_event,
    list_log_events,
    list_log_events_for_session,
    update_log_event,
    delete_log_event
)
from crud.user import create_user
from crud.game_session import create_game_session

@pytest.mark.usefixtures("db_session")
def test_log_event_crud(db_session: Session):
    # 1) Create prerequisite User + GameSession
    user_payload = {
        "id": "log-user-1",
        "name": "Carol",
        "bio": None, "age": None, "sex": None,
        "vark_visual_score": None, "vark_auditory_score": None,
        "vark_readwrite_score": None, "vark_kinesthetic_score": None
    }
    user = create_user(db=db_session, user_data=user_payload)

    now = datetime.utcnow()
    session_payload = {
        "user_id": user.id,
        "start_time": now,
        "status": "in_progress"
    }
    gs = create_game_session(db=db_session, session_data=session_payload)

    # 2) create_log_event: e.g. event_type = 'hint_requested'
    event_payload = {
        "session_id": gs.id,
        "user_id": user.id,
        "event_type": "hint_requested",
        "event_details_json": {
            "hint_id": None,
            "challenge_id": None,
            "requested_modality": "visual"
        }
    }
    evt = create_log_event(db=db_session, event_data=event_payload)
    assert isinstance(evt, LogEvent)
    assert evt.event_type == "hint_requested"
    assert evt.event_details_json["requested_modality"] == "visual"

    # 3) get_log_event
    fetched = get_log_event(db=db_session, event_id=evt.id)
    assert fetched is not None
    assert fetched.id == evt.id

    # 4) list_log_events & list_log_events_for_session
    all_events = list_log_events(db=db_session, skip=0, limit=10)
    assert any(e.id == evt.id for e in all_events)

    session_events = list_log_events_for_session(db=db_session, session_id=gs.id)
    assert len(session_events) == 1
    assert session_events[0].id == evt.id

    # 5) update_log_event
    updates = {"event_type": "code_submitted", "event_details_json": {"challenge_id": "xyz", "is_correct": True}}
    updated = update_log_event(db=db_session, event_id=evt.id, updates=updates)
    assert updated.event_type == "code_submitted"
    assert updated.event_details_json["is_correct"] is True

    # 6) delete_log_event
    deleted = delete_log_event(db=db_session, event_id=evt.id)
    assert deleted.id == evt.id

    # confirm gone
    assert get_log_event(db=db_session, event_id=evt.id) is None
