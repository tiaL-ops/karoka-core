
# Karoka DB – How It All Works

This part of the Karoka project is where we define, store, and manage all our game data. Everything related to users, game sessions, challenges, logs, hints, templates, and documentation is handled here. We use Python, SQLAlchemy (ORM), and PostgreSQL to make it all work smoothly.

We start by defining models. These are like Python classes that map directly to database tables. For example, we have a `User` model that stores player info like name, age, and VARK learning style scores. Each user can have multiple game sessions, which we track in the `GameSession` model. A game session stores details like when the session started and ended, what arena was played, how many hints were used, and the final score. This model connects back to the user so we know who played the session.

Then we have the `Challenge` model, which represents puzzles or tasks in the game. Every challenge has data like a name, description, expected solution, and difficulty level. Some challenges are linked to hints — small pieces of help the user can request — which are stored in the `Hint` model. The hints are connected to challenges so that when we delete a challenge, we can optionally clean up its hints too.

Users get assessed as they play, and those assessments are stored in the `Assessment` model. These track how a user performed on a particular challenge during a specific game session. Each assessment ties together a user, a session, and a challenge. We also track everything users do — all their clicks, opens, and interactions — in the `LogEvent` model. This helps with analytics and debugging.

For AI-driven help, we have a `LLMTemplate` model. This stores the templates used to prompt AI systems. When a user interacts with an AI-based assistant in the game, we save what was said and how the AI responded in the `LLMContentHistory` model. That way, we have a full record of how AI was used during the session. On top of that, we also have `DocumentationTopic`, which stores help articles or guides the user can read. These might be linked to learning topics or support features, and they can also use AI templates.

Each of these models has matching CRUD logic — that just means we can easily create, read, update, or delete records from the database using clean Python functions. For example, in the `user` CRUD file, we can add a new user, get one by ID, update their profile, or remove them. In the `game_session` CRUD file, we can create new sessions, update scores, list sessions by user, or clean up old data. Each model has its own file where all these functions are grouped and tested.

We test everything with `pytest`. Each model has a test file that checks the CRUD functions work properly. For example, we test creating a challenge, updating its difficulty level, deleting it, and checking that it's gone. The tests also check how things relate: if we create a user and then a game session for them, we make sure the session is tied correctly to that user.

To run the database, we use Docker with PostgreSQL. This means you don’t need to install Postgres directly on your machine — just run a Docker command, and the database starts in a container. It's fast, clean, and isolated from your main system. We use port 5433 so it doesn't conflict with anything else. You can connect to the DB using `psql` or a database GUI if you like. If the database is empty at first, you can create all the tables by running a single script that loads all the models and calls `Base.metadata.create_all()`.

The whole idea here is to keep things clean and separate. Models define the shape of data, CRUD files control access and changes to that data, tests prove it's working, and Docker gives us a reliable database to run it all.

---

## How to Run Everything

First, make sure Docker is running on your machine.

1. Start the Postgres container:

   ```bash
   docker run --name karoka-postgres \
     -e POSTGRES_USER=karoka \
     -e POSTGRES_PASSWORD=karoka \
     -e POSTGRES_DB=karoka_test \
     -p 5433:5432 \
     -v karoka_pgdata:/var/lib/postgresql/data \
     -d postgres
   ````

2. (Optional) Connect to the DB manually if you want to inspect it:

   ```bash
   psql -h localhost -p 5433 -U karoka -d karoka_test
   ```

3. Make sure your `.env` or config uses `localhost:5433` and the correct credentials.

4. Set up a virtual environment and install dependencies:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

5. To initialize the schema, run the script that loads your models and creates tables:

   ```bash
   python scripts/init_db.py  # This script should import Base and call create_all()
   ```

6. To run tests:

   ```bash
   pytest --cov=crud
   ```

Now you're fully set up — with a local DB in Docker, your Python code connected to it, and tests to make sure it's all working.

```

-