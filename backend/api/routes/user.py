# api/routes/user.py
from flask import Blueprint, request, jsonify
from db.database import SessionLocal
from db.crud.user import create_user, get_user,list_users, update_user,delete_user
from db.models.user import User
import firebase_admin
from firebase_admin import auth, firestore # Import firestore to use firestore.SERVER_TIMESTAMP

user_bp = Blueprint('user', __name__)
import logging
logger = logging.getLogger(__name__)


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
    print('🙄ALl data is ', data)
 
    if data['name'] == None:
        data['name'] = "Anonymous" 

    data['role'] = data.get('role', 'user') 


    db = SessionLocal()
    try:
        user = create_user(db, user_data=data) 
        
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
        user_in_pg = get_user(db, user_id) # Get user from PostgreSQL
        
        firestore_db = firebase_admin.firestore.client()
        user_doc_ref = firestore_db.collection('users').document(user_id)
        firestore_doc = user_doc_ref.get() # Get user from Firestore

        if firestore_doc.exists:
            firestore_data = firestore_doc.to_dict()
            firestore_role = firestore_data.get('role', 'user')
            
            # Sync Firestore role to PostgreSQL 
            if user_in_pg and user_in_pg.role != firestore_role:
                print(f"Role mismatch for {user_id}: PG='{user_in_pg.role}', FS='{firestore_role}'. Updating PG.")
                updated_user_pg = update_user(db, user_id, {"role": firestore_role})
                # Use the updated user object for the response
                user_in_pg = updated_user_pg
            elif not user_in_pg:
                # If user exists in Firestore but not in PostgreSQL, create them in PG
                # This handles cases where only Firestore entry was created for some reason
                print(f"User {user_id} found in Firestore but not in PG. Creating PG entry.")
                pg_user_data = {
                    "id": user_id,
                    "name": firestore_data.get('displayName') or firestore_data.get('email') or "New User",
                    "role": firestore_role # Use Firestore role for new PG user
                }
                user_in_pg = create_user(db, user_data=pg_user_data)
                
        # Return user data from PostgreSQL (which has now been synced if needed)
        if user_in_pg:
            return jsonify({"id": user_in_pg.id, "name": user_in_pg.name, "role": user_in_pg.role}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching or syncing user data: {e}")
        return jsonify({"error": f"Failed to retrieve user data: {str(e)}"}), 500
    finally:
        db.close()

@user_bp.route('/sync', methods=['POST'])
def sync_from_firestore_to_postgres():
    print(" 🤨Starting user sync from Firestore to PostgreSQL")
    """
    POST /user/sync
    Sync all users from Firestore → PostgreSQL.
    Also delete any Postgres user not present in Firestore.
    """
    firestore_db = firebase_admin.firestore.client()
    users_collection = firestore_db.collection('users')

    db = SessionLocal()
    try:
        # 1. Fetch all Firestore UIDs into a Python set.
        firestore_uids = set()
        for doc in users_collection.stream():
            firestore_uids.add(doc.id)

        # 2. Sync Firestore → Postgres
        for uid in firestore_uids:
            doc = users_collection.document(uid).get()
            if not doc.exists:
                continue

            user_data = doc.to_dict()
            pg_user = get_user(db, uid)

            # If not in PG, create
            if not pg_user:
                pg_user_data = {
                    "id": uid,
                    "name": user_data.get('displayName')
                             or user_data.get('email')
                             or "New User",
                    "role": user_data.get('role', 'user')
                }
                create_user(db, user_data=pg_user_data)

            # If exists in PG, update fields
            else:
                updates = {
                    "name": user_data.get('displayName'),
                    "role": user_data.get('role', 'user')
                }
                update_user(db, uid, updates)

        # 3. Fetch all Postgres users, then delete any not in Firestore
        pg_users = list_users(db)  # returns a list of User objects
        for pg_user in pg_users:
            if pg_user.id not in firestore_uids:
                delete_user(db, pg_user.id)

        return jsonify({"message": "Sync completed successfully"}), 200

    except Exception as e:
        logger.error(f"Error syncing users from Firestore to PostgreSQL: {e}")
        return jsonify({"error": f"Failed to sync users: {str(e)}"}), 500

    finally:
        db.close()