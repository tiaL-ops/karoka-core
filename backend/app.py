from flask import Flask, send_from_directory
import os

# Set static_folder to point to the React build folder
app = Flask(__name__, static_folder='static/build', template_folder='static/build')

# Serve static files (JavaScript, CSS, etc.)
@app.route('/static/<path:path>')
def serve_static(path):
    # Ensure static files are served from the correct subdirectory
    return send_from_directory(os.path.join(app.static_folder, 'static'), path)

# Example API route
@app.route('/api/data')
def get_data():
    return {"message": "Hello from Flask!"}

# Serve React's index.html for all undefined routes (Catch-all route)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
