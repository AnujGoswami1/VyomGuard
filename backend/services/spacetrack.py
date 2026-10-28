"""Space-Track API ingestion client with session caching and rate limiting."""

import os
import json
import time
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
import requests
try:
    from ..config import settings
except (ImportError, ValueError):
    from config import settings

logger = logging.getLogger("vyomsentinel.spacetrack")


class SpaceTrackError(Exception):
    """Exception raised when communication with Space-Track API fails."""

    def __init__(self, message: str, status_code: Optional[int] = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class SpaceTrackClient:
    """Client for authenticated queries against the US Space Command Space-Track portal."""

    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "VYOMSENTINEL/1.0 SpaceTrafficManagement"}
        )
        self.authenticated = False
        self.last_request_time = 0.0
        self.cache_dir = os.path.join(os.path.dirname(__file__), "..", ".cache")
        os.makedirs(self.cache_dir, exist_ok=True)

    def _rate_limit(self) -> None:
        """Enforces at least 2.0 seconds between consecutive API calls to respect limits."""
        elapsed = time.time() - self.last_request_time
        if elapsed < 2.0:
            time.sleep(2.0 - elapsed)
        self.last_request_time = time.time()

    def _ensure_authenticated(self) -> None:
        """Logs into Space-Track if not currently authenticated."""
        if self.authenticated:
            return

        if not settings.SPACETRACK_USER or not settings.SPACETRACK_PASS:
            raise SpaceTrackError(
                "Space-Track credentials not configured. Please set SPACETRACK_USER "
                "and SPACETRACK_PASS in the backend environment."
            )

        self._rate_limit()
        login_url = f"{settings.SPACETRACK_BASE_URL}/ajaxauth/login"
        payload = {
            "identity": settings.SPACETRACK_USER,
            "password": settings.SPACETRACK_PASS,
        }

        try:
            logger.info("Authenticating session with Space-Track portal...")
            response = self.session.post(login_url, data=payload, timeout=20.0)
            if response.status_code != 200:
                raise SpaceTrackError(
                    f"Space-Track authentication failed with status {response.status_code}: {response.text}",
                    status_code=response.status_code,
                )
            if "INVALID_LOGIN" in response.text or "FAILED" in response.text:
                raise SpaceTrackError("Invalid Space-Track identity or password provided.")

            self.authenticated = True
            logger.info("Space-Track authentication handshake successful.")
        except requests.RequestException as e:
            raise SpaceTrackError(f"Network error during Space-Track login: {str(e)}")

    def _get_cache_path(self, key: str) -> str:
        """Returns the local filesystem path for a cached JSON entry."""
        safe_key = "".join(c if c.isalnum() else "_" for c in key)
        return os.path.join(self.cache_dir, f"{safe_key}.json")

    def _read_cache(self, key: str, ttl_seconds: int) -> Optional[Any]:
        """Reads data from cache if present and fresh."""
        cache_path = self._get_cache_path(key)
        if not os.path.exists(cache_path):
            return None

        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            cached_at = data.get("cached_at", 0)
            if time.time() - cached_at <= ttl_seconds:
                return data.get("payload")
        except Exception as e:
            logger.warning(f"Cache read error for {key}: {str(e)}")

        return None

    def _write_cache(self, key: str, payload: Any) -> None:
        """Stores query response to disk cache with timestamp."""
        cache_path = self._get_cache_path(key)
        try:
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump({"cached_at": time.time(), "payload": payload}, f)
        except Exception as e:
            logger.warning(f"Cache write error for {key}: {str(e)}")

    def fetch_tle(self, norad_id: int) -> Dict[str, Any]:
        """Fetches the latest General Perturbations (GP) TLE record for a NORAD ID."""
        cache_key = f"tle_{norad_id}"
        cached = self._read_cache(cache_key, settings.TLE_CACHE_TTL_SECONDS)
        if cached:
            return cached

        self._ensure_authenticated()
        self._rate_limit()

        url = (
            f"{settings.SPACETRACK_BASE_URL}/basicspacedata/query/class/gp/"
            f"NORAD_CAT_ID/{norad_id}/format/json"
        )

        try:
            logger.info(f"Fetching TLE for NORAD ID {norad_id}...")
            response = self.session.get(url, timeout=25.0)
            if response.status_code != 200:
                raise SpaceTrackError(
                    f"Failed to fetch TLE {norad_id}: HTTP {response.status_code}",
                    status_code=response.status_code,
                )
            results = response.json()
            if not results:
                raise SpaceTrackError(f"No catalog orbital data returned for NORAD ID {norad_id}")

            tle_data = results[0]
            self._write_cache(cache_key, tle_data)
            return tle_data
        except requests.RequestException as e:
            raise SpaceTrackError(f"Network error querying TLE for {norad_id}: {str(e)}")

    def fetch_catalog(self, limit: int = 500) -> List[Dict[str, Any]]:
        """Queries recent active on-orbit catalog objects."""
        effective_limit = min(limit, settings.MAX_CATALOG_SIZE)
        cache_key = f"catalog_recent_{effective_limit}"
        cached = self._read_cache(cache_key, settings.CATALOG_CACHE_TTL_SECONDS)
        if cached:
            return cached

        self._ensure_authenticated()
        self._rate_limit()

        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
        url = (
            f"{settings.SPACETRACK_BASE_URL}/basicspacedata/query/class/gp/"
            f"decay_date/null-val/epoch/>{seven_days_ago}/format/json/limit/{effective_limit}"
        )

        try:
            logger.info(f"Fetching {effective_limit} active catalog objects from Space-Track...")
            response = self.session.get(url, timeout=40.0)
            if response.status_code != 200:
                raise SpaceTrackError(
                    f"Failed to fetch catalog: HTTP {response.status_code}",
                    status_code=response.status_code,
                )
            catalog = response.json()
            self._write_cache(cache_key, catalog)
            return catalog
        except requests.RequestException as e:
            raise SpaceTrackError(f"Network error fetching space catalog: {str(e)}")
