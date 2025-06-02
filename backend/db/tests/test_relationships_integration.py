# db/tests/test_relationships_integration.py

import pytest
from sqlalchemy.orm import Session
from datetime import datetime

# CRUD imports
from crud.user import create_user, delete_user
from crud.game_session import create_game_session, get_game_session
from crud.log_event import create_log_event, get_log_event
from crud.assessment import create_assessment, get_assessment
from crud.llm_content_history import create_llm_content_history, get_llm_content_history, list_llm_content_for_session

from crud.challenge import create_challenge, delete_challenge
from crud.hint import create_hint, get_hint, list_hints_for_challenge
from crud.assessment import list_assessments_for_user
from crud.llm_content_history import list_llm_content_for_session

from crud.llm_template import create_llm_template, delete_llm_template
from crud.documentation_topic import create_documentation_topic, delete_documentation_topic

# Model imports (for type‐checking, not for relationship navigation)
from models.user import User
from models.game_session import GameSession
from models.challenge import Challenge
from models.hint import Hint
from models.llm_template import LLMTemplate
from models.documentation_topic import DocumentationTopic
from models.assessment import Assessment
from models.llm_content_history import LLMContentHistory
from models.log_event import LogEvent


@pytest.mark.usefixtures("db_session")
def test_user_cascade_behavior(db_session: Session):
    """
    1) Create a User → GameSession → LogEvent, Assessment, LLMContentHistory
    2) Verify each child row exists (get_*/list_* returns non‐None)
    3) Delete User → confirm cascade deletes all child rows
    """
    # 1A) Create a User
    user = create_user(db=db_session, user_data={
        "id": "cascade-user-1",
        "name": "CascadeUser",
        "bio": "Testing user cascade",
        "age": 30,
        "sex": "other",
        "vark_visual_score": 5,
        "vark_auditory_score": 6,
        "vark_readwrite_score": 7,
        "vark_kinesthetic_score": 8
    })
    assert isinstance(user, User)

    # 1B) Create a GameSession for that user
    now = datetime.utcnow()
    session = create_game_session(db=db_session, session_data={
        "user_id": user.id,
        "start_time": now,
        "status": "in_progress",
        "arena_played": "cascade_arena"
    })
    assert isinstance(session, GameSession)

    # 1C) Create a LogEvent for that session
    log = create_log_event(db=db_session, event_data={
        "session_id": session.id,
        "user_id": user.id,
        "event_type": "map_area_entered",
        "event_details_json": {"area_id": "vark_zone", "vark_association": "Visual"}
    })
    assert isinstance(log, LogEvent)
    # Ensure we can fetch it
    assert get_log_event(db=db_session, event_id=log.id) is not None

    # 1D) Create an Assessment for that user (no challenge required)
    assess = create_assessment(db=db_session, assessment_data={
        "user_id": user.id,
        "type": "vark_test",
        "challenge_id": None,
        "score": 88.5,
        "completion_time_seconds": 90,
        "raw_responses_json": {"Q1": "A", "Q2": "B"}
    })
    assert isinstance(assess, Assessment)
    # Ensure we can fetch it
    assert get_assessment(db=db_session, assessment_id=assess.id) is not None

    # 1E) Create an LLMContentHistory for that session
    llm = create_llm_content_history(db=db_session, content_data={
        "session_id": session.id,
        "user_id": user.id,
        "inferred_modality": "Kinesthetic",
        "prompt_used": "Generate a hint for cascade test",
        "generated_content": "Here’s your cascade hint",
        "content_type": "hint",
        "llm_template_id": None,
        "challenge_id": None,
        "response_time_ms": 80,
        "token_usage_input": 10,
        "token_usage_output": 20,
        "cost_estimate": 0.001
    })
    assert isinstance(llm, LLMContentHistory)
    # Ensure we can fetch it
    assert get_llm_content_history(db=db_session, record_id=llm.id) is not None

    # 2) Delete User → cascade should delete all children
    deleted_user = delete_user(db=db_session, user_id=user.id)
    assert deleted_user.id == user.id

    # Verify GameSession is deleted
    assert get_game_session(db=db_session, session_id=session.id) is None

    # Verify LogEvent is deleted
    assert get_log_event(db=db_session, event_id=log.id) is None

    # Verify Assessment is deleted
    assert get_assessment(db=db_session, assessment_id=assess.id) is None

    # Verify LLMContentHistory is deleted
    assert get_llm_content_history(db=db_session, record_id=llm.id) is None


