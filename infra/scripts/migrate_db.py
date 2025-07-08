#!/usr/bin/env python
import os
import firebase_admin
from firebase_admin import credentials

# 1) init Firebase
cred = credentials.Certificate(os.path.join(os.getcwd(), "karoka-core-firebase-adminsdk.json"))
firebase_admin.initialize_app(cred)

# 2) run Alembic migrations
from alembic import command
from alembic.config import Config
cfg = Config(os.path.join(os.getcwd(), "backend", "alembic.ini"))
command.upgrade(cfg, "head")

# 3) sync Firestore → Postgres
from db.crud.user import sync_from_firestore_to_postgres
sync_from_firestore_to_postgres()

print("✅ Migrations applied and users synced.")
