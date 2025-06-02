# tests/test_llm_template_crud.py
import pytest
from sqlalchemy.orm import Session
import uuid

from models.llm_template import LLMTemplate
from crud.llm_template import (
    create_llm_template,
    get_llm_template,
    list_llm_templates,
    update_llm_template,
    delete_llm_template
)

@pytest.mark.usefixtures("db_session")
def test_llm_template_crud(db_session: Session):
    # 1) create_llm_template
    payload = {
        "template_name": "test_template",
        "system_prompt": "You are a helpful guide.",
        "user_prompt_template": "I need help with {problem}.",
        "max_tokens": 256,
        "temperature": 0.7,
        "model_name": "gpt-test",
        "description": "A test template."
    }
    tmpl = create_llm_template(db=db_session, template_data=payload)
    assert isinstance(tmpl, LLMTemplate)
    assert tmpl.template_name == "test_template"

    # 2) get_llm_template
    fetched = get_llm_template(db=db_session, template_id=tmpl.id)
    assert fetched is not None
    assert fetched.system_prompt.startswith("You are a helpful guide")

    # 3) list_llm_templates
    all_tmpls = list_llm_templates(db=db_session, skip=0, limit=5)
    assert any(t.id == tmpl.id for t in all_tmpls)

    # 4) update_llm_template
    updates = {"temperature": 0.5, "description": "Updated description"}
    updated = update_llm_template(db=db_session, template_id=tmpl.id, updates=updates)
    assert float(updated.temperature) == 0.5
    assert updated.description == "Updated description"

    # 5) delete_llm_template
    deleted = delete_llm_template(db=db_session, template_id=tmpl.id)
    assert deleted.id == tmpl.id

    # confirm gone
    assert get_llm_template(db=db_session, template_id=tmpl.id) is None
