from database import Base, engine, SessionLocal
import models  
import argparse

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

def reset_db():
    print("Dropping tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

def wipe_data():
    print("Wiping all data...")
    session = SessionLocal()
    try:
        for table in reversed(Base.metadata.sorted_tables):
            session.execute(table.delete())
        session.commit()
        print("All data wiped.")
    finally:
        session.close()

def main():
    parser = argparse.ArgumentParser(description="Database management CLI")
    parser.add_argument("action", choices=["init", "reset", "wipe"], help="Action to perform on the database")

    args = parser.parse_args()

    if args.action == "init":
        init_db()
    elif args.action == "reset":
        reset_dp()
    elif args.action == "wipe":
        wipe_data()

if __name__ == "__main__":
    main()


