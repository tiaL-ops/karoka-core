from flask import Blueprint, request, jsonify
import os
from openai import OpenAI  # ✅ NEW client

chat_bp = Blueprint('chat_bp', __name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # ✅ Use new client

@chat_bp.route('/testChat', methods=['GET', 'OPTIONS'])
def test_chat():
    return jsonify({"message": "Chat endpoint is working!"})    

@chat_bp.route('', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == "OPTIONS":
        return '', 200
    if not os.getenv("OPENAI_API_KEY"):
        return jsonify({"detail": "OpenAI API key not configured."}), 500

    data = request.get_json()
    if not data or 'messages' not in data:
        return jsonify({"detail": "Missing 'messages' in request body."}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=data['messages']
        )
        content = response.choices[0].message.content.strip()
        return jsonify({"reply": content})
    except Exception as e:
        return jsonify({"detail": f"OpenAI error: {e}"}), 502
