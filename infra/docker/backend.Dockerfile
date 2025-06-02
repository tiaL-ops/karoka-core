FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy the full backend app
COPY backend /app/backend

WORKDIR /app/backend
CMD ["python", "-m", "api.main"]
