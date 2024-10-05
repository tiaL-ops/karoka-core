from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Main Page Endpoint
@app.route('/')
def main_page():
    return jsonify(message="Welcome to the Main Page")

# Tree Algorithm Page Endpoint
@app.route('/api/tree')
def tree_page():
    return jsonify(message="Tree Algorithm Page")

# 2D Graph Algorithm Page Endpoint
@app.route('/api/2dgraph')
def graph_page():
    return jsonify(message="2D Graph Algorithm Page")

# Linked List Algorithm Page Endpoint
@app.route('/api/linkedlist')
def linked_list_page():
    return jsonify(message="Linked List Algorithm Page")

if __name__ == '__main__':
    app.run(debug=True)