@pytest.mark.usefixtures("db_session")
def test_challenge_hint_and_set_null_behavior(db_session: Session):
    """
    1) Create a Challenge → Hint, Assessment (pointing to challenge), LLMContent (pointing to challenge).
    2) Verify hint exists, assessment.challenge_id and llm_content.challenge_id are set.
    3) Delete Challenge → Hint should cascade‐delete; Assessment.challenge_id and LLMContentHistory.challenge_id should be SET NULL.
    """
    # 1A) Create a Challenge
    chal = create_challenge(db=db_session, challenge_data={
        "arena_id": "cascade_chal_arena",
        "name": "CascadeChallenge",
        "description": "Testing challenge cascade",
        "challenge_type": "drag_and_drop",
        "expected_solution_data": {"bucket_X_count": 1},
        "difficulty_level": "easy",
        "associated_vark_modalities": ["Visual"]
    })
    assert isinstance(chal, Challenge)

    # 1B) Create two Hints for that challenge
    hint1 = create_hint(db=db_session, hint_data={
        "challenge_id": chal.id,
        "hint_sequence_number": 1,
        "modality_preference": "visual",
        "content_text": "First hint text",
        "content_audio_url": None,
        "is_llm_generated_template": False,
        "llm_template_id": None
    })
    hint2 = create_hint(db=db_session, hint_data={
        "challenge_id": chal.id,
        "hint_sequence_number": 2,
        "modality_preference": "kinesthetic",
        "content_text": "Second hint text",
        "content_audio_url": None,
        "is_llm_generated_template": False,
        "llm_template_id": None
    })
    assert isinstance(hint1, Hint)
    assert isinstance(hint2, Hint)

    # Ensure list_hints_for_challenge returns both
    hints_before = list_hints_for_challenge(db=db_session, challenge_id=chal.id)
    ids_before = {h.id for h in hints_before}
    assert ids_before == {hint1.id, hint2.id}

    # 1C) Create a dummy User (needed for Assessment & LLMContent)
    user = create_user(db=db_session, user_data={
        "id": "cascade-chal-user",
        "name": "NestedUser",
        "bio": None, "age": None, "sex": None,
        "vark_visual_score": None, "vark_auditory_score": None,
        "vark_readwrite_score": None, "vark_kinesthetic_score": None
    })

    # 1D) Create one Assessment for that challenge
    assess_for_chal = create_assessment(db=db_session, assessment_data={
        "user_id": user.id,
        "type": "in_game_challenge",
        "challenge_id": chal.id,
        "score": 77.0,
        "completion_time_seconds": 60,
        "raw_responses_json": {"answer": "xyz"}
    })
    assert isinstance(assess_for_chal, Assessment)
    fetched_assess = get_assessment(db=db_session, assessment_id=assess_for_chal.id)
    assert fetched_assess.challenge_id == chal.id

    # 1E) Create one LLMContentHistory for that challenge
    llm_for_chal = create_llm_content_history(db=db_session, content_data={
        "session_id": None,
        "user_id": user.id,
        "inferred_modality": "Visual",
        "prompt_used": "Cascade challenge hint",
        "generated_content": "Hint for cascade challenge",
        "content_type": "hint",
        "llm_template_id": None,
        "challenge_id": chal.id,
        "response_time_ms": 50,
        "token_usage_input": 5,
        "token_usage_output": 10,
        "cost_estimate": 0.0005
    })
    assert isinstance(llm_for_chal, LLMContentHistory)
    fetched_llm = get_llm_content_history(db=db_session, record_id=llm_for_chal.id)
    assert fetched_llm.challenge_id == chal.id

    # 2) Delete Challenge
    deleted_chal = delete_challenge(db=db_session, challenge_id=chal.id)
    assert deleted_chal.id == chal.id

    # 2A) Hints should be gone (cascade delete)
    assert get_hint(db=db_session, hint_id=hint1.id) is None
    assert get_hint(db=db_session, hint_id=hint2.id) is None

    # 2B) Assessment.challenge_id should now be NULL (not deleted)
    fetched_assess_after = get_assessment(db=db_session, assessment_id=assess_for_chal.id)
    assert fetched_assess_after is not None
    assert fetched_assess_after.challenge_id is None

    # 2C) LLMContentHistory.challenge_id should now be NULL (not deleted)
    fetched_llm_after = get_llm_content_history(db=db_session, record_id=llm_for_chal.id)
    assert fetched_llm_after is not None
    assert fetched_llm_after.challenge_id is None

    # Cleanup: delete the user and assessment manually
    delete_user(db=db_session, user_id=user.id)
    # Assessment and LLMContentHistory will cascade‐delete when user is removed


