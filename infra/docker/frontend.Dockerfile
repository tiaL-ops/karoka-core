# infra/docker/frontend.Dockerfile
FROM node:20

WORKDIR /app

# Copy package files first to leverage Docker caching.
# The wildcard copies package-lock.json if it exists, 
COPY apps/frontend/package.json apps/frontend/package-lock.json* ./

# Install dependencies inside the container. This creates a /app/node_modules
# directory with binaries compiled for the container's Linux environment.
RUN npm install

# Now, copy the rest of the application source code into the container.
# Thanks to the .dockerignore file, this step will NOT copy your local node_modules.
COPY apps/frontend/ ./

# Expose the port Vite uses for the dev server
EXPOSE 3000

# The command to start the Vite development server
CMD ["npm", "run", "dev"]