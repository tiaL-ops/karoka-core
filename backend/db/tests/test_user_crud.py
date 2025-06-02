# db/tests/test_user_crud.py

import pytest
from sqlalchemy.orm import Session

from models.user import User
from crud.user import create_user, get_user, list_users, update_user, delete_user


@pytest.mark.usefixtures("db_session")
def test_create_get_update_delete_user(db_session: Session):
    # 1) Create a new user
    payload = {
        "id": "firebase-uid-123",
        "name": "Alice",
        "bio": "Loves puzzles",
        "age": 25,
        "sex": "female",
        "vark_visual_score": 8,
        "vark_auditory_score": 5,
        "vark_readwrite_score": 6,
        "vark_kinesthetic_score": 7
    }
    user = create_user(db=db_session, user_data=payload)
    assert isinstance(user, User)
    assert user.id == payload["id"]
    assert user.name == "Alice"
    assert user.bio == "Loves puzzles"

    # 2) get_user
    fetched = get_user(db=db_session, user_id="firebase-uid-123")
    assert fetched is not None
    assert fetched.id == "firebase-uid-123"
    assert fetched.bio == "Loves puzzles"

    # 3) list_users (there should be exactly 1)
    all_users = list_users(db=db_session, skip=0, limit=10)
    assert len(all_users) == 1
    assert all_users[0].id == "firebase-uid-123"

    # 4) update_user: change name and age
    updates = {"name": "Alice Smith", "age": 26}
    updated = update_user(db=db_session, user_id="firebase-uid-123", updates=updates)
    assert updated.name == "Alice Smith"
    assert updated.age == 26

    # 5) delete_user
    deleted = delete_user(db=db_session, user_id="firebase-uid-123")
    assert deleted.id == "firebase-uid-123"

    # confirm it's gone
    assert get_user(db=db_session, user_id="firebase-uid-123") is None
