from fastapi import APIRouter

from app.db import verify_connectivity

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health() -> dict:
    db_ok = verify_connectivity()
    return {"status": "ok" if db_ok else "degraded", "database": "up" if db_ok else "down"}
