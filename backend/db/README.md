

#  Database (PostgreSQL + SQLAlchemy)

This project uses PostgreSQL with SQLAlchemy ORM.

##  Schema

**Table: users**

- `id` (PK, int)
- `username` (str, unique)
- `email` (str, unique)

## Models

Defined in `models/user.py` is where you have the id, and if it is unique
```python
id, username, email
````

## Schema (Pydantic)

In `schemas/user.py` is what type of data is there 

```python
username: str
email: str
```

## 🔧 CRUD

Basic CRUD in `crud/user.py`: create, get by ID, list, delete.

## 🧪 Test

Run `test_user_crud.py` to test user creation and retrieval.

## 🐘 DB

Make sure PostgreSQL is running and DB `karoka_dev` is created.

```
