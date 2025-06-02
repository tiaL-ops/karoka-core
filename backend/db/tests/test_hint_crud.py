# tests/test_hint_crud.py
import pytest
from sqlalchemy.orm import Session
import uuid

from models.challenge import Challenge
from models.hint import Hint
from crud.challenge import create_challenge
from crud.hint import create_hint, get_hint, list_hints, list_hints_for_challenge, update_hint, delete_hint

@pytest.mark.usefixtures("db_session")
def test_hint_crud(db_session: Session):
    # Prerequisite: create a challenge
    chal_payload = {
        "arena_id": "arena_for_hint",
        "name": "Hintable Puzzle",
        "description": None,
        "challenge_type": "drag_and_drop",
        "expected_solution_data": {"bucket_X_count": 2},
        "difficulty_level": "easy",
        "associated_vark_modalities": ["Kinesthetic"]
    }
    ch = create_challenge(db=db_session, challenge_data=chal_payload)

    # 1) create_hint
    hint_data = {
        "challenge_id": ch.id,
        "hint_sequence_number": 1,
        "modality_preference": "visual",
        "content_text": "Look for the red bucket first.",
        "content_audio_url": None,
        "is_llm_generated_template": False,
        "llm_template_id": None
    }
    hint = create_hint(db=db_session, hint_data=hint_data)
    assert isinstance(hint, Hint)
    assert hint.hint_sequence_number == 1
    assert hint.modality_preference == "visual"

    # 2) get_hint
    fetched = get_hint(db=db_session, hint_id=hint.id)
    assert fetched is not None
    assert fetched.id == hint.id
    assert fetched.content_text.startswith("Look for the red bucket")

    # 3) list_hints & list_hints_for_challenge
    all_hints = list_hints(db=db_session, skip=0, limit=10)
    assert any(h.id == hint.id for h in all_hints)

    hints_for = list_hints_for_challenge(db=db_session, challenge_id=ch.id)
    assert len(hints_for) == 1
    assert hints_for[0].id == hint.id

    # 4) update_hint: change content_text
    updates = {"content_text": "Try checking the left bucket instead."}
    updated = update_hint(db=db_session, hint_id=hint.id, updates=updates)
    assert updated.content_text.startswith("Try checking the left")

    # 5) delete_hint
    deleted = delete_hint(db=db_session, hint_id=hint.id)
    assert deleted.id == hint.id

    # confirm gone
    assert get_hint(db=db_session, hint_id=hint.id) is None
