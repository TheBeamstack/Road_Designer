# SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com>
# SPDX-License-Identifier: LicenseRef-BCL-1.1
"""GET /samples/axe, GET /samples/terrain — bundled example files.

The Streamlit app reads these straight off disk in-process via
``road_designer.samples_api``. The React SPA has no filesystem access to the
backend's container, so it needs these over HTTP to offer the same "use the
bundled example" option Streamlit has always had — this router is that gap
closed, not a new capability: it streams the exact same bytes
``samples_api.sample_axe_bytes()`` / ``sample_terrain_bytes()`` already
serve to Streamlit's own download buttons.
"""
from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import Response

from road_designer.samples_api import sample_axe_bytes, sample_terrain_bytes

router = APIRouter(prefix="/samples", tags=["samples"])


@router.get("/axe")
def get_sample_axe() -> Response:
    return Response(
        content=sample_axe_bytes(),
        media_type="text/plain",
        headers={"Content-Disposition": 'inline; filename="sample_axe.txt"'},
    )


@router.get("/terrain")
def get_sample_terrain() -> Response:
    return Response(
        content=sample_terrain_bytes(),
        media_type="text/csv",
        headers={"Content-Disposition": 'inline; filename="sample_terrain.csv"'},
    )
