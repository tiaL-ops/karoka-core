# Makefile

# Variables
ENV_FILE=.env

# Start (Rebuild and run everything in detached mode)
start:
	docker-compose down -v
	docker-compose up --build -d

# Stop all containers
stop:
	docker-compose down

# Run tests using test DB and docker if not starting
.PHONY: test
test:
	cd backend/db && source ../.venv/bin/activate && pytest

# Run Alembic migrations
migrate:
	alembic upgrade head

# Create a new Alembic migration (usage: make makemigration msg="my message")
makemigration:
	alembic revision --autogenerate -m "$(msg)"

# Run shell into dev DB container
psql-dev:
	docker exec -it karoka_postgres_dev psql -U karoka -d karoka_dev

# Rebuild all containers (alias of start)
rebuild: start
