# Variables
ENV_FILE=.env

# Start normally
start:
	docker compose up

# Start clean (rebuild images, reset volumes)
clean-start:
	docker compose down -v
	docker compose up --build -d
	cd backend && alembic upgrade head


# Build containers without using cache
build:
	docker compose build --no-cache

# Bring containers up (after build)
up:
	docker compose up -d

# Stop and remove containers
stop:
	docker compose down

# Rebuild everything cleanly
rebuild:
	docker compose down -v
	docker compose build --no-cache
	docker compose up -d

# Run tests (make sure venv is activated)
.PHONY: test
test:
	cd backend/db && source ../.venv/bin/activate && pytest

# Run Alembic migrations
migrate:
	cd backend alembic upgrade head

# Create a new Alembic migration (usage: make makemigration msg="my message")
makemigration:
	alembic revision --autogenerate -m "$(msg)"

# Shell into dev DB container
psql-dev:
	docker exec -it karoka_postgres_dev psql -U karoka -d karoka_dev