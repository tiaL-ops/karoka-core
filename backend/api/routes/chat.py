# backend/api/routes/chat.py
from flask import Blueprint, request, jsonify, g
import os
from openai import OpenAI
from ..middleware.auth_middleware import user_required # Import the decorator
from db.database import SessionLocal
from db.crud.llm_content_history import create_llm_content_history
from uuid import UUID

chat_bp = Blueprint('chat_bp', __name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@chat_bp.route('/testChat', methods=['GET', 'OPTIONS'])
def test_chat():
    return jsonify({"message": "Chat endpoint is working!"})

@chat_bp.route('', methods=['POST', 'OPTIONS'])
@user_required # Protect the route and get the user_id
def chat():
    if request.method == "OPTIONS":
        return '', 200
    if not os.getenv("OPENAI_API_KEY"):
        return jsonify({"detail": "OpenAI API key not configured."}), 500

    data = request.get_json()
    if not data or 'messages' not in data:
        return jsonify({"detail": "Missing 'messages' in request body."}), 400
    if 'sessionId' not in data:
        return jsonify({"detail": "Missing 'sessionId' in request body."}), 400


    db = SessionLocal()
    try:
        # Get the user's message (the last one in the array)
        user_message = data['messages'][-1]['content']

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=data['messages']
        )
        content = response.choices[0].message.content.strip()

        # Save to database
        history_data = {
            "session_id": UUID(data['sessionId']),
            "user_id": g.current_user_id, # From @user_required
            "prompt_used": user_message,
            "generated_content": content,
            "content_type": "dialogue" # As it's from the help chat
        }
        create_llm_content_history(db, content_data=history_data)

        return jsonify({"reply": content})
    except Exception as e:
        db.rollback()
        return jsonify({"detail": f"An error occurred: {e}"}), 502
    finally:
        db.close()