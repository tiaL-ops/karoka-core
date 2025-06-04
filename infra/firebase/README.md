
### Karoka Project Setup Checklist

This checklist guides you through setting up the frontend, backend, and database with Firebase/Firestore integration.

#### 1. Firebase Project Setup (Google Cloud Console & Firebase Console)

Before running the application, you need to set up a Firebase project and enable necessary services.

* **Create a Firebase Project:**
    * Go to the [Firebase Console](https://console.firebase.google.com/).
    * Click "Add project" and follow the prompts.
* **Enable Firestore Database:**
    * In your Firebase project, navigate to "Firestore Database" from the left menu.
    * Click "Create database" and choose "Start in production mode" (you can add security rules later). Select a region.
* **Enable Firebase Authentication:**
    * In your Firebase project, navigate to "Authentication" from the left menu.
    * Go to the "Sign-in method" tab.
    * Enable "Email/Password" and "Google" as providers to match your `LoginPage.jsx`.
* **Create a Web App in Firebase:**
    * In your Firebase project overview, click the "</>" icon to add a web app.
    * Register your app and copy the `firebaseConfig` object. This information is needed for your frontend `.env` file.
* **Create a Service Account for Backend (Firebase Admin SDK):**
    * In your Firebase project, go to "Project settings" (the gear icon).
    * Navigate to "Service accounts".
    * Click "Generate new private key" and download the JSON file. **Keep this file secure and do not commit it to version control.** This file is essential for your backend to interact with Firebase services securely.

#### 2. Environment Variables (`.env` Files)

You'll need separate `.env` files for the frontend and backend to manage configuration.

* **`backend/.env`:**
    * Create a file named `.env` in your `backend/` directory.
    * **Content:**
        ```
        ENVIRONMENT=development
        DATABASE_URL_DEV="postgresql://karoka:karoka@localhost:5433/karoka_dev"
        # Add a placeholder for Firebase Admin SDK private key path (e.g., FIREBASE_ADMIN_SDK_PATH=/app/backend/karoka-firebase-admin.json)
        # You'll mount the actual JSON file into the Docker container.
        ```
    * **Placement:** `kcopy/backend/.env`
* **`apps/frontend/.env`:**
    * Create a file named `.env` in your `apps/frontend/` directory.
    * **Content:**
        ```
        VITE_API_BASE_URL=http://localhost:5001/api # Or your backend API URL
        VITE_PORT=3000
        VITE_ENV_NAME=development
        VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
        VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
        VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
        VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
        VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
        VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
        ```
    * **Placement:** `kcopy/apps/frontend/.env`

#### 3. Docker & Database Setup

Your project uses Docker to manage the PostgreSQL database and run the backend/frontend services.

* **Verify `docker-compose.yml`:**
    * Ensure the `db` service in `kcopy/docker-compose.yml` matches your PostgreSQL credentials and port (default: `5433:5432`).
    * Ensure the `backend` service correctly points to the `DATABASE_URL` for the `db` service (`postgresql://karoka:karoka@db:5432/karoka_dev`).
    * Make sure your backend's `volumes` section includes a way to mount your Firebase Admin SDK JSON file into the container (e.g., `- ./path/to/your-firebase-admin-sdk.json:/app/backend/karoka-firebase-admin.json`).
* **Start Docker Containers:**
    * Open your terminal in the root directory of your project (`karoka-core/`).
    * Run: `docker compose up --build -d` (or `make start` if your `Makefile` includes this command).

#### 4. Backend (Flask API) Setup

The backend needs the Firebase Admin SDK to interact with Firebase services securely.

* **Install Firebase Admin SDK:**
    * Add `firebase-admin` to your `backend/requirements.txt`.
    * Rebuild your backend Docker image or install within the container: `pip install firebase-admin`.
* **Initialize Firebase Admin SDK in Backend:**
    * **Modify `kcopy/backend/api/main.py`:**
        ```python
        # backend/api/main.py
        import db.models
        from flask import Flask
        from flask_cors import CORS
        from api.routes.ping import ping_bp
        from api.routes.user import user_bp

        from dotenv import load_dotenv
        import os
        import firebase_admin # New import
        from firebase_admin import credentials # New import
        from firebase_admin import auth, firestore # New imports for services

        load_dotenv()

        def create_app():
            app = Flask(__name__)

            cors_origin = os.getenv("CORS_ORIGIN", "*")
            CORS(app) # You have CORS(app) already

            # --- Firebase Admin SDK Initialization ---
            # Path to your service account key JSON file inside the Docker container
            firebase_admin_sdk_path = os.getenv("FIREBASE_ADMIN_SDK_PATH", None)
            if firebase_admin_sdk_path and os.path.exists(firebase_admin_sdk_path):
                cred = credentials.Certificate(firebase_admin_sdk_path)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized successfully.")
            else:
                print("WARNING: Firebase Admin SDK not initialized. Check FIREBASE_ADMIN_SDK_PATH and file existence.")
            # --- End Firebase Admin SDK Initialization ---

            app.register_blueprint(ping_bp, url_prefix="/api/ping")
            app.register_blueprint(user_bp, url_prefix='/api/user')

            return app

        if __name__ == "__main__":
            app = create_app()
            app.run(debug=True,host='0.0.0.0', port=5001)
        ```
        This ensures the backend can verify Firebase ID tokens and interact with Firestore.
* **Implement ID Token Verification (Backend):**
    * **Modify `kcopy/backend/api/routes/user.py`** (or create a new middleware) to verify Firebase ID tokens sent from the frontend for protected routes. This will provide the `user_id` (Firebase UID).
        ```python
        # api/routes/user.py
        from flask import Blueprint, request, jsonify
        from db.database import SessionLocal
        from db.crud.user import create_user, get_user
        from db.models.user import User
        import firebase_admin # New import
        from firebase_admin import auth # New import

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
            # In a real app, user creation would likely be tied to Firebase Auth registration
            # and you'd use the verified Firebase UID as the user.id
            data = request.json
            user_id_from_token, error_response, status_code = get_current_firebase_user_id()
            if error_response:
                return jsonify(error_response), status_code

            data['id'] = user_id_from_token # Use Firebase UID as the user ID

            db = SessionLocal()
            try:
                user = create_user(db, user_data=data)
                # Optional: Create/update Firestore user document
                # firestore_db = firebase_admin.firestore.client()
                # user_doc_ref = firestore_db.collection('users').document(user.id)
                # user_doc_ref.set({"role": "user", "email": user.name, "createdAt": firestore.SERVER_TIMESTAMP})
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

            # Ensure the requested user_id matches the authenticated user's UID
            if verified_uid != user_id:
                return jsonify({"error": "Unauthorized access to user profile"}), 403

            db = SessionLocal()
            user = get_user(db, user_id)
            if user:
                return jsonify({"id": user.id, "name": user.name})
            return jsonify({"error": "User not found"}), 404
        ```
* **Firestore Interaction from Backend (Optional but Recommended):**
    * If your backend needs to write to Firestore (e.g., to update `currentProgress` or `sessionId` in `/users/{uid}` or to manage `/sessions/{sessionId}`), you can get a Firestore client after initializing the Admin SDK:
        ```python
        # Example in a backend route or service
        from firebase_admin import firestore

        firestore_db = firestore.client()
        # To update a user's session ID in Firestore:
        # user_doc_ref = firestore_db.collection('users').document(firebase_uid)
        # user_doc_ref.update({"sessionId": "new_session_id"})
        ```

#### 5. Frontend (React) Setup

The frontend is mostly set up, but you need to ensure proper `.env` configuration and potential API call adjustments.

* **Verify `firebase.js`:** This file is already good to go for initializing Firebase on the client-side using environment variables.
* **Review `AuthManager.jsx`:** The `AuthManager.jsx` correctly fetches user profiles from `users/{uid}` in Firestore after authentication. Ensure that when users register or log in for the first time, a basic user document is created in Firestore if it doesn't exist, as `AuthManager` handles the "no user profile found" case.
* **Update Frontend API Calls:**
    * For routes that require authentication, modify your frontend API calls (e.g., in `userProfile.jsx`) to include the Firebase ID token in the `Authorization` header.
    * **Modify `kcopy/apps/frontend/src/pages/userProfile.jsx`:**
        ```javascript
        import { useState, useEffect } from "react";
        import { useAuth } from "../components/Auth/AuthManager"; // Import useAuth

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        export default function UserProfile() {
          const [user, setUser] = useState(null);
          const { currentUser, loading } = useAuth(); // Get currentUser and loading from AuthContext

          useEffect(() => {
            const fetchUserProfile = async () => {
              if (loading) return; // Don't fetch if authentication is still loading
              if (!currentUser) {
                console.log("No current user, cannot fetch profile from backend.");
                return;
              }

              try {
                const token = await currentUser.getIdToken(); // Get Firebase ID token
                const res = await fetch(`${API_BASE_URL}/user/${currentUser.uid}`, { // Use currentUser.uid
                  headers: {
                    'Authorization': `Bearer ${token}` // Add Authorization header
                  }
                });
                if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setUser(data);
              } catch (err) {
                console.error("Error loading user:", err);
                setUser(null); // Clear user on error
              }
            };

            fetchUserProfile();
          }, [currentUser, loading]); // Re-run effect when currentUser or loading changes

          if (loading) return <p>Loading authentication...</p>;
          if (!currentUser) return <p>Please log in to view profile.</p>;
          if (!user) return <p>Loading user data...</p>;

          return (
            <div>
              <h2>User Profile</h2>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
            </div>
          );
        }
        ```
        This ensures that authenticated requests send the necessary token to the backend for verification.

#### 6. Firestore Rules & Indexes

* **Firestore Rules (`infra/firebase/firestore.rules`):**
    * You need to define security rules in your Firebase project to control access to your Firestore data.
    * **Content (Example Basic Rules):**
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow authenticated users to read and write their own user data
            match /users/{userId} {
              allow read, write: if request.auth.uid == userId;
            }

            // Allow authenticated users to read their own sessions
            match /sessions/{sessionId} {
              allow read: if request.auth.uid != null && request.resource.data.userId == request.auth.uid;
              allow write: if false; // Sessions should primarily be written by backend or specific triggers
            }

            // Public read for roles/permissions (read-only for all authenticated users)
            match /roles/{roleId} {
              allow read: if request.auth.uid != null;
              allow write: if false; // Only admin via backend should manage roles
            }

            // Permissions for specific UIDs (read-only by owner)
            match /permissions/{userId} {
              allow read: if request.auth.uid == userId;
              allow write: if request.auth.uid == userId;
            }

            // Controlled users for experiments (read-only by authenticated users, write by backend/admin)
            match /experiments/{experimentId}/controlledUsers/{anonUserId} {
              allow read: if request.auth.uid != null;
              allow write: if false; // Should be written by backend/admin tools
            }

            // Default: deny all unlisted collections
            match /{document=**} {
              allow read, write: if false;
            }
          }
        }
        ```
    * **Placement:** `kcopy/infra/firebase/firestore.rules`
    * **Deployment:** Deploy these rules from your Firebase project directory using `firebase deploy --only firestore.rules`.
* **Firestore Indexes (`infra/firebase/firestore.indexes.json`):**
    * You might need to define indexes for complex queries (e.g., ordering or filtering on multiple fields) in Firestore.
    * **Content:** Your provided `firestore.indexes.json` is currently empty (`"indexes": [], "fieldOverrides": []`), which is fine for basic operations, but you'll add custom indexes here as your application grows.
    * **Deployment:** Deploy these indexes from your Firebase project directory using `firebase deploy --only firestore.indexes`.

#### 7. Running the Application

Once all the above steps are completed and configured:

* **Start All Services (from `karoka-core/`):**
    ```bash
    docker compose up --build -d
    ```
* **Access Frontend:**
    * The frontend should be accessible at `http://localhost:3000` (or the port specified in `apps/frontend/.env`).
* **Access Backend API:**
    * The backend API should be accessible at `http://localhost:5001/api/` (as configured in `docker-compose.yml`). You can test the ping endpoint: `http://localhost:5001/api/ping`.
