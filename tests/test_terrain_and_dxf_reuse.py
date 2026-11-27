# SPDX-License-Identifier: LicenseRef-BCL-1.1
# SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com>
"""T-006: vectorised TN query parity, and write_dxf reusing build_design's sections."""
from __future__ import annotations

import numpy as np
import pytest

from road_designer.mnt_engine import TerrainModel


def test_query_z_many_matches_query_z(terrain_path, capsys):
    tm = TerrainModel(terrain_path)
    xmin, ymin, xmax, ymax = tm.bounds
    rng = np.random.default_rng(0)
    xs = rng.uniform(xmin, xmax, 500)
    ys = rng.uniform(ymin, ymax, 500)
    # Points outside the hull exercise the nearest-neighbour fallback.
    xs = np.append(xs, [xmin - 50.0, xmax + 120.0])
    ys = np.append(ys, [ymin - 10.0, ymax + 3.0])

    capsys.readouterr()
    one = np.array([tm.query_z(x, y) for x, y in zip(xs, ys)])
    warn_one = capsys.readouterr().out
    many = tm.query_z_many(xs, ys)
    warn_many = capsys.readouterr().out

    np.testing.assert_array_equal(many, one)
    assert warn_one.count("outside terrain hull") >= 2
    assert warn_many == warn_one


def test_write_dxf_reuses_sections_and_keeps_section_areas(design, tmp_path,
                                                          monkeypatch):
    import road_designer.cross_section as cs
    from road_designer.dxf_export import write_dxf

    def _refuse(_design):
        raise AssertionError("all_sections called although design.sections is set")

    monkeypatch.setattr(cs, "all_sections", _refuse)
    saved = design.section_areas
    sentinel = dict(saved)
    design.section_areas = sentinel
    try:
        write_dxf(design, tmp_path / "out.dxf")
        assert design.section_areas is sentinel
    finally:
        design.section_areas = saved
    assert (tmp_path / "out.dxf").stat().st_size > 0
