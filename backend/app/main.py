# SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com>
# SPDX-License-Identifier: LicenseRef-BCL-1.1
"""FastAPI entry point.

Run locally with:  ``uvicorn backend.app.main:app --reload`` (from the repo
root, so ``road_designer`` is importable).

Deployment target: Hugging Face Spaces (Docker container), built from the
repo-root ``Dockerfile``; Google Cloud Run is the documented later-promotion
path. See DEPLOYMENT.md. CORS origin is read from the ``ALLOWED_ORIGIN`` env
var — set it to the deployed Cloudflare Pages URL after the first real deploy
(placeholder default below is permissive for local dev only).
"""
from __future__ import annotations

import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import jobs
from .routers import designs, health, preview, samples

# TODO(user): after your first real Cloudflare Pages deploy, set this env var
# on the backend service (HF Space: Settings > Variables and secrets; Cloud Run
# if later promoted: `gcloud run services update ... --update-env-vars
# ALLOWED_ORIGIN=...`) to the exact deployed origin, e.g.
# "https://road-designer.pages.dev". Comma-separate multiple origins. Defaults
# to "*" (dev-only — do not ship to production unpinned).
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
_origins = [o.strip() for o in ALLOWED_ORIGIN.split(",")] if ALLOWED_ORIGIN != "*" else ["*"]


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
