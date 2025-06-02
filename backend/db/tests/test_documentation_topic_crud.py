# tests/test_documentation_topic_crud.py
import pytest
from sqlalchemy.orm import Session
import uuid

from models.documentation_topic import DocumentationTopic
from crud.documentation_topic import (
    create_documentation_topic,
    get_documentation_topic,
    list_documentation_topics,
    update_documentation_topic,
    delete_documentation_topic
)

@pytest.mark.usefixtures("db_session")
def test_documentation_topic_crud(db_session: Session):
    # 1) create_documentation_topic
    payload = {
        "topic_name": "Python Variables",
        "content": "In Python, variables are references to objects...",
        "difficulty_level": 2,
        "associated_vark_modalities": ["Read/Write", "Visual"],
        "llm_template_id": None
    }
    doc = create_documentation_topic(db=db_session, topic_data=payload)
    assert isinstance(doc, DocumentationTopic)
    assert doc.topic_name == "Python Variables"

    # 2) get_documentation_topic
    fetched = get_documentation_topic(db=db_session, topic_id=doc.id)
    assert fetched is not None
    assert fetched.content.startswith("In Python, variables")

    # 3) list_documentation_topics
    all_docs = list_documentation_topics(db=db_session, skip=0, limit=10)
    assert any(d.id == doc.id for d in all_docs)

    # 4) update_documentation_topic
    updates = {"content": "Variables in Python store references to values."}
    updated = update_documentation_topic(db=db_session, topic_id=doc.id, updates=updates)
    assert updated.content.startswith("Variables in Python store")

    # 5) delete_documentation_topic
    deleted = delete_documentation_topic(db=db_session, topic_id=doc.id)
    assert deleted.id == doc.id

    # confirm gone
    assert get_documentation_topic(db=db_session, topic_id=doc.id) is None
