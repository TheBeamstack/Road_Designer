"""build_design's optional progress callback (T-004)."""
from __future__ import annotations

import inspect
from copy import deepcopy

import pytest
from openpyxl import load_workbook

from road_designer.road_design import build_design

STAGES = [
    "tracé et ligne rouge",
    "profils en travers",
    "cubatures",
    "DXF",
    "XLSX",
    "PDF plan",
    "PDF profils en travers",
]


@pytest.fixture(scope="module")
def runs(axe_path, terrain_path, cfg, tmp_path_factory):
    cfg = deepcopy(cfg)
    cfg.cartouche.company_name = "BeamStack Test"
    calls = []
    with_cb = build_design(cfg, axe_path, terrain_path, tmp_path_factory.mktemp("cb"),
                           progress=lambda *args: calls.append(args))
    without = build_design(cfg, axe_path, terrain_path, tmp_path_factory.mktemp("plain"))
    return calls, with_cb, without


def test_signature_keeps_order_and_progress_is_keyword_only():
    params = inspect.signature(build_design).parameters
    assert list(params) == ["cfg", "axe_path", "terrain_path", "out_dir",
                            "return_design", "progress"]
    assert params["progress"].kind is inspect.Parameter.KEYWORD_ONLY
    assert params["progress"].default is None


def test_stage_calls_come_in_order(runs):
    calls, _, _ = runs
    assert [c[0] for c in calls if len(c) == 1] == STAGES


def test_each_pdf_reports_every_page(runs):
    calls, _, _ = runs
    for stage in ("PDF plan", "PDF profils en travers"):
        pages = [c[1:] for c in calls if len(c) == 3 and c[0] == stage]
        total = pages[0][1]
        assert pages == [(k, total) for k in range(1, total + 1)]
    assert calls[-1][0] == "PDF profils en travers"
    assert calls[-1][1] == calls[-1][2]


def test_output_unchanged_without_progress(runs):
    _, with_cb, without = runs
    assert set(with_cb) == set(without)
    assert with_cb["warnings"] == without["warnings"]
    a, b = load_workbook(with_cb["xlsx"]), load_workbook(without["xlsx"])
    for name in a.sheetnames:
        assert list(a[name].values) == list(b[name].values)
