# Current state

Claims and `## BLOCKED` are the STATE.md view on this lane's `diwan-state` branch (`state.py show`).

## Phase

Release R-roaddesigner-01 (V1.0.0); M-roaddesigner-01's rows are done and its `owner:` checks remain, and M-roaddesigner-02 (progress, speed, keep-alive timer) is in progress (`docs/MILESTONES.toml`).

## What works

- The engine builds DXF, XLSX and both PDFs from an axe file and a terrain CSV (`build_design`, docs/INVARIANTS.md §4).
- Three surfaces run on it: the CLI, the Streamlit app, and the React SPA with its FastAPI backend (§15).
- CI runs `scripts/verify.sh` (engine and backend tests, then the React build) on every PR and on main.
- The backend allows CORS only for `https://rd.beam-stack.com` while `ALLOWED_ORIGIN` is unset (T-001).
- Every doc names `rd.beam-stack.com` as the SPA's origin; `*.pages.dev` appears only as the Cloudflare fallback (T-002).
- The Streamlit app is declared frozen and shows a notice pointing to `rd.beam-stack.com` (T-003).

## What is broken or absent

- Generation shows no stage-by-stage progress (T-004, T-005), is slower than it needs to be (T-006, T-007), and the keep-alive is a GitHub workflow (T-008).

## What is next

T-004, which T-005, T-006 and T-008 depend on; T-007 follows T-006.
