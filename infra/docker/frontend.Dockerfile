# infra/docker/frontend.Dockerfile
# This file is designed to work with the docker-compose.yml where the
# entire project context is mounted at /app.

FROM node:20-alpine

# Set the working directory for the frontend application inside the container.
# All subsequent commands (COPY, RUN, etc.) will be relative to this path.
WORKDIR /app/apps/frontend

# Copy the dependency manifest files.
# By copying these first and running install, Docker can cache the installed
# node_modules layer and will only re-run it if package.json or package-lock.json changes.
COPY ./apps/frontend/package.json ./
COPY ./apps/frontend/package-lock.json* ./

# Install project dependencies. This will create the node_modules directory
# inside /app/apps/frontend, which is what we need.
# This installs both dependencies and devDependencies by default.
RUN npm install

# The command to run the application is specified in docker-compose.yml,
# so we don't need a CMD here. Exposing the port is good practice.
EXPOSE 3000
