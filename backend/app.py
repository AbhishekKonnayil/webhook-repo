from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timezone
from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv
import ssl

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv("FRONTEND_URL", "*"))

# MongoDB connection
client = MongoClient(
    os.getenv("MONGODB_URL"),
    tls=True,
    tlsCAFile=certifi.where(),
    tlsAllowInvalidCertificates=False,
)
db = client.github_events
collection = db.events

# Webhook route
@app.route('/webhook', methods=['POST'])
def handle_webhook():
    if not request.json:
        return jsonify({"error": "invalid payload"}), 400

    data = request.json
    event_type = request.headers.get('X-GitHub-Event')

    event_doc = None

    if event_type == "push":
        event_doc = {
            "request_id": data.get('after'),
            "author": data.get('pusher', {}).get('name'),
            "action": "PUSH",
            "from_branch": None,
            "to_branch": data.get('ref', '').split('/')[-1],
            "timestamp": datetime.now(timezone.utc)
        }

    elif event_type == "pull_request":
        pr_data = data.get('pull_request', {})
        is_merged = data.get('action') == 'closed' and pr_data.get('merged')
        event_doc = {
            "request_id": str(pr_data.get('id')),
            "author": pr_data.get('user', {}).get('login'),
            "action": "MERGE" if is_merged else "PULL_REQUEST",
            "from_branch": pr_data.get('head', {}).get('ref'),
            "to_branch": pr_data.get('base', {}).get('ref'),
            "timestamp": datetime.now(timezone.utc)
        }

    if event_doc:
        collection.insert_one(event_doc)
        return jsonify({"status": "success"}), 200

    return jsonify({"status": "ignored"}), 200

# Route to fetch events for frontend
@app.route('/events', methods=['GET'])
def get_events():
    events = list(collection.find().sort("timestamp", -1))
    for event in events:
        event['_id'] = str(event['_id'])
    return jsonify(events)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)