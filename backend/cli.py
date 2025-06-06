# run_sync.py
from api.routes.user import sync_from_firestore_to_postgres

# Mimic a Flask request context if needed
if __name__ == "__main__":
    response = sync_from_firestore_to_postgres()
    print(response)
