from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, static_folder='static', template_folder='templates')


@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(os.path.join(app.root_path, 'static'), path)


@app.route('/api/data')
def get_data():
    return {"message": "Hello from Flask!"}


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
