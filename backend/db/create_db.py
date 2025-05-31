from database import Base, engine
import models  # Ensures models are loaded

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    init_db()
