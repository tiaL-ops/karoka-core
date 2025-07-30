# backend/api/routes/chat.py

from flask import Blueprint, request, jsonify
import os
import openai

# Initialize OpenAI key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Create a Flask Blueprint instead of a FastAPI APIRouter
chat_bp = Blueprint('chat_bp', __name__)

@chat_bp.route('', methods=['POST'])
def chat():
    if not openai.api_key:
        return jsonify({"detail": "OpenAI API key not configured."}), 500

    # Get JSON data from the request
    data = request.get_json()
    if not data or 'messages' not in data:
        return jsonify({"detail": "Missing 'messages' in request body."}), 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=data['messages'] # Use the messages list directly
        )
        content = response.choices[0].message.content.strip()
        # Return a JSON response using jsonify
        return jsonify({"reply": content})
    except Exception as e:
        return jsonify({"detail": f"OpenAI error: {e}"}), 502