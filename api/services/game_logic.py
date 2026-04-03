from api.config import (
    ADJACENT_SETTLEMENT_POSITIONS,
    DICE_PROBABILITY,
    INDEXES,
    RESOURCES_MAP,
    SETTLEMENTS_POSITIONS,
)


def validate_settlement(position, settlements, blocked_positions):
    """
    Validate whether a new colony can be placed at the given position.
    settlements is a dict {position: type}.
    Returns (is_valid, error_message).
    """
    if position not in SETTLEMENTS_POSITIONS:
        return False, f"Invalid position: {position}"
    if position in settlements:
        return False, f"Settlement {position} already placed"
    if position in blocked_positions:
        return False, f"Position {position} is blocked by an adjacent settlement"
    return True, None


def add_settlement(position, settlements, blocked_positions):
    """
    Add a colony at position and update blocked positions.
    settlements is a dict {position: type}.
    Returns updated (settlements, blocked_positions).
    """
    settlements = dict(settlements)
    blocked_positions = list(blocked_positions)

    settlements[position] = "colony"
    for adj in ADJACENT_SETTLEMENT_POSITIONS.get(position, ""):
        if adj not in blocked_positions:
            blocked_positions.append(adj)

    return settlements, blocked_positions


def upgrade_settlement(position, settlements):
    """
    Upgrade a colony to a city.
    Returns updated settlements dict.
    """
    settlements = dict(settlements)
    if position in settlements and settlements[position] == "colony":
        settlements[position] = "city"
    return settlements


def remove_settlement(position, settlements, blocked_positions):
    """
    Remove a settlement and recalculate blocked positions from scratch.
    settlements is a dict {position: type}.
    Returns updated (settlements, blocked_positions).
    """
    if position not in settlements:
        return settlements, blocked_positions

    settlements = {k: v for k, v in settlements.items() if k != position}

    # Recalculate blocked positions from remaining settlements
    blocked_positions = []
    for s in settlements:
        for adj in ADJACENT_SETTLEMENT_POSITIONS.get(s, ""):
            if adj not in blocked_positions:
                blocked_positions.append(adj)

    return settlements, blocked_positions


def calculate_statistics(resources, values, settlements):
    """
    Calculate probability statistics for the current settlements.
    settlements is a dict {position: "colony"|"city"}.
    Cities produce 2x resources (counted twice in per_dice_value).
    Returns a dict with per-dice-value resources and per-resource probabilities.
    """
    proba_per_dice_value = {}
    proba_per_resource = {}

    for position, stype in settlements.items():
        multiplier = 2 if stype == "city" else 1

        for tile_idx in INDEXES.get(position, []):
            value = int(values[tile_idx - 1])
            if value == 0:
                continue

            resource_code = resources[tile_idx - 1]
            resource_info = RESOURCES_MAP.get(resource_code)
            if not resource_info:
                continue

            # Per dice value - add entry once per multiplier
            if value not in proba_per_dice_value:
                proba_per_dice_value[value] = []
            for _ in range(multiplier):
                proba_per_dice_value[value].append({
                    "resource": resource_code,
                    "text": resource_info["text"],
                    "color": resource_info["color"],
                })

            # Per resource
            if resource_code not in proba_per_resource:
                proba_per_resource[resource_code] = {
                    "text": resource_info["text"],
                    "color": resource_info["color"],
                    "rate": 0,
                    "proba": 0.0,
                    "values": [],
                }
            if value not in proba_per_resource[resource_code]["values"]:
                proba_per_resource[resource_code]["values"].append(value)
                dp = DICE_PROBABILITY.get(value, {"proba": 0, "rate": 0})
                proba_per_resource[resource_code]["proba"] += dp["proba"]
                proba_per_resource[resource_code]["rate"] += dp["rate"]

    # Calculate "any resource" probability
    any_rate = 0
    any_proba = 0.0
    for value in proba_per_dice_value:
        dp = DICE_PROBABILITY.get(value, {"proba": 0, "rate": 0})
        any_proba += dp["proba"]
        any_rate += dp["rate"]

    # Add percentage to each resource
    for code in proba_per_resource:
        rate = proba_per_resource[code]["rate"]
        proba_per_resource[code]["percentage"] = int(rate * 100 / 36) if rate else 0

    # Sort resources by rate descending
    sorted_resources = dict(
        sorted(proba_per_resource.items(), key=lambda x: x[1]["rate"], reverse=True)
    )

    return {
        "per_dice_value": {
            str(k): proba_per_dice_value[k]
            for k in sorted(proba_per_dice_value.keys())
        },
        "per_resource": sorted_resources,
        "any_resource": {
            "rate": any_rate,
            "proba": round(any_proba, 3),
            "percentage": int(any_rate * 100 / 36) if any_rate else 0,
        },
    }


def get_board_state(game):
    """Build the full board state for the frontend."""
    resources = game["resources"]
    values = game["values"]
    settlements = game["settlements"]  # dict {pos: type}
    blocked_positions = game["blocked_positions"]

    # Build tile data (19 tiles)
    tiles = []
    for i in range(19):
        resource_code = resources[i]
        resource_info = RESOURCES_MAP.get(resource_code, {})
        tiles.append({
            "index": i + 1,
            "resource": resource_code,
            "text": resource_info.get("text", ""),
            "color": resource_info.get("color", "#ccc"),
            "board_color": resource_info.get("board_color", "#ccc"),
            "value": int(values[i]),
            "dice_probability": DICE_PROBABILITY.get(int(values[i]), {}).get("proba", 0),
            "dice_dots": DICE_PROBABILITY.get(int(values[i]), {}).get("rate", 0),
        })

    # Build settlement positions info
    positions = {}
    for pos in SETTLEMENTS_POSITIONS:
        if pos in settlements:
            status = settlements[pos]  # "colony" or "city"
        elif pos in blocked_positions:
            status = "blocked"
        else:
            status = "available"
        positions[pos] = {
            "status": status,
            "adjacent_tiles": INDEXES.get(pos, []),
        }

    stats = calculate_statistics(resources, values, settlements)

    # Count points
    points = sum(1 if t == "colony" else 2 for t in settlements.values())

    return {
        "tiles": tiles,
        "positions": positions,
        "settlements": settlements,
        "blocked_positions": blocked_positions,
        "statistics": stats,
        "points": points,
    }
