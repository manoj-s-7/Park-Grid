from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

from routes.dashboard import bp as dashboard_bp
from routes.sessions  import bp as sessions_bp
from routes.vehicles  import bp as vehicles_bp
from routes.parking   import bp as parking_bp
from routes.auth      import bp as auth_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(dashboard_bp)
app.register_blueprint(sessions_bp)
app.register_blueprint(vehicles_bp)
app.register_blueprint(parking_bp)
app.register_blueprint(auth_bp)


@app.get("/")
def health():
    return jsonify({"status": "ok", "service": "Parking Management System API"})


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
