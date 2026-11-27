# SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com>
# SPDX-License-Identifier: LicenseRef-BCL-1.1
"""CORS fails closed: an unset ALLOWED_ORIGIN allows only https://rd.beam-stack.com.

The middleware is configured at import, so each case reloads ``backend.app.main``
under the environment it needs and restores the module afterwards.
"""
from __future__ import annotations

import importlib

import pytest
from fastapi.testclient import TestClient

import backend.app.main as main_module

PROD = "https://rd.beam-stack.com"
EVIL = "https://evil.example"
ACAO = "access-control-allow-origin"


@pytest.fixture
def app_with_env(monkeypatch):
    def build(value: str | None) -> TestClient:
        if value is None:
            monkeypatch.delenv("ALLOWED_ORIGIN", raising=False)
        else:
            monkeypatch.setenv("ALLOWED_ORIGIN", value)
        return TestClient(importlib.reload(main_module).app)

    yield build
    monkeypatch.undo()
    importlib.reload(main_module)


def _preflight(client: TestClient, origin: str):
    return client.options(
        "/health",
        headers={"Origin": origin, "Access-Control-Request-Method": "GET"},
    )


def test_unset_allows_production_origin(app_with_env):
    client = app_with_env(None)
    assert client.get("/health", headers={"Origin": PROD}).headers.get(ACAO) == PROD
    assert _preflight(client, PROD).headers.get(ACAO) == PROD


def test_unset_refuses_other_origin(app_with_env):
    client = app_with_env(None)
    assert ACAO not in client.get("/health", headers={"Origin": EVIL}).headers
    assert ACAO not in _preflight(client, EVIL).headers


def test_comma_separated_origins(app_with_env):
    client = app_with_env("https://a.example,https://b.example")
    for origin in ("https://a.example", "https://b.example"):
        assert client.get("/health", headers={"Origin": origin}).headers.get(ACAO) == origin
        assert _preflight(client, origin).headers.get(ACAO) == origin
    assert ACAO not in client.get("/health", headers={"Origin": "https://c.example"}).headers
    assert ACAO not in _preflight(client, "https://c.example").headers
