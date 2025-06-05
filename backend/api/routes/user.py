# api/routes/user.py
from flask import Blueprint, request, jsonify
from db.database import SessionLocal
from db.crud.user import create_user, get_user
from db.models.user import User
import firebase_admin
from firebase_admin import auth

user_bp = Blueprint('user', __name__)

def get_current_firebase_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, {"error": "Authorization header missing"}, 401
    token = auth_header.split(' ')[1] if ' ' in auth_header else None
    if not token:
        return None, {"error": "Token missing from Authorization header"}, 401
    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid'], None, None
    except Exception as e:
        return None, {"error": f"Invalid token: {str(e)}"}, 401


@user_bp.route('/', methods=['POST'])
def create_user_route():
    data = request.json
    user_id_from_token, error_response, status_code = get_current_firebase_user_id()
    if error_response:
        return jsonify(error_response), status_code

    data['id'] = user_id_from_token
    db = SessionLocal()
    try:
        user = create_user(db, user_data=data)
        firestore_db = firebase_admin.firestore.client()
        user_doc_ref = firestore_db.collection('users').document(user.id)
        user_doc_ref.set({"role": "user", "email": user.name, "createdAt": firestore.SERVER_TIMESTAMP})
        return jsonify({"id": user.id, "name": user.name}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500
    finally:
        db.close()


@user_bp.route('/<user_id>', methods=['GET'])
def get_user_route(user_id):
    # For protected routes, verify token before allowing access to user_id
    verified_uid, error_response, status_code = get_current_firebase_user_id()
    if error_response:
        return jsonify(error_response), status_code

    if verified_uid != user_id:
        return jsonify({"error": "Unauthorized access to user profile"}), 403
   
    db = SessionLocal()
    user = get_user(db, user_id)
    if user:
        return jsonify({"id": user.id, "name": user.name})
    return jsonify({"error": "User not found"}), 404
