# backend/api/main.py
import db.models 
from flask import Flask
from flask_cors import CORS
from api.routes.ping import ping_bp
from api.routes.user import user_bp

from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)

    cors_origin = os.getenv("CORS_ORIGIN", "*")
    #CORS(app, origins=[cors_origin])
    CORS(app)

    app.register_blueprint(ping_bp, url_prefix="/api/ping")
    app.register_blueprint(user_bp, url_prefix='/api')

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True,host='0.0.0.0', port=5001)
