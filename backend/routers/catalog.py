"""Catalog query router endpoint."""

from typing import List, Dict, Any
from fastapi import APIRouter, Query, HTTPException
try:
    from ..services.spacetrack import SpaceTrackClient, SpaceTrackError
    from ..config import settings
except (ImportError, ValueError):
    from services.spacetrack import SpaceTrackClient, SpaceTrackError
    from config import settings

router = APIRouter(tags=["Catalog"])
spacetrack_client = SpaceTrackClient()


@router.get("/catalog")
def get_catalog(limit: int = Query(default=100, ge=1, le=5000)) -> List[Dict[str, Any]]:
    """Retrieves list of active on-orbit catalog items with TLE records."""
    if not settings.check_spacetrack_configured():
        # Deterministic synthetic catalog fallback
        mock_catalog: List[Dict[str, Any]] = []
        for i in range(1, min(limit, 200) + 1):
            nid = 40000 + i
            inc = 45.0 + (i % 50)
            mock_catalog.append(
                {
                    "NORAD_CAT_ID": nid,
                    "OBJECT_NAME": f"ORBITAL-OBJ-{i:04d}",
                    "TLE_LINE1": f"1 {nid}U 24001A   24300.00000000  .00000000  00000-0  00000-0 0  9991",
                    "TLE_LINE2": f"2 {nid}  {inc:8.4f}  {(i*15)%360:8.4f} 0001000  {(i*20)%360:8.4f}  {(i*30)%360:8.4f} 15.2000000000001",
                }
            )
        return mock_catalog

    try:
        return spacetrack_client.fetch_catalog(limit=limit)
    except SpaceTrackError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=str(e))
