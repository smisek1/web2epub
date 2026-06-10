"""Central DB configuration. Reads credentials from the environment so nothing
is hardcoded (the old code had the password baked into database.py)."""
import os

import psycopg2


def get_connection():
    """Open a new psycopg2 connection using environment variables.

    Defaults match docker-compose service names so it works in-container with
    just POSTGRES_PASSWORD set."""
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "postgres"),
        port=os.environ.get("DB_PORT", "5432"),
        dbname=os.environ.get("POSTGRES_DB", "conversion"),
        user=os.environ.get("POSTGRES_USER", "postgres"),
        password=os.environ.get("POSTGRES_PASSWORD", ""),
    )
