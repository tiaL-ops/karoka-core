# Makefile

# Variables
ENV_FILE=.env
# Service name for the backend container from your docker-compose.yml
BACKEND_SERVICE=backend

# Start normally
start:
	docker compose up

# Start clean (rebuild images, reset volumes, and run migrations)
clean-start:
	docker compose down -v
	docker compose up --build -d
	@echo "Waiting for database to be ready..."
	@sleep 10
	make migrate

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
	make build
	make up

# Run tests inside the Docker container
.PHONY: test
test:
	docker compose exec $(BACKEND_SERVICE) pytest backend/db/tests

# Run Alembic migrations inside the Docker container
migrate:
	docker compose run --rm backend \
  alembic -c alembic.ini upgrade head

# Create a new Alembic migration inside the Docker container (usage: make makemigration msg="your message")
makemigration:
	docker compose exec $(BACKEND_SERVICE) alembic -c backend/alembic.ini revision --autogenerate -m "$(msg)"

# Trigger the Firestore to Postgres sync via curl
sync:

	curl -X POST http://localhost:5001/api/user/sync

# Shell into dev DB container
psql-dev:
	docker exec -it karoka_postgres_dev psql -U karoka -d karoka_dev



