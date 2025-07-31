# karoka-core/backend/api/routes/game.py
from flask import Blueprint, request, jsonify, g
from db.database import SessionLocal
from db.crud.log_event import create_log_event
from db.crud.user import get_user, update_user 
from db.crud.game_session import get_game_session, update_game_session, create_game_session
from api.middleware.auth_middleware import user_required
from uuid import UUID
from datetime import datetime # Make sure datetime is imported
import logging
logger = logging.getLogger(__name__)


logger.info("🐼 🍷hello game ")

game_bp = Blueprint('game', __name__)
@game_bp.route('/session/start', methods=['POST'])
@user_required
def start_session():
    """
    Creates a new game session for the authenticated user.
    """
    db = SessionLocal()
    try:
        # g.current_user_id is set by the @user_required decorator
        
        # --- THIS IS THE FIX ---
        # Instead of passing user_id directly, we pass a dictionary 
        # of the initial session data, which is what the CRUD function expects.
        print(f"Starting session for user ID: {g.current_user_id}")  # Debugging line to check user ID
        session_payload = {
            "user_id": g.current_user_id, 
            "start_time": datetime.utcnow(), 
            "status": "in_progress"
        }
        new_session = create_game_session(db, session_data=session_payload)
        # ---------------------
        
        session_data = {
            "id": str(new_session.id),
            "user_id": new_session.user_id,
            "start_time": new_session.start_time.isoformat(),
            "status": new_session.status
        }
        return jsonify(session_data), 201
    except Exception as e:
        db.rollback()
        # Also, let's make the error logging a bit more informative
        logger.info(f"Error in start_session: {e}") 
        return jsonify({"error": f"Failed to start session: {str(e)}"}), 500
    finally:
        db.close()


@game_bp.route('/event', methods=['POST'])
@user_required
def log_generic_event():
    """
    Logs a generic event from the frontend.
    This version is now consistent with log_game_attempt and lets the DB handle the timestamp.
    """
    db = SessionLocal()
    data = request.json
    try:
        session_id_str = data.get('sessionId')
        if not session_id_str:
            return jsonify({"error": "sessionId is required"}), 400

        try:
            session_id = UUID(session_id_str)
        except ValueError:
            return jsonify({"error": "Invalid sessionId format"}), 400

        game_session = get_game_session(db, session_id)
        if not game_session or game_session.user_id != g.current_user_id:
            return jsonify({"error": "Game session not found or access denied"}), 404

        # --- THE FIX ---
        # We now create the data payload WITHOUT the timestamp from the client,
        # just like the working '/attempt' route does.
        log_event_data = {
            "session_id": session_id,
            "user_id": g.current_user_id,
            "challenge_id": data.get('challengeId'),
            "event_type": data.get('eventType'),
            "event_details_json": data.get('eventDetailsJson'),
        }

        create_log_event(db, event_data=log_event_data)
        db.commit()

        return jsonify({"message": "Event logged successfully"}), 200
    except Exception as e:
        db.rollback()
        logger.error(f"Error in log_generic_event: {e}", exc_info=True)
        return jsonify({"error": f"Failed to log event: {str(e)}"}), 500
    finally:
        db.close()

# The log_game_attempt function remains the same, no changes needed there.
@game_bp.route('/attempt', methods=['POST'])
@user_required
def log_game_attempt():
    logger.info("🐼 bro is attemtping ")
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

        is_correct = data.get('isCorrect', False)

        # --- NEW LOGIC STARTS HERE ---
        
        # 1. Update Game Session
        session_updates = {
            "challenge_attempts_count": game_session.challenge_attempts_count + 1,
        }
        
        if is_correct:
            session_updates["end_time"] = datetime.utcnow()
            session_updates["status"] = "completed"
            
            # Since the user was correct, let's set a score.
            # You can make this more complex later if you want.
            session_updates["final_score"] = 10 

            # 2. Update User Score
            current_user = get_user(db, g.current_user_id)
            logger.info(f"our Current user 🐼: {current_user}")  # Debugging line to check if user is fetched correctly
            if current_user:
                logger.info(f"scorebeforeeee: {current_user.score}")
                user_updates = {
                    
                    "score": (current_user.score or 0) + 10 
                }
                update_user(db, user_id=g.current_user_id, updates=user_updates)
                logger.info(f"scoreafter: {current_user.score}")

        update_game_session(db, session_id=game_session.id, updates=session_updates)

        # --- NEW LOGIC ENDS HERE ---


        # Create a log event for the attempt (this part is the same as before)
        log_event_data = {
            "session_id": game_session.id,
            "user_id": g.current_user_id,
            "challenge_id": data.get('challengeId'),
            "event_type": "code_submitted",
            "event_details_json": {
                "submitted_code": data.get('submittedCode'),
                "is_correct": is_correct,
                "errors": data.get('errors'),
                "attempt_number": game_session.challenge_attempts_count + 1
            }
        }
        create_log_event(db, event_data=log_event_data)
        
        db.commit() # Commit all changes (session update, user update, log event) at once.

        return jsonify({"message": "Attempt logged successfully"}), 200

    except Exception as e:
        db.rollback()
        print(f"Error logging attempt: {str(e)}")
        return jsonify({"error": f"Failed to log game attempt: {str(e)}"}), 500
    finally:
        db.close()