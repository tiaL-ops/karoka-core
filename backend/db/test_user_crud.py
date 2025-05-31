from database import SessionLocal
from crud import user
from schemas.user import UserCreate

db = SessionLocal()

# Create
new_user = UserCreate(username="alice", email="alice@example.com")
user_in_db = user.create_user(db, new_user)
print("Created:", user_in_db.id, user_in_db.username, user_in_db.email)

# Get
fetched = user.get_user(db, user_in_db.id)
print("Fetched:", fetched.id, fetched.username, fetched.email)

# All users
for u in user.get_users(db):
    print(u.id, u.username, u.email)
