# -------------------------------------------------------------------------------------------------
# frontend.Dockerfile
# -------------------------------------------------------------------------------------------------
FROM node:20

WORKDIR /app

# 1) Copy only package.json (do NOT copy package-lock.json or node_modules)
COPY apps/frontend/package.json ./

# 2) Ensure devDependencies (Vite, Rollup) are installed
ENV NODE_ENV=development

# 3) Run npm install inside container → generates a fresh package-lock.json / node_modules for this arch
RUN npm install

# 4) Copy the rest of the frontend source code
COPY apps/frontend .

# 5) Expose Vite’s default dev port (5173). but my port is 300-
EXPOSE 3000

# 6) Start Vite in dev‐mode
CMD ["npm", "run", "dev"]
