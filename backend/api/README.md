
### Backend `/api` for Karoka

The `/api` folder uses **Flask** to connect the frontend (React/Vite) to backend services.

* Routes are organized with **Blueprints** (e.g. `ping_bp`).

* Example:

  ```python
  app.register_blueprint(ping_bp, url_prefix="/api/ping")
  ```

  This exposes: `GET /api/ping/ → ping() → returns {"message": "pong"}`

* In development, **CORS** is enabled so the frontend can access the API.

CORS ORIGIN: Understand how it works . Cors origin allowed right now is port 3000
Please note the env production need confirmation of the site where the app gonna be deployed. 
