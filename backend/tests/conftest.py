"""
Shared pytest fixtures for the backend test suite.
Uses an in-memory SQLite database so tests are fully isolated
and never touch production/development data.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
import models  # noqa: F401 — registers all ORM models against Base
from main import app

# ── In-memory SQLite engine (per test session) ────────────────────────────────
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    """Create all tables once before any test and drop them after the session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(create_test_tables):
    """Provide a transactional DB session that is rolled back after each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    """
    TestClient with the real `get_db` dependency swapped for the isolated
    test session, and `get_current_user` overridden to return a fake user.
    """
    # Build a fake user in the test DB so auth-protected routes work
    fake_user = models.User(email="test@example.com", name="Test User")
    db_session.add(fake_user)
    db_session.commit()
    db_session.refresh(fake_user)

    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # rollback is handled by the db_session fixture

    def override_get_current_user():
        return fake_user

    from deps import get_current_user
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as c:
        c._fake_user = fake_user  # expose for tests that need the user id
        yield c

    app.dependency_overrides.clear()
