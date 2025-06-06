# Frontend Application (React + Vite)

This directory contains the source code for the Karoka user-facing web application. It is built with **React** and bundled with **Vite** for a fast development experience.

## Table of Contents
1.  [Core Responsibilities](#core-responsibilities)
2.  [Key Directories & Files](#key-directories-files)
3.  [Running in Development](#running-in-development)
4.  [Important Conventions](#important-conventions)

---

### Core Responsibilities

* Render all user interfaces (UI).
* Manage user authentication state (login, logout, signup).
* Communicate with the backend API to fetch and send data.
* Interact with Firebase services (Auth and Firestore) via the Web SDK.

---

### Key Directories & Files

* `public/`: Static assets that are copied directly to the build output.
* `src/`: The main application source code.
    * `assets/`: Images, logos, and other static files imported by components.
    * `components/`: **Reusable React components**.
        * `Auth/AuthContext.jsx`: A critical component that provides authentication state (`currentUser`, `userProfile`) and methods (`login`, `logout`) to the entire app.
        * `Navbar/Navbar.jsx`: The main navigation bar.
    * `pages/`: **Page-level components** that correspond to a specific route (e.g., `homepage.jsx`, `loginPage.jsx`).
    * `services/`: **All external communication logic lives here.** This is a crucial convention.
        * `authService.js`: Handles all Firebase Authentication logic (signup, login, etc.).
        * `userService.js`: Handles creating and fetching user profiles from Firestore and the backend.
    * `styles/`: Global and page-specific CSS files.
    * `App.jsx`: The root component where all routes are defined.
    * `firebase.js`: Initializes the Firebase app. **This is the only place Firebase should be configured.**
    * `main.jsx`: The entry point of the React application.
* `.env`: **(You must create this)** Contains environment-specific variables like Firebase keys and the backend API URL.
* `vite.config.js`: Configuration for the Vite development server and build process. Note the use of the `@` alias, which maps to `src/`.

---

### Running in Development

While `docker-compose` is the recommended way to run the whole stack, you can run the frontend standalone for UI development.

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the dev server:**
    Make sure your `apps/frontend/.env` file is created and has the correct `VITE_API_BASE_URL`.
    ```bash
    npm run dev
    ```
    The app will be available at [http://localhost:3000](http://localhost:3000) (or the port defined in your `.env` file).

---

### Important Conventions

To keep the frontend clean, scalable, and easy to debug, please follow these rules:

1.  **Service Abstraction: The Golden Rule**
    * **NEVER** call Firebase or `fetch` directly from a React component (`.jsx` file).
    * All external API calls (to our backend or to Firebase) **MUST** be placed in a function within the `src/services/` directory.
    * This keeps our components clean and focused on UI, and makes it easy to find and modify data logic.

2.  **Authentication State**
    * To get the current user's information, use the `useAuth()` hook provided by `AuthContext.jsx`.
    * **Example**: `const { currentUser, userProfile } = useAuth();`
    * This gives you both the Firebase Auth user (`currentUser`) and their corresponding Firestore profile (`userProfile`).

3.  **Protected Routes**
    * The `App.jsx` file uses a `<PrivateRoute>` component to protect routes that require authentication or specific roles.
    * To protect a new page, wrap it in this component and provide the allowed roles.
    * **Example**:
        ```jsx
        <PrivateRoute allowedRoles={['admin', 'tester']}>
          <MyProtectedPage />
        </PrivateRoute>
        ```

4.  **Path Aliases**
    * Use the `@/` alias for imports from the `src/` directory to avoid long relative paths (`../../`).
    * **Do**: `import LoginPage from '@/pages/loginPage';`
    * **Don't**: `import LoginPage from '../pages/loginPage';`