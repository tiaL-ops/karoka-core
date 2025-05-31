

# Frontend Setup – Day 1 Update (30 May 2025)

This document outlines the initial setup and structure of the frontend project using [Vite](https://vitejs.dev/).

## ✅ What's Done Today

### 🔧 Vite Project Initialization

* Initialized the frontend using **Vite** for fast and modern development.
* Configuration is handled via `vite.config.js`.
* Environment variables are managed through `.env` files:

  * `.env` – for development
  * `.env.test` – for test environments
  * `.env.prod` – for production

You can switch between environments by using the corresponding `.env` file when building or running the project.

### Project Structure

Here's the current directory structure:

```
├── README.md
├── index.html
├── node_modules/
├── package.json
├── public/
├── src/
│   ├── App.jsx           # Root React component
│   ├── components/       # Reusable UI components
│   ├── config/           # Configuration files
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── main.jsx          # Entry point, renders <App />
│   ├── pages/            # Page-level components
│   └── phaser/           # Game-related logic (e.g., Phaser.js)
└── vite.config.js        # Vite configuration
```

### 🚀 Entry Point

* `index.html`: Contains the script tag that loads the main entry point.
* `src/main.jsx`: This is the root script that initializes the React app and renders `<App />` from `App.jsx`.

### ▶️ How to Run

To start the development server:

```bash
npm run dev
```

This will start the Vite dev server with hot module reload (HMR) enabled.


