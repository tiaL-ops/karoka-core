# backend/api/main.py
import os
import json
import db.models 
from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

# Load .env only in non-production
if os.getenv("ENVIRONMENT") != "production":
    load_dotenv()

def create_app():
    app = Flask(__name__)

    # Environment
    env = os.getenv("ENVIRONMENT", "development")
    print(f"ENVIRONMENT here uuu : {env}")
    app.config["ENV"] = env
    app.config["DEBUG"] = (env != "production")

    # Database URI
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    print(f"ENVIRONMENT here in dbb  uuu 🤨: {env}")
    print(f"so Using DB : {database_url}")

    # Secret key
    secret_key = os.getenv("SECRET_KEY")
    if env == "production" and not secret_key:
        raise RuntimeError("SECRET_KEY must be set in production")
    app.config["SECRET_KEY"] = secret_key or "dev-secret"

    # CORS
    cors_origin = os.getenv("CORS_ORIGIN")
    if cors_origin:
        origins = [o.strip() for o in cors_origin.split(",") if o.strip()]
        CORS(app, origins=origins)
        print(f"CORS origins set to: {origins}")
    else:
        CORS(app)
        print("CORS: allowing all origins (no CORS_ORIGIN set)")

    # Firebase Admin initialization
    cred = None
    if env == "production":
        firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if firebase_json:
            try:
                sa_info = json.loads(firebase_json)
                cred = credentials.Certificate(sa_info)
            except Exception as e:
                print("Failed to parse Firebase JSON:", e)
    else:
        firebase_path = os.getenv("FIREBASE_ADMIN_SDK_PATH")
        if firebase_path and os.path.exists(firebase_path):
            cred = credentials.Certificate(firebase_path)

    if cred:
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        print("Firebase Admin initialized")
    else:
        print("Firebase credentials not provided or invalid")

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
    # Local dev: run Flask built-in server
    port = int(os.getenv("PORT", 5001))
    env = os.getenv("ENVIRONMENT", "development")
    print(f"Starting Flask dev server in ENVIRONMENT={env} on port {port}")
    app.run(host="0.0.0.0", port=port, debug=app.config["DEBUG"])
