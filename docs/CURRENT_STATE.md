# Current state

Claims and `## BLOCKED` are the STATE.md view on this lane's `diwan-state` branch (`state.py show`).

## Phase

Release R-roaddesigner-01 (V1.0.0); active milestone M-roaddesigner-01, ship-ready (`docs/MILESTONES.toml`).

## What works

- The engine builds DXF, XLSX and both PDFs from an axe file and a terrain CSV (`build_design`, docs/INVARIANTS.md §4).
- Three surfaces run on it: the CLI, the Streamlit app, and the React SPA with its FastAPI backend (§15).
- CI runs `scripts/verify.sh` (engine and backend tests, then the React build) on every PR and on main.

## What is broken or absent

- The backend's CORS default is `*` (`backend/app/main.py`); T-001 locks it.
- The docs name `road-designer.beam-stack.com`, not `rd.beam-stack.com`; T-002 fixes that.
- The Streamlit app is not declared frozen; T-003 does that.
- Generation shows no stage-by-stage progress, and the keep-alive is a GitHub workflow (M-roaddesigner-02, not yet decomposed).

## What is next

T-001, then T-002 and T-003 in turn.
