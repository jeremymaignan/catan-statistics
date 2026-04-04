from datetime import datetime, timezone

from api.config import DEFAULT_PORTS


def new_game(resources, values, ports=None):
    """Create a new game document for MongoDB.

    settlements is a dict mapping position -> type ("colony" or "city").
    ports is a list of 9 port type codes matching PORT_EDGES order.
    """
    return {
        "resources": resources,
        "values": values,
        "settlements": {},
        "blocked_positions": [],
        "robber_tile": None,
        "ports": ports if ports is not None else list(DEFAULT_PORTS),
        "created_at": datetime.now(timezone.utc),
    }
