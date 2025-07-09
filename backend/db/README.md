# Database Layer (PostgreSQL + SQLAlchemy)

This directory manages the connection to and interaction with the PostgreSQL database. It uses the **SQLAlchemy ORM** to map Python classes to database tables and **Alembic** for managing schema migrations.

## Table of Contents
1.  [Technology](#technology)
2.  [Key Directories & Files](#key-directories-files)
3.  [Database Management](#database-management)
4.  [Key Conventions](#key-conventions)

---

### Technology

* **Database**: PostgreSQL
* **ORM**: SQLAlchemy
* **Migrations**: Alembic
* **Testing**: Pytest

---

### Key Directories & Files

* `crud/`: Contains **CRUD** (Create, Read, Update, Delete) functions. All database logic is abstracted here.
* `models/`: Contains SQLAlchemy **model** definitions. Each Python class maps to a database table. Relationships (`user.game_sessions`) are defined here.
* `schemas/`: Contains **Pydantic** schemas used for data validation and serialization in the API layer. This ensures that data sent to and from the API is well-formed.
* `tests/`: Contains **Pytest** tests for every CRUD function to ensure reliability.
* `database.py`: Sets up the SQLAlchemy engine and `SessionLocal` for connecting to the database specified in the `.env` file.
* `manage.py`: A command-line script for basic database operations like creating tables.
* `alembic.ini`: Configuration file for Alembic migrations.

---

### Database Management

* **Running Tests**:
    The test suite runs against a separate test database. From the `kcopy/backend` directory, run:
    ```bash
    pytest
    ```
    The test setup in `db/tests/conftest.py` automatically creates and tears down the schema and truncates tables between tests to ensure a clean state.

* **Database Migrations with Alembic**:
    When you change a SQLAlchemy model (e.g., add a new column to the `User` model), you must create a database migration to apply that change to the live database.
    1.  **Generate a new migration script:**
        ```bash
        # Run this from inside the backend container or a local venv
        alembic revision --autogenerate -m "Add role to User model"
        ```
    2.  **Apply the migration:**
        ```bash
        alembic upgrade head
        ```

---

### Key Conventions

1.  **Isolate DB Logic in CRUD**:
    * API routes in `backend/api/routes/` should **never** interact with SQLAlchemy models directly.
    * They should **only** call functions from the `crud/` directory (e.g., `create_user`, `get_user`). This keeps the API layer clean and separates concerns.

2.  **Model -> CRUD -> Schema -> Test**:
    When adding a new table to the database, follow these steps:
    1.  Create the model in `db/models/`.
    2.  Create the corresponding CRUD functions in `db/crud/`.
    3.  Create the Pydantic schemas in `db/schemas/`.
    4.  Write tests for the CRUD functions in `db/tests/`.

3.  **One Session Per Request**:
    The API routes get a database session from `SessionLocal`, use it for the duration of the request, and then close it in a `finally` block. This is a standard pattern to ensure connections are properly managed.

To update db using alembic, open docker backend:
docker exec -it karoka-core-backend-1 bash
then 
alembic revision --autogenerate -m "messages"
alembic upgrade head