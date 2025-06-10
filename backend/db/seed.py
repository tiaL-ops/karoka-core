# backend/db/seed.py
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from datetime import datetime

# --- FIX FOR IMPORTS ---
# This adds the project's root directory ("backend") to the Python path.
# It allows the script to find modules like `db` using an absolute path.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
# --- END FIX ---

# Now, you can import your models using absolute paths from the project root.
# NOTE: You must import each model from its specific file.
from db.models.user import User
from db.models.challenge import Challenge
from db.models.documentation_topic import DocumentationTopic
# ... import other models as needed

def seed_data():
    # Load environment variables to get the database URL
    if os.getenv("ENVIRONMENT") != "production":
        load_dotenv()
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")

    print("Connecting to database for seeding...")
    engine = create_engine(database_url)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Check if users already exist to avoid creating duplicates
        if session.query(User).count() > 0:
            print("Database already seeded. Exiting.")
            return

        print("Seeding initial data...")

        # --- Create a User ---
        new_user = User(
            id="some-unique-user-id-1",
            name="Alice",
            role="admin",
            created_at=datetime.utcnow(),
            last_updated_at=datetime.utcnow()
        )
        session.add(new_user)

        # --- Create a Challenge ---
        # new_challenge = Challenge(...)
        # session.add(new_challenge)
        
        # --- Create a Documentation Topic ---
        # new_topic = DocumentationTopic(...)
        # session.add(new_topic)

        # Commit all the new records to the database
        session.commit()
        print("Data seeded successfully!")

    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        session.rollback()
    finally:
        session.close()


if __name__ == "__main__":
    seed_data()