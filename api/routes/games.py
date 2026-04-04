from bson import ObjectId
from flask import Blueprint, current_app, jsonify, request

from api.config import DICE_PROBABILITY, PORT_TYPES, SETTLEMENTS_POSITIONS
from api.models.game import new_game
from api.services.game_logic import (
    add_settlement,
    get_board_state,
    remove_settlement,
    upgrade_settlement,
    validate_settlement,
)
from api.services.image_processing import crop_image
from api.services.openai_client import OpenAIClient

games_bp = Blueprint("games", __name__)


def get_db():
    return current_app.config["db"]


@games_bp.route("/api/games", methods=["POST"])
def create_game():
    """Create a new game with manual board setup."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    resources = data.get("resources", [])
    values = data.get("values", [])

    if len(resources) != 19 or len(values) != 19:
        return jsonify({"error": "Exactly 19 resources and 19 values required"}), 400

    valid_resources = {"wo", "b", "o", "s", "w", "r"}
    for r in resources:
        if r not in valid_resources:
            return jsonify({"error": f"Invalid resource: {r}"}), 400

    for v in values:
        try:
            val = int(v)
            if val not in DICE_PROBABILITY:
                return jsonify({"error": f"Invalid value: {v}"}), 400
        except ValueError:
            return jsonify({"error": f"Invalid value: {v}"}), 400

    ports = data.get("ports", None)
    if ports is not None:
        if len(ports) != 9:
            return jsonify({"error": "Exactly 9 ports required"}), 400
        for p in ports:
            if p not in PORT_TYPES:
                return jsonify({"error": f"Invalid port type: {p}"}), 400

    game = new_game(resources, [str(v) for v in values], ports=ports)
    result = get_db().games.insert_one(game)

    return jsonify({
        "id": str(result.inserted_id),
        "message": "Game created successfully",
    }), 201


@games_bp.route("/api/games/parse", methods=["POST"])
def create_game_from_image():
    """Create a new game by parsing a board screenshot."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        file_bytes = file.read()
        tile_paths = crop_image(file_bytes)
        client = OpenAIClient()
        resources, values = client.parse_board(tile_paths)
    except Exception as e:
        return jsonify({"error": f"Failed to parse image: {str(e)}"}), 500

    game = new_game(resources, values)
    result = get_db().games.insert_one(game)

    return jsonify({
        "id": str(result.inserted_id),
        "resources": resources,
        "values": values,
        "message": "Game created from image",
    }), 201


@games_bp.route("/api/games/<game_id>", methods=["GET"])
def get_game(game_id):
    """Get the full game state including board and statistics."""
    try:
        game = get_db().games.find_one({"_id": ObjectId(game_id)})
    except Exception:
        return jsonify({"error": "Invalid game ID"}), 400

    if not game:
        return jsonify({"error": "Game not found"}), 404

    board_state = get_board_state(game)
    board_state["id"] = str(game["_id"])

    return jsonify(board_state), 200


@games_bp.route("/api/games/<game_id>/settlements/<position>", methods=["PATCH"])
def cycle_settlement(game_id, position):
    """
    Cycle a settlement position through states:
      available -> colony -> city -> opponent -> removed (available)
    """
    try:
        game = get_db().games.find_one({"_id": ObjectId(game_id)})
    except Exception:
        return jsonify({"error": "Invalid game ID"}), 400

    if not game:
        return jsonify({"error": "Game not found"}), 404

    if position not in SETTLEMENTS_POSITIONS:
        return jsonify({"error": f"Invalid position: {position}"}), 400

    settlements = dict(game["settlements"])
    blocked = list(game["blocked_positions"])

    if position not in settlements:
        # Available -> Colony
        valid, error = validate_settlement(position, settlements, blocked)
        if not valid:
            return jsonify({"error": error}), 400
        settlements, blocked = add_settlement(position, settlements, blocked)
    elif settlements[position] == "colony":
        # Colony -> City
        settlements = upgrade_settlement(position, settlements)
    elif settlements[position] == "city":
        # City -> Opponent
        settlements = dict(settlements)
        settlements[position] = "opponent"
    elif settlements[position] == "opponent":
        # Opponent -> Remove
        settlements, blocked = remove_settlement(position, settlements, blocked)

    get_db().games.update_one(
        {"_id": ObjectId(game_id)},
        {"$set": {"settlements": settlements, "blocked_positions": blocked}},
    )

    game["settlements"] = settlements
    game["blocked_positions"] = blocked
    board_state = get_board_state(game)
    board_state["id"] = game_id

    return jsonify(board_state), 200


@games_bp.route("/api/games/<game_id>/robber/<int:tile_index>", methods=["PATCH"])
def move_robber(game_id, tile_index):
    """
    Place or remove the robber on a tile.
    If the robber is already on this tile, remove it.
    tile_index is 1-based (1-19).
    """
    try:
        game = get_db().games.find_one({"_id": ObjectId(game_id)})
    except Exception:
        return jsonify({"error": "Invalid game ID"}), 400

    if not game:
        return jsonify({"error": "Game not found"}), 404

    if tile_index < 1 or tile_index > 19:
        return jsonify({"error": "Tile index must be between 1 and 19"}), 400

    current_robber = game.get("robber_tile")

    # Toggle: if robber is already on this tile, remove it; otherwise place it
    if current_robber == tile_index:
        new_robber = None
    else:
        new_robber = tile_index

    get_db().games.update_one(
        {"_id": ObjectId(game_id)},
        {"$set": {"robber_tile": new_robber}},
    )

    game["robber_tile"] = new_robber
    board_state = get_board_state(game)
    board_state["id"] = game_id

    return jsonify(board_state), 200


@games_bp.route("/api/games/<game_id>/clone", methods=["POST"])
def clone_game(game_id):
    """Clone a game's board (resources + values) into a new game without settlements."""
    try:
        game = get_db().games.find_one({"_id": ObjectId(game_id)})
    except Exception:
        return jsonify({"error": "Invalid game ID"}), 400

    if not game:
        return jsonify({"error": "Game not found"}), 404

    clone = new_game(list(game["resources"]), list(game["values"]), ports=list(game.get("ports", [])) or None)
    result = get_db().games.insert_one(clone)

    return jsonify({
        "id": str(result.inserted_id),
        "message": "Game cloned successfully",
    }), 201


@games_bp.route("/api/probabilities", methods=["GET"])
def get_probabilities():
    """Get the static dice probability table."""
    result = {}
    for k, v in DICE_PROBABILITY.items():
        if k == 0:
            continue
        result[str(k)] = {
            "proba": round(v["proba"], 3),
            "rate": v["rate"],
            "percentage": int(v["rate"] * 100 / 36),
            "color": v["color"],
        }
    return jsonify(result), 200
