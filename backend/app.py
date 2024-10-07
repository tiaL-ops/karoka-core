from flask import Flask, render_template, send_from_directory
import os

# Set static_folder to 'static' to serve React build files
app = Flask(__name__, static_folder='static', template_folder='static')

# Serve React static files (JavaScript, CSS, etc.)
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(os.path.join(app.root_path, 'static'), path)

# Example API route
@app.route('/api/data')
def get_data():
    return {"message": "Hello from Flask!"}

# Catch all routes and serve the React frontend (index.html)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        # If the file exists in static folder, serve it (e.g., static CSS, JS, etc.)
        return send_from_directory(app.static_folder, path)
    else:
        # Otherwise, return the index.html file for React to handle the route
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
