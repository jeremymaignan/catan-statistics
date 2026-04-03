from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient

from api.config import MONGO_DB, MONGO_URI
from api.routes.games import games_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    # MongoDB connection
    client = MongoClient(MONGO_URI)
    app.config["db"] = client[MONGO_DB]

    # Register blueprints
    app.register_blueprint(games_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok"}, 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)
