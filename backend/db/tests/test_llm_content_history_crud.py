# tests/test_llm_content_history_crud.py
import pytest
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from models.llm_content_history import LLMContentHistory
from models.user import User
from models.game_session import GameSession
from crud.llm_content_history import (
    create_llm_content_history,
    get_llm_content_history,
    list_llm_content_history,
    list_llm_content_for_session,
    update_llm_content_history,
    delete_llm_content_history
)
from crud.user import create_user
from crud.game_session import create_game_session

@pytest.mark.usefixtures("db_session")
def test_llm_content_history_crud(db_session: Session):
    # 1) Create prerequisites: User + GameSession
    user_payload = {
        "id": "llm-user-1",
        "name": "Eve",
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

    # 2) create_llm_content_history
    payload = {
        "session_id": gs.id,
        "user_id": user.id,
        "inferred_modality": "visual",
        "prompt_used": "Solve this puzzle",
        "generated_content": "Here is your hint…",
        "content_type": "hint",
        "llm_template_id": None,
        "challenge_id": None,
        "response_time_ms": 120,
        "token_usage_input": 15,
        "token_usage_output": 30,
        "cost_estimate": 0.00123
    }
    rec = create_llm_content_history(db=db_session, content_data=payload)
    assert isinstance(rec, LLMContentHistory)
    assert rec.content_type == "hint"
    assert rec.token_usage_output == 30

    # 3) get_llm_content_history
    fetched = get_llm_content_history(db=db_session, record_id=rec.id)
    assert fetched is not None
    assert fetched.generated_content.startswith("Here is your hint")

    # 4) list_llm_content_history & list_llm_content_for_session
    all_records = list_llm_content_history(db=db_session, skip=0, limit=10)
    assert any(r.id == rec.id for r in all_records)

    session_records = list_llm_content_for_session(db=db_session, session_id=gs.id)
    assert len(session_records) == 1
    assert session_records[0].id == rec.id

    # 5) update_llm_content_history
    updates = {"generated_content": "Updated hint text", "cost_estimate": 0.0025}
    updated = update_llm_content_history(db=db_session, record_id=rec.id, updates=updates)
    assert updated.generated_content.startswith("Updated hint text")
    assert float(updated.cost_estimate) == 0.0025

    # 6) delete_llm_content_history
    deleted = delete_llm_content_history(db=db_session, record_id=rec.id)
    assert deleted.id == rec.id

    # confirm gone
    assert get_llm_content_history(db=db_session, record_id=rec.id) is None
