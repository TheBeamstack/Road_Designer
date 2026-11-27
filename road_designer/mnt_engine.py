"""Terrain model: TIN interpolation + KDTree nearest-neighbour fallback."""
from __future__ import annotations

from pathlib import Path
from typing import Union

import numpy as np
import pandas as pd
from scipy.interpolate import LinearNDInterpolator
from scipy.spatial import cKDTree


class TerrainModel:
    """Load a CSV with columns X, Y, Z and build a continuous surface.

    Inside the convex hull, linear interpolation on the Delaunay TIN is used.
    Outside, the nearest-neighbour Z is returned (with a one-time warning per
    out-of-hull query — useful for catching alignment that strays beyond MNT
    coverage).
    """

    def __init__(self, csv_file: Union[str, Path]):
        self.data = pd.read_csv(csv_file)
        missing = {"X", "Y", "Z"} - set(self.data.columns)
        if missing:
            raise ValueError(
                f"Terrain CSV must have columns X, Y, Z. Missing: {missing}"
            )
        self.points = self.data[["X", "Y"]].values
        self.z = self.data["Z"].values
        self.interpolator = LinearNDInterpolator(self.points, self.z)
        self.tree = cKDTree(self.points)

    def query_z(self, x: float, y: float) -> float:
        """Return interpolated Z at (x, y). Falls back to nearest neighbour
        outside the TIN convex hull."""
        z = self.interpolator(x, y)
        if np.isnan(z):
            dist, idx = self.tree.query([x, y])
            z = self.z[idx]
            print(
                f"Warning: ({x:.3f}, {y:.3f}) outside terrain hull, "
                f"using nearest Z={z:.3f} (d={dist:.2f} m)"
            )
        return float(z)

    def query_z_many(self, xs, ys) -> np.ndarray:
        """Vectorised ``query_z``: same values, same per-point fallback and
        warning, in one interpolator call."""
        xs = np.asarray(xs, dtype=float)
        ys = np.asarray(ys, dtype=float)
        z = np.asarray(self.interpolator(xs, ys), dtype=float).copy()
        for i in np.flatnonzero(np.isnan(z)):
            dist, idx = self.tree.query([xs[i], ys[i]])
            z[i] = self.z[idx]
            print(
                f"Warning: ({xs[i]:.3f}, {ys[i]:.3f}) outside terrain hull, "
                f"using nearest Z={z[i]:.3f} (d={dist:.2f} m)"
            )
        return z

    @property
    def bounds(self):
        """(xmin, ymin, xmax, ymax) of the terrain point cloud."""
        return (
            float(self.points[:, 0].min()),
            float(self.points[:, 1].min()),
            float(self.points[:, 0].max()),
            float(self.points[:, 1].max()),
        )
