"""
Lectra 3D Engine — AR3D pipeline backend.
Generates production GLB meshes via semantic mesh + post-processing.
Proxies to ar3d-engine (port 8100) when available.
"""

import os
import asyncio
import uuid
import hashlib
import logging
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional

from semantic_glb import generate_glb, cache_key

logger = logging.getLogger(__name__)

app = FastAPI(title="Lectra AR3D Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "outputs"))
os.makedirs(OUTPUT_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=OUTPUT_DIR), name="static")

AR3D_ENGINE_URL = os.getenv("AR3D_ENGINE_URL", "http://localhost:8100")
# PUBLIC_URL is the externally-accessible URL of this backend.
# Set LECTRA_BACKEND_URL=http://76.13.17.91:8000 on the VPS so static file
# URLs returned to the frontend are reachable from the browser.
BASE_URL = os.getenv("LECTRA_BACKEND_URL", "http://localhost:8000")

_cache: Dict[str, dict] = {}


class GenerateRequest(BaseModel):
    prompt: str


class BatchGenerateRequest(BaseModel):
    prompts: List[str]


def _file_url(filename: str) -> str:
    return f"{BASE_URL}/static/{filename}"


async def _try_ar3d_topics(prompts: List[str]) -> Optional[List[dict]]:
    """Try ar3d-engine GPU pipeline first."""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.post(
                f"{AR3D_ENGINE_URL}/api/v1/generate/topics",
                json={"prompts": prompts, "quality": "standard"},
            )
            if r.status_code == 200:
                data = r.json()
                if all(item.get("success") for item in data):
                    return [
                        {
                            "success": True,
                            "fileUrl": item["fileUrl"].replace("localhost:8100", "localhost:8000")
                            if "localhost:8100" in item.get("fileUrl", "")
                            else item["fileUrl"],
                            "vertices": str(item.get("vertices", "—")),
                            "faces": item.get("faces"),
                            "prompt": item["prompt"],
                            "cached": item.get("cached", False),
                            "source": "ar3d-engine",
                        }
                        for item in data
                    ]
    except Exception as e:
        logger.debug("ar3d-engine unavailable: %s", e)
    return None


def _generate_local(prompt: str) -> dict:
    key = cache_key(prompt)
    if key in _cache:
        return {**_cache[key], "cached": True, "prompt": prompt}

    file_id = str(uuid.uuid4())[:8]
    filename = f"model_{key}_{file_id}.glb"
    out_path = os.path.join(OUTPUT_DIR, filename)

    meta = generate_glb(prompt, Path(out_path))
    result = {
        "success": True,
        "fileUrl": _file_url(filename),
        "vertices": str(meta["vertices"]),
        "faces": meta["faces"],
        "category": "AR3D Asset",
        "prompt": prompt,
        "cached": False,
        "source": "semantic-pipeline",
    }
    _cache[key] = result
    return result


@app.get("/health")
async def health():
    ar3d_ok = False
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{AR3D_ENGINE_URL}/api/v1/health")
            ar3d_ok = r.status_code == 200
    except Exception:
        pass
    return {"status": "ok", "engine": "ar3d", "ar3d_engine_connected": ar3d_ok}


@app.post("/api/generate")
async def generate_single(request: GenerateRequest):
    results = await _generate_batch([request.prompt.strip()])
    return results[0]


@app.post("/api/generate-batch")
async def generate_batch(request: BatchGenerateRequest):
    prompts = [p.strip() for p in request.prompts if p.strip()]
    if not prompts:
        raise HTTPException(status_code=400, detail="prompts array is empty")
    if len(prompts) > 10:
        raise HTTPException(status_code=400, detail="max 10 prompts per batch")
    return await _generate_batch(prompts)


@app.post("/api/generate-photos")
async def generate_from_photos(
    files: List[UploadFile] = File(...),
    mode: str = Form("photogrammetry"),
    quality: str = Form("standard"),
):
    """Upload 4–8 photos for photogrammetry pipeline."""
    if len(files) < 1:
        raise HTTPException(400, "At least one photo required")

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            multipart = []
            for i, f in enumerate(files):
                content = await f.read()
                multipart.append(("files", (f.filename or f"photo_{i}.jpg", content, f.content_type or "image/jpeg")))
            multipart.append(("mode", (None, mode)))
            multipart.append(("quality", (None, quality)))

            r = await client.post(f"{AR3D_ENGINE_URL}/api/v1/jobs", files=multipart)
            if r.status_code == 200:
                job = r.json()
                job_id = job["job_id"]
                for _ in range(120):
                    await asyncio.sleep(2)
                    status_r = await client.get(f"{AR3D_ENGINE_URL}/api/v1/jobs/{job_id}")
                    if status_r.status_code != 200:
                        break
                    status = status_r.json()
                    if status.get("status") == "completed":
                        glb_url = status.get("exports", {}).get("glb", "")
                        return {
                            "success": True,
                            "job_id": job_id,
                            "fileUrl": glb_url.replace("localhost:8100", "localhost:8000") if glb_url else glb_url,
                            "source": "photogrammetry",
                        }
                    if status.get("status") == "failed":
                        break
    except Exception as e:
        logger.warning("Photogrammetry failed, using first photo semantic: %s", e)

    return _generate_local(files[0].filename or "object")


async def _generate_batch(prompts: List[str]) -> List[dict]:
    ar3d_results = await _try_ar3d_topics(prompts)
    if ar3d_results:
        return ar3d_results

    loop = asyncio.get_event_loop()
    results = []
    for prompt in prompts:
        try:
            result = await loop.run_in_executor(None, _generate_local, prompt)
            results.append(result)
        except Exception as e:
            results.append({"success": False, "error": str(e), "prompt": prompt})
    return results
