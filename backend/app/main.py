# SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com>
# SPDX-License-Identifier: LicenseRef-BCL-1.1
"""FastAPI entry point.

Run locally with:  ``uvicorn backend.app.main:app --reload`` (from the repo
root, so ``road_designer`` is importable).

Deployment target: Hugging Face Spaces (Docker container), built from the
repo-root ``Dockerfile``; Google Cloud Run is the documented later-promotion
path. See DEPLOYMENT.md. CORS origins are read from the ``ALLOWED_ORIGIN`` env
var (comma-separated); unset, it defaults to ``https://rd.beam-stack.com`` so a
missing variable fails closed. Local dev sets it explicitly, e.g.
``ALLOWED_ORIGIN=http://localhost:5173``.
"""
from __future__ import annotations

import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import jobs
from .routers import designs, health, preview, samples

# TODO(user): set this env var on the backend service (HF Space: Settings >
# Variables and secrets; Cloud Run if later promoted: `gcloud run services
# update ... --update-env-vars ALLOWED_ORIGIN=...`) to the exact deployed
# origin(s), comma-separated. Unset or empty, it defaults to
# "https://rd.beam-stack.com" and every other origin gets no CORS header.
DEFAULT_ALLOWED_ORIGIN = "https://rd.beam-stack.com"
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "").strip() or DEFAULT_ALLOWED_ORIGIN
_origins = [o.strip() for o in ALLOWED_ORIGIN.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    sweep_task = asyncio.create_task(jobs.sweep_loop())
    yield
    sweep_task.cancel()


app = FastAPI(
    title="Road Designer V 1.0 API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(designs.router)
app.include_router(preview.router)
app.include_router(samples.router)
