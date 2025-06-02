
# tests/conftest.py
import sqlalchemy

import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker



from database import Base

# Import all models so that Base.metadata knows about them. 
import models.user
import models.game_session
import models.challenge
import models.hint
import models.documentation_topic
import models.llm_template
import models.log_event
import models.assessment
import models.llm_content_history

from crud import user as user_crud
# (We don’t need to import each crud here, 
# but the models must be imported so that Base.metadata is aware of all tables.)


@pytest.fixture(scope="session")
def engine():
    """
    Creates the tables in the test database once per test session,
    then drops them when all tests complete.
    """
    TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL")

    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(engine):
    """
    Provides a new transactional session for each test function.
    Rolls back any changes at the end of the test so tests stay isolated.
    """
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    # Begin a nested transaction (SAVEPOINT) so that we can roll back after each test.
    transaction = session.begin_nested()

    @sqlalchemy.event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess, trans):
        """
        Whenever a nested transaction ends, reopen a new savepoint.
        This keeps the database clean between tests.
        """
        if not sess.is_active:
            sess.begin_nested()

    yield session

    session.rollback()
    session.close()
