# backend/api/main.py
from flask import Flask
from flask_cors import CORS
from routes.ping import ping_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # allow all origins for dev

    app.register_blueprint(ping_bp, url_prefix="/api/ping")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
