# Karoka: The Game-Based Learning Platform

Welcome to Karoka! We're building a platform that makes learning to code fun, accessible, and personalized through game-based mechanics and AI-driven content.

## Table of Contents
1.  [Tech Stack](#tech-stack)
2.  [Project Structure](#project-structure)
3.  [Getting Started](#getting-started)
4.  [Running the Application](#running-the-application)
5.  [Key Workflows](#key-workflows)

---

### Tech Stack

The Karoka platform is built with a modern, decoupled architecture:

* **Frontend**: A responsive web app built with **React** and **Vite**. It uses the **Firebase Web SDK** for authentication and direct interaction with some Firebase services.
* **Backend**: A **Flask (Python)** API that serves as the core business logic layer.
* **Database**: A **PostgreSQL** database managed by **SQLAlchemy** (ORM) and **Alembic** (for migrations).
* **Infrastructure**: The entire stack is containerized with **Docker** for consistent development and deployment.
* **Cloud Services**: **Firebase** is used for:
    * **Authentication**: Manages user sign-up, login, and sessions.
    * **Firestore**: A NoSQL database for storing user profile data that the frontend needs quick access to.

---

### Project Structure

The codebase is organized into three main directories:

* `kcopy/` (Root)
    * `docker-compose.yml`: The master file for running all services (frontend, backend, db) together.
    * `apps/frontend/`: The React frontend application.
    * `backend/`: The Flask backend API and database logic.
    * `infra/`: Configuration files for cloud infrastructure, like Firebase.

---

### Getting Started

Before you begin, make sure you have the following installed:
* [Docker](https://www.docker.com/products/docker-desktop/)
* [Node.js](https://nodejs.org/) (for dependency management if you need to run the frontend locally)
* [Python](https://www.python.org/) (for dependency management if you need to run the backend locally)

**Step 1: Firebase Project Setup**
You need access to the project's Firebase console. A detailed guide for setting up a new environment from scratch is in `infra/firebase/README.md`.

**Step 2: Environment Variables (`.env` files)**
You need to create two `.env` files. Contact a team member for the required values.

1.  **Backend Env File:**
    * Create a file at: `backend/.env`
    * This file contains the `DATABASE_URL` and the path to the Firebase Admin SDK credentials.

2.  **Frontend Env File:**
    * Create a file at: `apps/frontend/.env`
    * This file contains all the `VITE_` variables, including the Firebase web configuration and the backend API URL.

---

### Running the Application

The easiest way to run the entire project is with Docker.

1.  **Start all services:**
    From the root `kcopy/` directory, run:
    ```bash
    docker-compose up --build
    ```
    * `--build` ensures that any changes to your Dockerfiles or dependencies are included.
    * Add `-d` to run the containers in the background.

    * `docker-compose exec backend sh -c "cd /app/backend && alembic upgrade head" ` if you want to upgdare database after cleaning  


2.  **Access the Services:**
    * **Frontend**: [http://localhost:3000](http://localhost:3000)
    * **Backend API**: [http://localhost:5001](http://localhost:5001)

3.  **Stopping the services:**
    ```bash
    docker-compose down
    ```

---

### Key Workflows

**User Signup Flow:**
1.  A user signs up on the **Frontend** using the Email/Password or Google provider.
2.  The frontend communicates directly with **Firebase Auth** to create the user account.
3.  Upon successful creation, the frontend makes a call to the **Backend API**, sending the user's Firebase ID Token.
4.  The Backend API **verifies the token**, creates a corresponding user record in the **PostgreSQL** database, and creates a user profile document in **Firestore**.

This ensures we have a secure, dual-record system: Firebase for auth and quick-access data, and PostgreSQL for robust, relational data.


docker-compose up --build
#safety check



