# karoka-core/backend/api/middleware/auth_middleware.py
from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth
from db.database import SessionLocal
from db.crud.user import get_user

def get_current_firebase_user_id_and_role():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, None, {"error": "Authorization header missing"}, 401
    token = auth_header.split(' ')[1] if ' ' in auth_header else None
    if not token:
        return None, None, {"error": "Token missing from Authorization header"}, 401
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        # Fetch user role from your PostgreSQL database
        db = SessionLocal()
        try:
            user_in_db = get_user(db, uid)
            if user_in_db:
                return uid, user_in_db.role, None, None
            else:
                return None, None, {"error": "User profile not found in database"}, 404
        finally:
            db.close()
    except Exception as e:
        return None, None, {"error": f"Invalid token: {str(e)}"}, 401

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        uid, role, error_response, status_code = get_current_firebase_user_id_and_role()
        if error_response:
            return jsonify(error_response), status_code
        
        if role != 'admin': 
            return jsonify({"error": "Admin access required"}), 403
        
        g.current_user_id = uid 
        g.current_user_role = role # Make role available in the request context
        return f(*args, **kwargs)
    return decorated_function

# Optional: User required decorator for general protected routes if not all need admin
def user_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        uid, role, error_response, status_code = get_current_firebase_user_id_and_role()
        if error_response:
            return jsonify(error_response), status_code
        
        g.current_user_id = uid
        g.current_user_role = role
        return f(*args, **kwargs)
    return decorated_function