@pytest.mark.usefixtures("db_session")
def test_llm_template_set_null_behavior(db_session: Session):
    """
    1) Create an LLMTemplate → Hint, DocumentationTopic, LLMContentHistory referencing it
    2) Verify all three child rows have llm_template_id set
    3) Delete LLMTemplate → child.llm_template_id should become NULL (not deleted)
    """
    # 1A) Create an LLMTemplate
    tmpl = create_llm_template(db=db_session, template_data={
        "template_name": "cascade_tmpl",
        "system_prompt": "Cascade test prompt",
        "user_prompt_template": "Use this for testing: {x}",
        "max_tokens": 128,
        "temperature": 0.3,
        "model_name": "gpt-cascade",
        "description": "Testing SET NULL behavior"
    })
    assert isinstance(tmpl, LLMTemplate)

    # 1B) Prepare a Challenge and User to satisfy foreign keys
    chal = create_challenge(db=db_session, challenge_data={
        "arena_id": "tmpl_arena",
        "name": "TemplateChallenge",
        "description": None,
        "challenge_type": "dialogue_challenge",
        "expected_solution_data": {"expected_output": "ok"},
        "difficulty_level": "medium",
        "associated_vark_modalities": ["Auditory"]
    })
    user = create_user(db=db_session, user_data={
        "id": "tmpl-user-1",
        "name": "TmplUser",
        "bio": None, "age": None, "sex": None,
        "vark_visual_score": None, "vark_auditory_score": None,
        "vark_readwrite_score": None, "vark_kinesthetic_score": None
    })
    session = create_game_session(db=db_session, session_data={
        "user_id": user.id,
        "start_time": datetime.utcnow(),
        "status": "in_progress"
    })

    # 1C) Create a Hint referencing this template
    hint = create_hint(db=db_session, hint_data={
        "challenge_id": chal.id,
        "hint_sequence_number": 1,
        "modality_preference": "aural",
        "content_text": "Hint with template",
        "content_audio_url": None,
        "is_llm_generated_template": True,
        "llm_template_id": tmpl.id
    })
    assert isinstance(hint, Hint)
    assert hint.llm_template_id == tmpl.id

    # 1D) Create a DocumentationTopic referencing this template
    doc = create_documentation_topic(db=db_session, topic_data={
        "topic_name": "TemplateDoc",
        "content": "Doc content for cascade test",
        "difficulty_level": 1,
        "associated_vark_modalities": ["Read/Write"],
        "llm_template_id": tmpl.id
    })
    assert isinstance(doc, DocumentationTopic)
    assert doc.llm_template_id == tmpl.id

    # 1E) Create an LLMContentHistory referencing this template
    llm_inst = create_llm_content_history(db=db_session, content_data={
        "session_id": session.id,
        "user_id": user.id,
        "inferred_modality": "Read/Write",
        "prompt_used": "LLMContent for template",
        "generated_content": "Generated by template",
        "content_type": "dialogue",
        "llm_template_id": tmpl.id,
        "challenge_id": None,
        "response_time_ms": 30,
        "token_usage_input": 8,
        "token_usage_output": 16,
        "cost_estimate": 0.0008
    })
    assert isinstance(llm_inst, LLMContentHistory)
    assert llm_inst.llm_template_id == tmpl.id

    # 2) Delete LLMTemplate
    deleted_tmpl = delete_llm_template(db=db_session, template_id=tmpl.id)
    assert deleted_tmpl.id == tmpl.id

    # 2A) Assert child.llm_template_id is now NULL (not deleted)
    #    – Hint
    refreshed_hint = get_hint(db=db_session, hint_id=hint.id)
    assert refreshed_hint is not None
    assert refreshed_hint.llm_template_id is None

    #    – DocumentationTopic
    refreshed_doc = create_documentation_topic  # placeholder to avoid unused import
    from crud.documentation_topic import get_documentation_topic
    refreshed_doc = get_documentation_topic(db=db_session, topic_id=doc.id)
    assert refreshed_doc is not None
    assert refreshed_doc.llm_template_id is None

    #    – LLMContentHistory
    refreshed_llm = get_llm_content_history(db=db_session, record_id=llm_inst.id)
    assert refreshed_llm is not None
    assert refreshed_llm.llm_template_id is None

    # Cleanup: delete hint, doc, challenge, session, user
    from crud.hint import delete_hint
    from crud.documentation_topic import delete_documentation_topic
    from crud.game_session import delete_game_session

    delete_hint(db=db_session, hint_id=hint.id)
    delete_documentation_topic(db=db_session, topic_id=doc.id)
    delete_challenge(db=db_session, challenge_id=chal.id)
    delete_game_session(db=db_session, session_id=session.id)
    delete_user(db=db_session, user_id=user.id)
