"""TLE query router endpoint."""

from fastapi import APIRouter, HTTPException
try:
    from ..services.spacetrack import SpaceTrackClient, SpaceTrackError
    from ..config import settings
except (ImportError, ValueError):
    from services.spacetrack import SpaceTrackClient, SpaceTrackError
    from config import settings

router = APIRouter(tags=["TLE"])
spacetrack_client = SpaceTrackClient()


@router.get("/tle/{norad_id}")
def get_tle(norad_id: int):
    """Fetches Two-Line Element (TLE) set for specified NORAD catalog identifier."""
    if not settings.check_spacetrack_configured():
        # Fallback synthetic TLE for offline demonstration
        if norad_id == 25544:
            return {
                "NORAD_CAT_ID": 25544,
                "OBJECT_NAME": "ISS (ZARYA)",
                "TLE_LINE1": "1 25544U 98067A   24300.50000000  .00016717  00000-0  10270-3 0  9002",
                "TLE_LINE2": "2 25544  51.6416 200.1234 0005432 120.4567 240.6789 15.49876543123456",
            }
        return {
            "NORAD_CAT_ID": norad_id,
            "OBJECT_NAME": f"SATELLITE-{norad_id}",
            "TLE_LINE1": f"1 {norad_id}U 24001A   24300.00000000  .00000000  00000-0  00000-0 0  9991",
            "TLE_LINE2": f"2 {norad_id}  53.0000  50.0000 0001000  60.0000  70.0000 15.0000000000001",
        }

    try:
        return spacetrack_client.fetch_tle(norad_id)
    except SpaceTrackError as e:
        raise HTTPException(status_code=e.status_code or 502, detail=str(e))
