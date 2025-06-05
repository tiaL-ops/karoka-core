# api/routes/user.py
from flask import Blueprint, request, jsonify
from db.database import SessionLocal
from db.crud.user import create_user, get_user
from db.models.user import User
import firebase_admin
from firebase_admin import auth, firestore # Import firestore to use firestore.SERVER_TIMESTAMP

user_bp = Blueprint('user', __name__)
import logging
logger = logging.getLogger(__name__)

# Inside create_user_route
logger.info("🐼 🍷hello")

def get_current_firebase_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        logger.error("Authorization header missing") # Added logging
        return None, {"error": "Authorization header missing"}, 401
    token = auth_header.split(' ')[1] if ' ' in auth_header else None
    if not token:
        logger.error("Token missing from Authorization header") # Added logging
        return None, {"error": "Token missing from Authorization header"}, 401
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid'], None, None
    except Exception as e:
        logger.error(f"Invalid Firebase ID token: {e}") # Added detailed logging
        return None, {"error": f"Invalid token: {str(e)}"}, 401


@user_bp.route('/', methods=['POST'], strict_slashes=False)
def create_user_route():
    data = request.json
    user_id_from_token, error_response, status_code = get_current_firebase_user_id()
    if error_response:
        return jsonify(error_response), status_code

    # Ensure 'id' is set from the verified Firebase UID
    data['id'] = user_id_from_token

    print('🐼 ENtered the create user and got the data id , it is ', data['id'])
    if 'displayName' in data: 
        data['name'] = data['displayName']
    elif 'email' in data:
        data['name'] = data['email'] # Fallback if displayName not provided
    else:
        data['name'] = "New User" # Default name if neither is available


    db = SessionLocal()
    try:
        user = create_user(db, user_data=data) 
        
        # This part ensures consistency between PostgreSQL and Firestore
        firestore_db = firebase_admin.firestore.client()
        user_doc_ref = firestore_db.collection('users').document(user.id)
        
        # Use data from the request, or the created user object for Firestore
        firestore_data = {
            "role": data.get("role", "user"),
            "email": data.get("email"),
            "displayName": data.get("name"), # Use the 'name' used for PostgreSQL as displayName for Firestore
            "createdAt": firestore.SERVER_TIMESTAMP,
            "lastActiveAt": firestore.SERVER_TIMESTAMP,
            "sessionId": None,
            "currentProgress": {
              "currentArena": None,
              "lastPlayedGameId": None,
            },
        }
        user_doc_ref.set(firestore_data, merge=True) # Use merge=True to avoid overwriting other fields if document exists
        print(f"User {user.id} created in data  in rirestorwith data: {firestore_data}")
        return jsonify({"id": user.id, "name": user.name}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500
    finally:
        db.close()


@user_bp.route('/<user_id>', methods=['GET'])
def get_user_route(user_id):
    print('🐼GETTTTTTTT')
    verified_uid, error_response, status_code = get_current_firebase_user_id()
    if error_response:
        return jsonify(error_response), status_code

    if verified_uid != user_id:
        return jsonify({"error": "Unauthorized access to user profile"}), 403
   
    db = SessionLocal()
    try:
        user = get_user(db, user_id)
        if user:
            return jsonify({"id": user.id, "name": user.name})
        return jsonify({"error": "User not found"}), 404
    finally:
        db.close()