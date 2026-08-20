import logging
from contextlib import contextmanager
from typing import Iterator

from fastapi import HTTPException
from neo4j import Driver, GraphDatabase
from neo4j.exceptions import AuthError, Neo4jError, ServiceUnavailable

from app.config import settings

logger = logging.getLogger("app.db")

_driver: Driver | None = None


def init_driver() -> None:
    global _driver
    _driver = GraphDatabase.driver(
        settings.bolt_uri,
        auth=(settings.bolt_user, settings.bolt_password),
    )


def close_driver() -> None:
    global _driver
    if _driver is not None:
        _driver.close()
        _driver = None


# Connectivity failures (DNS lookup errors, refused/timed-out sockets) surface
# from the driver as plain ValueError/OSError, not as neo4j.exceptions types —
# both must be treated as "unreachable" for the check below to be reliable.
CONNECTIVITY_ERRORS = (ServiceUnavailable, AuthError, ValueError, OSError)


def verify_connectivity() -> bool:
    if _driver is None:
        return False
    try:
        _driver.verify_connectivity()
        return True
    except CONNECTIVITY_ERRORS as exc:
        logger.warning("CognoDB connectivity check failed: %s", exc)
        return False


@contextmanager
def get_session() -> Iterator:
    if _driver is None:
        raise HTTPException(
            status_code=503,
            detail="Database driver is not initialized.",
        )
    try:
        with _driver.session() as session:
            yield session
    except CONNECTIVITY_ERRORS as exc:
        logger.error("CognoDB is unreachable: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="The database is currently unreachable. Please try again shortly.",
        ) from exc
    except Neo4jError as exc:
        logger.error("CognoDB query failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="The database rejected the request.",
        ) from exc


def run_query(query: str, parameters: dict | None = None) -> list[dict]:
    with get_session() as session:
        result = session.run(query, parameters or {})
        return [record.data() for record in result]
