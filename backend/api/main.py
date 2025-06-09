# backend/api/main.py
import db.models 
from flask import Flask
from flask_cors import CORS
from api.routes.ping import ping_bp
from api.routes.user import user_bp
from api.routes.database import database_bp 
import firebase_admin

from firebase_admin import credentials
from firebase_admin import auth, firestore 

from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)

    cors_origin = os.getenv("CORS_ORIGIN", "*")
    CORS(app)

    firebase_admin_sdk_path = os.getenv("FIREBASE_ADMIN_SDK_PATH", None)
    print(f"FIREBASE_ADMIN_SDK_PATH: {firebase_admin_sdk_path}")
    if firebase_admin_sdk_path and os.path.exists(firebase_admin_sdk_path):
        cred = credentials.Certificate(firebase_admin_sdk_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully.")
    else:
        print("WARNING: Firebase Admin SDK not initialized. Check FIREBASE_ADMIN_SDK_PATH and file existence.")

    app.register_blueprint(ping_bp, url_prefix="/api/ping")
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(database_bp, url_prefix='/api/database')

    return app

# Expose module-level WSGI app for Gunicorn
app = create_app()

if __name__ == "__main__":
    # Dev-only: run Flask built-in server
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
