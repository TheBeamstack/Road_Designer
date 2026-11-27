# TEMPORARY diagnostic (T-006, B-20261127-09): main's engine values on this runner.
from copy import deepcopy
import platform
import sys

import numpy
import scipy

from road_designer.config import REFT_CAT_1
from road_designer.road_design import build_design


def test_diag_platform(axe_path, terrain_path, tmp_path):
    cfg = deepcopy(REFT_CAT_1)
    cfg.cartouche.company_name = "Golden"
    d = build_design(cfg, axe_path, terrain_path, tmp_path, return_design=True)["design"]
    msg = (f"DIAG machine={platform.machine()} py={sys.version.split()[0]} "
           f"numpy={numpy.__version__} scipy={scipy.__version__} "
           f"deb={d.cubatures.total_deb!r} rem={d.cubatures.total_rem!r} "
           f"pvi={[tuple(map(float, p)) for p in d.v_align.pvi]!r}")
    assert False, msg
