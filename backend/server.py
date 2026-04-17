import logging
import os
import re
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Path as PathParam, Query
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SAAVN_BASE = "https://saavn.sumit.co/api"

# IDs returned by the JioSaavn API are short alphanumeric tokens. Restrict the
# character set so callers cannot inject path-traversal sequences (``..``) or
# other unexpected segments into the upstream URL we build in ``proxy_saavn``.
ID_PATTERN = r"^[A-Za-z0-9_-]{1,64}$"
_ID_REGEX = re.compile(ID_PATTERN)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _validate_id(value: str, field: str) -> str:
    """Defence-in-depth check for path parameters used in upstream URLs."""
    if not _ID_REGEX.fullmatch(value or ""):
        raise HTTPException(status_code=400, detail=f"Invalid {field}")
    return value


async def proxy_saavn(path: str, params: dict = None):
    """Proxy requests to JioSaavn API"""
    url = f"{SAAVN_BASE}{path}"
    try:
        async with httpx.AsyncClient(timeout=15.0) as hc:
            resp = await hc.get(url, params=params)
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"JioSaavn API error: {e}")
        raise HTTPException(status_code=e.response.status_code, detail="JioSaavn API error")
    except Exception as e:
        logger.error(f"Proxy error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach JioSaavn API")


# ---- Search endpoints ----
@api_router.get("/search")
async def search_all(query: str = Query(..., min_length=1, max_length=200)):
    return await proxy_saavn("/search", {"query": query})


@api_router.get("/search/songs")
async def search_songs(
    query: str = Query(..., min_length=1, max_length=200),
    page: int = Query(0, ge=0, le=100),
    limit: int = Query(20, ge=1, le=50),
):
    return await proxy_saavn("/search/songs", {"query": query, "page": page, "limit": limit})


@api_router.get("/search/albums")
async def search_albums(
    query: str = Query(..., min_length=1, max_length=200),
    page: int = Query(0, ge=0, le=100),
    limit: int = Query(20, ge=1, le=50),
):
    return await proxy_saavn("/search/albums", {"query": query, "page": page, "limit": limit})


@api_router.get("/search/artists")
async def search_artists(
    query: str = Query(..., min_length=1, max_length=200),
    page: int = Query(0, ge=0, le=100),
    limit: int = Query(20, ge=1, le=50),
):
    return await proxy_saavn("/search/artists", {"query": query, "page": page, "limit": limit})


@api_router.get("/search/playlists")
async def search_playlists(
    query: str = Query(..., min_length=1, max_length=200),
    page: int = Query(0, ge=0, le=100),
    limit: int = Query(20, ge=1, le=50),
):
    return await proxy_saavn("/search/playlists", {"query": query, "page": page, "limit": limit})


# ---- Song endpoints ----
@api_router.get("/songs/{song_id}")
async def get_song(song_id: str = PathParam(..., pattern=ID_PATTERN)):
    _validate_id(song_id, "song_id")
    return await proxy_saavn(f"/songs/{song_id}")


@api_router.get("/songs/{song_id}/suggestions")
async def get_song_suggestions(
    song_id: str = PathParam(..., pattern=ID_PATTERN),
    limit: int = Query(10, ge=1, le=50),
):
    _validate_id(song_id, "song_id")
    return await proxy_saavn(f"/songs/{song_id}/suggestions", {"limit": limit})


# ---- Album endpoints ----
@api_router.get("/albums")
async def get_album(id: str = Query(..., pattern=ID_PATTERN)):
    _validate_id(id, "id")
    return await proxy_saavn("/albums", {"id": id})


# ---- Artist endpoints ----
@api_router.get("/artists")
async def get_artist(id: str = Query(..., pattern=ID_PATTERN)):
    _validate_id(id, "id")
    return await proxy_saavn("/artists", {"id": id})


@api_router.get("/artists/{artist_id}/songs")
async def get_artist_songs(
    artist_id: str = PathParam(..., pattern=ID_PATTERN),
    page: int = Query(0, ge=0, le=100),
):
    _validate_id(artist_id, "artist_id")
    return await proxy_saavn(f"/artists/{artist_id}/songs", {"page": page})


@api_router.get("/artists/{artist_id}/albums")
async def get_artist_albums(
    artist_id: str = PathParam(..., pattern=ID_PATTERN),
    page: int = Query(0, ge=0, le=100),
):
    _validate_id(artist_id, "artist_id")
    return await proxy_saavn(f"/artists/{artist_id}/albums", {"page": page})


# ---- Playlist endpoints ----
@api_router.get("/playlists")
async def get_playlist(id: str = Query(..., pattern=ID_PATTERN)):
    _validate_id(id, "id")
    return await proxy_saavn("/playlists", {"id": id})


# ---- Trending / Home ----
@api_router.get("/trending")
async def get_trending():
    """Get trending content by searching popular terms"""
    results = {}
    queries = ["trending", "arijit singh", "bollywood hits"]
    try:
        async with httpx.AsyncClient(timeout=15.0) as hc:
            for q in queries:
                resp = await hc.get(f"{SAAVN_BASE}/search/songs", params={"query": q, "limit": 10})
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("success") and data.get("data"):
                        results[q] = data["data"].get("results", [])
    except Exception as e:
        logger.error(f"Trending fetch error: {e}")
    return {"success": True, "data": results}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(api_router)

# ---- CORS ----
# Security: combining ``allow_credentials=True`` with wildcard origins ("*") is
# a well-known misconfiguration. Starlette's CORSMiddleware echoes the
# request's Origin back with ``Access-Control-Allow-Credentials: true`` in that
# case, which lets any origin make authenticated cross-origin requests. We
# explicitly reject the combination: if the configured origins list is empty
# or contains "*", credentialed CORS is disabled.
_cors_env = os.environ.get("CORS_ORIGINS", "").strip()
_cors_origins = [o.strip() for o in _cors_env.split(",") if o.strip()] if _cors_env else []

if not _cors_origins or "*" in _cors_origins:
    # No explicit allow-list configured -> allow all origins but without
    # credentials, which is the safe CORS default.
    _cors_origins = ["*"]
    _cors_allow_credentials = False
    logger.warning(
        "CORS_ORIGINS is unset or '*'; serving CORS with credentials disabled. "
        "Set CORS_ORIGINS to a comma-separated allow-list in production."
    )
else:
    _cors_allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_credentials=_cors_allow_credentials,
    allow_origins=_cors_origins,
    allow_methods=["GET", "HEAD", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
