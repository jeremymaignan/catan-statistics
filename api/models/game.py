from datetime import datetime, timezone

from api.config import DEFAULT_PORTS, PORT_EDGES


def _build_default_ports():
    """Build the default port list in the new {type, positions} format."""
    return [
        {"type": port_type, "positions": list(edge)}
        for port_type, edge in zip(DEFAULT_PORTS, PORT_EDGES)
        if port_type != "none"
    ]


def new_game(resources, values, ports=None):
    """Create a new game document for MongoDB.

    settlements is a dict mapping position -> type ("colony" or "city").
    ports is a list of {type, positions} objects.
    """
    return {
        "resources": resources,
        "values": values,
        "settlements": {},
        "blocked_positions": [],
        "robber_tile": None,
        "ports": ports if ports is not None else _build_default_ports(),
        "created_at": datetime.now(timezone.utc),
    }
