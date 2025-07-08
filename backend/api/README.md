# Backend API (Flask)

This directory contains the Flask backend application that powers Karoka. It serves as the central hub for business logic, data processing, and secure communication with the database.

## Table of Contents
1.  [Core Responsibilities](#core-responsibilities)
2.  [Key Directories & Files](#key-directories-files)
3.  [Authentication](#authentication)
4.  [Updating the API](#updating-the-api)

---

### Core Responsibilities

* Provide a RESTful API for the frontend.
* Verify user identity using Firebase ID Tokens.
* Perform all database operations (Create, Read, Update, Delete) via the `db` module.
* Execute complex business logic that should not live on the client-side.

---

### Key Directories & Files

* `api/`: The main Flask application package.
    * `main.py`: The entry point of the Flask app. It uses the app factory pattern (`create_app`), initializes Firebase Admin, sets up CORS, and registers API blueprints.
    * `routes/`: API endpoints are organized into **Blueprints**. Each file (e.g., `user.py`, `database.py`) defines a set of related routes.
    * `middleware/`: Contains decorators for protecting routes.
        * `auth_middleware.py`: Defines `@admin_required` and `@user_required` decorators that verify Firebase ID tokens and check user roles before allowing a request to proceed.
* `db/`: The database interaction layer. (See `backend/db/README.md` for details).
* `alembic/`: Database migration scripts.
* `.env`: **(You must create this)** Contains the `DATABASE_URL` and `FIREBASE_ADMIN_SDK_PATH`.
* `requirements.txt`: A list of all Python dependencies.

---

### Authentication

The backend uses a token-based authentication scheme integrated with Firebase.

1.  The frontend client gets a **Firebase ID Token** after a user logs in.
2.  For every request to a protected backend endpoint, the frontend sends this token in the `Authorization` header:
    `Authorization: Bearer <ID_TOKEN>`
3.  The `auth_middleware` on the backend intercepts the request, verifies the token's signature and expiration using the **Firebase Admin SDK**, and extracts the user's UID and role.
4.  If the token is valid and the user has the required role, the request is allowed to proceed. Otherwise, a `401 Unauthorized` or `403 Forbidden` error is returned.

**This is the primary security mechanism for the API. All routes handling sensitive data or actions must be protected with a decorator from `auth_middleware.py`.**

---

### Updating the API

* **Adding a New Endpoint**:
    1.  Add the new route function to an existing blueprint in `api/routes/` or create a new blueprint file if it represents a new domain.
    2.  Protect it with an appropriate auth decorator (`@user_required` or `@admin_required`).
    3.  Register the new blueprint in `api/main.py` if you created a new one.

* **Adding a New Dependency**:
    1.  Install the package: `pip install <package-name>`
    2.  Update the requirements file: `pip freeze > requirements.txt`
    3.  Rebuild the Docker container (`docker-compose up --build`) to include the new package.

#if you need user.py to sync
curl -X POST http://localhost:5001/api/user/sync 
curl -X GET http://localhost:5001/api/database/log_events