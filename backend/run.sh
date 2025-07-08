#!/bin/sh

# This script ensures that if any command fails, the script will exit immediately.
set -e

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the Gunicorn server
echo "Starting Gunicorn server..."
exec gunicorn --workers 4 --bind 0.0.0.0:5001 'api.main:create_app()'