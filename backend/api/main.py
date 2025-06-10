# backend/api/main.py
import os
import json
import db.models 
from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

if os.getenv("ENVIRONMENT") != "production":
    # This will load a local .env during development, but skip on Render
    load_dotenv()

def create_app():
    app = Flask(__name__)

    # Environment
    env = os.getenv("ENVIRONMENT", "development")
    app.config["ENV"] = env
    app.config["DEBUG"] = (env != "production")

    # Database URI
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url

    # Secret key
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key and env == "production":
        raise RuntimeError("SECRET_KEY must be set in production")
    app.config["SECRET_KEY"] = secret_key or "dev-secret"

    # CORS
    cors_origin = os.getenv("CORS_ORIGIN")
    if cors_origin:
        origins = [o.strip() for o in cors_origin.split(",") if o.strip()]
        CORS(app, origins=origins)
    else:
        CORS(app)

    # Firebase Admin initialization from JSON env var
    firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if firebase_json:
        try:
            sa_info = json.loads(firebase_json)
            cred = credentials.Certificate(sa_info)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized from env var")
        except Exception as e:
            print("Error initializing Firebase Admin:", e)
    else:
        print("No Firebase credentials provided (FIREBASE_SERVICE_ACCOUNT_JSON missing)")

    # Register blueprints
    from api.routes.ping import ping_bp
    from api.routes.user import user_bp
    from api.routes.database import database_bp
    app.register_blueprint(ping_bp, url_prefix="/api/ping")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(database_bp, url_prefix="/api/database")

    return app

# Expose module-level WSGI app for Gunicorn
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    env = os.getenv("ENVIRONMENT", "development")
    print(f"Starting app in ENVIRONMENT={env}")
    app.run(host="0.0.0.0", port=port, debug=app.config["DEBUG"])
