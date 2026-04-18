import logging

from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import PyMongoError

from api.config import MONGO_DB, MONGO_URI
from api.routes.games import games_bp

logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)
    CORS(app)

    # MongoDB connection
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    app.config["db"] = client[MONGO_DB]
    app.config["mongo_client"] = client

    # Register blueprints
    app.register_blueprint(games_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        try:
            app.config["mongo_client"].admin.command("ping")
            return jsonify({"status": "ok", "db": "connected"}), 200
        except PyMongoError as exc:
            logger.error("Health check DB ping failed: %s", exc)
            return jsonify({"status": "degraded", "db": "unreachable"}), 503

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)
