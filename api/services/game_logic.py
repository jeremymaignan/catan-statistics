from api.config import (
    ADJACENT_SETTLEMENT_POSITIONS,
    DEFAULT_PORTS,
    DICE_PROBABILITY,
    INDEXES,
    PORT_EDGES,
    PORT_TYPES,
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


def calculate_statistics(resources, values, settlements, robber_tile=None):
    """
    Calculate probability statistics for the current settlements.
    settlements is a dict {position: "colony"|"city"|"opponent"}.
    Cities produce 2x resources (counted twice in per_dice_value).
    Opponent settlements are excluded (they don't produce resources for us).
    robber_tile is the 1-based tile index where the robber sits (blocks production).
    Returns a dict with per-dice-value resources and per-resource probabilities.
    Blocked resources (by robber) are included with blocked=True.
    """
    proba_per_dice_value = {}
    proba_per_resource = {}
    blocked_per_dice_value = {}
    blocked_per_resource = {}

    for position, stype in settlements.items():
        if stype == "opponent":
            continue  # Opponent settlements don't produce resources for us
        multiplier = 2 if stype == "city" else 1

        for tile_idx in INDEXES.get(position, []):
            value = int(values[tile_idx - 1])
            if value == 0:
                continue

            resource_code = resources[tile_idx - 1]
            resource_info = RESOURCES_MAP.get(resource_code)
            if not resource_info:
                continue

            is_blocked = robber_tile is not None and tile_idx == robber_tile

            if is_blocked:
                # Track blocked resources separately
                if value not in blocked_per_dice_value:
                    blocked_per_dice_value[value] = []
                for _ in range(multiplier):
                    blocked_per_dice_value[value].append({
                        "resource": resource_code,
                        "text": resource_info["text"],
                        "color": resource_info["color"],
                        "blocked": True,
                    })

                if resource_code not in blocked_per_resource:
                    blocked_per_resource[resource_code] = {
                        "text": resource_info["text"],
                        "color": resource_info["color"],
                        "rate": 0,
                        "proba": 0.0,
                        "values": [],
                        "blocked": True,
                    }
                if value not in blocked_per_resource[resource_code]["values"]:
                    blocked_per_resource[resource_code]["values"].append(value)
                    dp = DICE_PROBABILITY.get(value, {"proba": 0, "rate": 0})
                    blocked_per_resource[resource_code]["proba"] += dp["proba"]
                    blocked_per_resource[resource_code]["rate"] += dp["rate"]
            else:
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

    for code in blocked_per_resource:
        rate = blocked_per_resource[code]["rate"]
        blocked_per_resource[code]["percentage"] = int(rate * 100 / 36) if rate else 0

    # Only mark a resource as blocked in per_resource if it has NO active production.
    # If a resource appears in both active and blocked, it stays active (robber only
    # partially blocks it).
    fully_blocked = {
        code: info
        for code, info in blocked_per_resource.items()
        if code not in proba_per_resource
    }

    # Sort active resources by rate descending, then append fully-blocked at end
    sorted_active = sorted(proba_per_resource.items(), key=lambda x: x[1]["rate"], reverse=True)
    sorted_blocked = sorted(fully_blocked.items(), key=lambda x: x[1]["rate"], reverse=True)
    sorted_resources = dict(sorted_active + sorted_blocked)

    # Merge blocked entries into per_dice_value for the first table
    merged_dice = {}
    for value, entries in proba_per_dice_value.items():
        merged_dice[value] = list(entries)
    for value, entries in blocked_per_dice_value.items():
        if value not in merged_dice:
            merged_dice[value] = []
        merged_dice[value].extend(entries)

    return {
        "per_dice_value": {
            str(k): merged_dice[k]
            for k in sorted(merged_dice.keys())
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
    robber_tile = game.get("robber_tile")

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
            "has_robber": (i + 1) == robber_tile,
        })

    # Compute score for every position: sum of dice rates for adjacent tiles
    # (skip desert tiles with value 0; robber does NOT affect ranking)
    position_scores = {}
    for pos in SETTLEMENTS_POSITIONS:
        score = 0
        for tile_idx in INDEXES.get(pos, []):
            value = int(values[tile_idx - 1])
            if value == 0:
                continue
            score += DICE_PROBABILITY.get(value, {"rate": 0})["rate"]
        position_scores[pos] = score

    # Determine which positions are available (not settled or blocked)
    available_positions = set()
    for pos in SETTLEMENTS_POSITIONS:
        if pos not in settlements and pos not in blocked_positions:
            available_positions.add(pos)

    # Rank only available positions: highest score = rank 1, ties get same rank
    available_scores = sorted(
        set(position_scores[pos] for pos in available_positions),
        reverse=True,
    ) if available_positions else []
    available_score_to_rank = {
        score: rank + 1 for rank, score in enumerate(available_scores)
    }
    total_ranks = len(available_scores)

    # Build settlement positions info
    positions = {}
    for pos in SETTLEMENTS_POSITIONS:
        if pos in settlements:
            status = settlements[pos]  # "colony" or "city"
        elif pos in blocked_positions:
            status = "blocked"
        else:
            status = "available"

        # Build detailed tile info for tooltip
        tile_details = []
        for tile_idx in INDEXES.get(pos, []):
            value = int(values[tile_idx - 1])
            resource_code = resources[tile_idx - 1]
            resource_info = RESOURCES_MAP.get(resource_code, {})
            is_robber = robber_tile is not None and tile_idx == robber_tile
            dp = DICE_PROBABILITY.get(value, {"proba": 0, "rate": 0})
            tile_details.append({
                "tile_index": tile_idx,
                "resource": resource_code,
                "text": resource_info.get("text", ""),
                "color": resource_info.get("color", "#ccc"),
                "value": value,
                "rate": dp["rate"],
                "has_robber": is_robber,
            })

        positions[pos] = {
            "status": status,
            "adjacent_tiles": INDEXES.get(pos, []),
            "score": position_scores[pos],
            "rank": available_score_to_rank.get(position_scores[pos], 0),
            "total_ranks": total_ranks,
            "tile_details": tile_details,
        }

    stats = calculate_statistics(resources, values, settlements, robber_tile)

    # Count points (exclude opponent settlements)
    points = sum(
        1 if t == "colony" else 2
        for t in settlements.values()
        if t in ("colony", "city")
    )

    # Board-level resource scarcity analysis
    # For each resource, collect the unique dice values across all its tiles.
    # Then sum the rates for those unique values to get the probability of
    # producing that resource on any given roll (rate out of 36).
    # This avoids double-counting when two tiles of the same resource share
    # a dice value.
    scarcity = {}
    for i in range(19):
        resource_code = resources[i]
        if resource_code == "r":
            continue
        value = int(values[i])
        if value == 0:
            continue
        resource_info = RESOURCES_MAP.get(resource_code, {})
        if resource_code not in scarcity:
            scarcity[resource_code] = {
                "text": resource_info.get("text", ""),
                "color": resource_info.get("color", "#ccc"),
                "board_color": resource_info.get("board_color", "#ccc"),
                "tile_count": 0,
                "dice_values": set(),
            }
        scarcity[resource_code]["tile_count"] += 1
        scarcity[resource_code]["dice_values"].add(value)

    # Compute total_rate from unique dice values, sort most common first
    for code in scarcity:
        total_rate = sum(
            DICE_PROBABILITY.get(v, {"rate": 0})["rate"]
            for v in scarcity[code]["dice_values"]
        )
        scarcity[code]["total_rate"] = total_rate
        scarcity[code]["dice_values"] = sorted(scarcity[code]["dice_values"])

    board_scarcity = dict(
        sorted(scarcity.items(), key=lambda x: x[1]["total_rate"], reverse=True)
    )

    # Build port data
    port_types_list = game.get("ports", DEFAULT_PORTS)
    ports = []
    for i, (pos_a, pos_b) in enumerate(PORT_EDGES):
        port_code = port_types_list[i] if i < len(port_types_list) else "none"
        port_info = PORT_TYPES.get(port_code, PORT_TYPES["none"])
        ports.append({
            "index": i,
            "type": port_code,
            "text": port_info["text"],
            "color": port_info.get("color"),
            "positions": [pos_a, pos_b],
        })

    return {
        "tiles": tiles,
        "positions": positions,
        "settlements": settlements,
        "blocked_positions": blocked_positions,
        "robber_tile": robber_tile,
        "ports": ports,
        "statistics": stats,
        "points": points,
        "board_scarcity": board_scarcity,
    }
