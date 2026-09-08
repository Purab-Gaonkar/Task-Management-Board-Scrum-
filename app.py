import os
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from config import config
from routes.tasks import init_tasks_routes

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Connect to MongoDB with retry resilience
print(f"Connecting to MongoDB at: {config.MONGO_HOST}:{config.MONGO_PORT} (DB: {config.MONGO_DB})")
mongo_client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=5000)
db = mongo_client[config.MONGO_DB]

# Register routes blueprint
tasks_bp = init_tasks_routes(db)
app.register_blueprint(tasks_bp, url_prefix="/api")

@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "service": "Scrum Board Task Service",
        "language": "Python 3.12 (Flask)",
        "database": "MongoDB 7",
        "status": "RUNNING"
    }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT, debug=False)
