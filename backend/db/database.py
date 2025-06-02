# db/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

env = os.getenv("ENVIRONMENT", "development")

# Choose DB URL based on environment
if env == "production":
    DATABASE_URL = os.getenv("DATABASE_URL_PROD")
elif env == "testing":
    DATABASE_URL = os.getenv("DATABASE_URL_TEST")
else:
    DATABASE_URL = os.getenv("DATABASE_URL_DEV")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print(f"ENVIRONMENT: {env}")
print(f"Using DB: {DATABASE_URL}")

Base = declarative_base()
