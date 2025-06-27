# backend/api/routes/game.py
from flask import Blueprint, request, jsonify, g
from db.database import SessionLocal
from db.crud.log_event import create_log_event
from db.crud.game_session import get_game_session, update_game_session
from api.middleware.auth_middleware import user_required
from uuid import UUID

game_bp = Blueprint('game', __name__)

@game_bp.route('/attempt', methods=['POST'])
@user_required
def log_game_attempt():
    data = request.json
    db = SessionLocal()
    try:
        session_id_str = data.get('sessionId')
        if not session_id_str:
            return jsonify({"error": "sessionId is required"}), 400

        try:
            session_id = UUID(session_id_str)
        except ValueError:
            return jsonify({"error": "Invalid sessionId format"}), 400

        game_session = get_game_session(db, session_id)
        if not game_session:
            return jsonify({"error": "Game session not found"}), 404

        # Create a log event for the attempt
        log_event_data = {
            "session_id": game_session.id,
            "user_id": g.current_user_id,
            "challenge_id": data.get('challengeId'),
            "event_type": "code_submitted",
            "event_details_json": {
                "submitted_code": data.get('submittedCode'),
                "is_correct": data.get('isCorrect'),
                "errors": data.get('errors'),
                "attempt_number": game_session.challenge_attempts_count + 1
            }
        }
        create_log_event(db, event_data=log_event_data)

        # Update the game session
        updates = {
            "challenge_attempts_count": game_session.challenge_attempts_count + 1,
        }
        update_game_session(db, session_id=game_session.id, updates=updates)

        return jsonify({"message": "Attempt logged successfully"}), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": f"Failed to log game attempt: {str(e)}"}), 500
    finally:
        db.close()