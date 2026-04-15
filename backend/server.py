from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SAAVN_BASE = "https://saavn.sumit.co/api"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
async def search_all(query: str = Query(...)):
    return await proxy_saavn("/search", {"query": query})

@api_router.get("/search/songs")
async def search_songs(query: str = Query(...), page: int = 0, limit: int = 20):
    return await proxy_saavn("/search/songs", {"query": query, "page": page, "limit": limit})

@api_router.get("/search/albums")
async def search_albums(query: str = Query(...), page: int = 0, limit: int = 20):
    return await proxy_saavn("/search/albums", {"query": query, "page": page, "limit": limit})

@api_router.get("/search/artists")
async def search_artists(query: str = Query(...), page: int = 0, limit: int = 20):
    return await proxy_saavn("/search/artists", {"query": query, "page": page, "limit": limit})

@api_router.get("/search/playlists")
async def search_playlists(query: str = Query(...), page: int = 0, limit: int = 20):
    return await proxy_saavn("/search/playlists", {"query": query, "page": page, "limit": limit})

# ---- Song endpoints ----
@api_router.get("/songs/{song_id}")
async def get_song(song_id: str):
    return await proxy_saavn(f"/songs/{song_id}")

@api_router.get("/songs/{song_id}/suggestions")
async def get_song_suggestions(song_id: str, limit: int = 10):
    return await proxy_saavn(f"/songs/{song_id}/suggestions", {"limit": limit})

# ---- Album endpoints ----
@api_router.get("/albums")
async def get_album(id: str = Query(...)):
    return await proxy_saavn("/albums", {"id": id})

# ---- Artist endpoints ----
@api_router.get("/artists")
async def get_artist(id: str = Query(...)):
    return await proxy_saavn("/artists", {"id": id})

@api_router.get("/artists/{artist_id}/songs")
async def get_artist_songs(artist_id: str, page: int = 0):
    return await proxy_saavn(f"/artists/{artist_id}/songs", {"page": page})

@api_router.get("/artists/{artist_id}/albums")
async def get_artist_albums(artist_id: str, page: int = 0):
    return await proxy_saavn(f"/artists/{artist_id}/albums", {"page": page})

# ---- Playlist endpoints ----
@api_router.get("/playlists")
async def get_playlist(id: str = Query(...)):
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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
