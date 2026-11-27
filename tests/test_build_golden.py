# SPDX-License-Identifier: LicenseRef-BCL-1.1
# SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com>
"""build_design on the samples gives the values main gave before T-006."""
from __future__ import annotations

from copy import deepcopy

import numpy as np

from road_designer.config import REFT_CAT_1
from road_designer.road_design import build_design

# Measured on main at 8c448c7 (CAT_1, bundled samples).
GOLDEN_TOTAL_DEB = 35829.532239073305
GOLDEN_TOTAL_REM = 17254.32342570709
GOLDEN_PVI = [  # (PK, Z)
    (0.0, 780.442408875594),
    (1689.982, 774.9696911290338),
    (1819.173, 775.3622838400008),
    (1995.802, 781.5631376897846),
    (2131.576, 786.3297066755681),
    (2316.962, 782.2371236869836),
    (2589.546, 773.0554368670573),
]


def test_build_design_matches_golden(axe_path, terrain_path, tmp_path):
    cfg = deepcopy(REFT_CAT_1)
    cfg.cartouche.company_name = "Golden"
    d = build_design(cfg, axe_path, terrain_path, tmp_path,
                     return_design=True)["design"]
    # Main itself differs by rel 5.0e-4 in Σ and up to 9e-4 m in PVI Z between x86_64 and
    # aarch64 (B-20261127-10): SLSQP on Σ|Δz| amplifies ULP-level differences.
    np.testing.assert_allclose(d.cubatures.total_deb, GOLDEN_TOTAL_DEB, rtol=5e-3)
    np.testing.assert_allclose(d.cubatures.total_rem, GOLDEN_TOTAL_REM, rtol=5e-3)
    pvi = np.asarray(d.v_align.pvi, dtype=float)
    golden = np.asarray(GOLDEN_PVI)
    assert pvi.shape == golden.shape
    np.testing.assert_allclose(pvi[:, 0], golden[:, 0], rtol=0, atol=1e-6)
    np.testing.assert_allclose(pvi[:, 1], golden[:, 1], rtol=0, atol=0.01)
