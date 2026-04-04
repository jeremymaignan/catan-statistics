from datetime import datetime, timezone


def new_game(resources, values):
    """Create a new game document for MongoDB.

    settlements is a dict mapping position -> type ("colony" or "city").
    """
    return {
        "resources": resources,
        "values": values,
        "settlements": {},
        "blocked_positions": [],
        "robber_tile": None,
        "created_at": datetime.now(timezone.utc),
    }
