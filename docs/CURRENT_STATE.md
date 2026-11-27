# Current state

Claims and `## BLOCKED` are the STATE.md view on this lane's `diwan-state` branch (`state.py show`).

## Phase

Release R-roaddesigner-01 (V1.0.0); active milestone M-roaddesigner-01, ship-ready (`docs/MILESTONES.toml`).

## What works

- The engine builds DXF, XLSX and both PDFs from an axe file and a terrain CSV (`build_design`, docs/INVARIANTS.md §4).
- Three surfaces run on it: the CLI, the Streamlit app, and the React SPA with its FastAPI backend (§15).
- CI runs `scripts/verify.sh` (engine and backend tests, then the React build) on every PR and on main.
- The backend allows CORS only for `https://rd.beam-stack.com` while `ALLOWED_ORIGIN` is unset (T-001).

## What is broken or absent

- The docs do not all name `rd.beam-stack.com` as the SPA's origin yet; T-002 (PR #13) fixes that.
- The Streamlit app is not declared frozen; T-003 does that.
- Generation shows no stage-by-stage progress, and the keep-alive is a GitHub workflow (M-roaddesigner-02, not yet decomposed).

## What is next

Review of T-002 (PR #13), then T-003.
