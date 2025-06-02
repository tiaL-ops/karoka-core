# api/routes/user.py
from flask import Blueprint, request, jsonify
from db.database import SessionLocal
from db.crud.user import create_user, get_user
from db.models.user import User

user_bp = Blueprint('user', __name__)

@user_bp.route('/user', methods=['POST'])
def create_user_route():
    data = request.json
    db = SessionLocal()
    user = create_user(db, user_data=data)
    return jsonify({"id": user.id, "name": user.name})

@user_bp.route('/user/<user_id>', methods=['GET'])
def get_user_route(user_id):
    db = SessionLocal()
    user = get_user(db, user_id)
    if user:
        return jsonify({"id": user.id, "name": user.name})
    return jsonify({"error": "User not found"}), 404
