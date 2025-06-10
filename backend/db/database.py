# db/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

if os.getenv("ENVIRONMENT") != "production":
    load_dotenv()

env = os.getenv("ENVIRONMENT", "development")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print(f"ENVIRONMENT 🙂: {env}")
print(f"Using DB: {DATABASE_URL}")

Base = declarative_base()
