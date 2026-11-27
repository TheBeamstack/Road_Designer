# SPDX-License-Identifier: LicenseRef-BCL-1.1
# SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com>
"""Print build_design's wall time on the bundled samples (best of --runs)."""
from __future__ import annotations

import argparse
import contextlib
import io
import sys
import tempfile
import time
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from road_designer.config import REFT_CAT_1  # noqa: E402
from road_designer.road_design import build_design  # noqa: E402
from road_designer.samples_api import sample_axe_path, sample_terrain_path  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--runs", type=int, default=3)
    args = ap.parse_args()

    times = []
    for _ in range(args.runs):
        cfg = deepcopy(REFT_CAT_1)
        cfg.cartouche.company_name = "Bench"
        with tempfile.TemporaryDirectory() as tmp, \
                contextlib.redirect_stdout(io.StringIO()):
            t0 = time.perf_counter()
            build_design(cfg, sample_axe_path(), sample_terrain_path(), tmp)
            times.append(time.perf_counter() - t0)
    print(f"build_design on samples: best {min(times):.3f} s, "
          f"runs {', '.join(f'{t:.3f}' for t in times)}")


if __name__ == "__main__":
    main()
