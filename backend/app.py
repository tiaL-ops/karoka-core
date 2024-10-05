from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables CORS for the entire application

@app.route('/api')
def home():
    return jsonify(message="Hello from Flask!")

if __name__ == '__main__':
    app.run(debug=True)
