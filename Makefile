# Makefile

# Variables
ENV_FILE=.env

# Start development DB
start:
	docker-compose up -d

# Stop all containers
stop:
	docker-compose down

# Run tests using test DB
test:
	ENVIRONMENT=testing pytest --cov

# Run Alembic migrations (assuming you use Alembic)
migrate:
	alembic upgrade head

# Run shell into dev DB container
psql-dev:
	docker exec -it karoka_postgres_dev psql -U karoka -d karoka_dev

# Rebuild all containers
rebuild:
	docker-compose down -v
	docker-compose up --build -d
