# db/tests/conftest.py

import os
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from database import Base

# Import all models so that Base.metadata.create_all() sees them
import models.user
import models.game_session
import models.challenge
import models.hint
import models.documentation_topic
import models.llm_template
import models.log_event
import models.assessment
import models.llm_content_history


@pytest.fixture(scope="session")
def engine():
    """
    Create all tables at the start of the test session, then drop them at the end.
    """
    TEST_DATABASE_URL = os.getenv(
        "TEST_DATABASE_URL",
        "postgresql://karoka:karoka@localhost:5433/karoka_test"
    )
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(engine):
    """
    Provide a new Session for each test, and after each test truncate all tables.
    """
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = SessionLocal()
    yield session

    # Roll back any pending transaction
    session.rollback()

    # Truncate ALL tables in the correct order (FK dependencies)
    # Adjust table names to match your actual __tablename__ values:
    tables_to_truncate = [
        'log_events',
        'llm_content_history',
        'assessments',
        'documentation_topics',
        'hints',
        'challenges',
        'game_sessions',
        'users'
    ]
    # Use CASCADE to drop dependent rows as well
    for tbl in tables_to_truncate:
        session.execute(text(f'TRUNCATE TABLE {tbl} CASCADE;'))
    session.commit()
    session.close()
