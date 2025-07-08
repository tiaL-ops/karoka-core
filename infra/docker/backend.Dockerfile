FROM python:3.11-slim

# Set workdir inside container
WORKDIR /app/backend

# Copy and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend .

# Make the startup script executable
RUN chmod +x ./run.sh

# Document the port (actual publish via docker-compose or platform)
EXPOSE 5001

# Default port; can be overridden by env at runtime
ENV PORT=5001

# Use shell form so ${PORT} is expanded at container start.
# Use module-level app: api.main:app
CMD sh -c "gunicorn -w 4 -b 0.0.0.0:${PORT} api.main:app"
