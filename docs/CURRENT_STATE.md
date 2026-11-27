# Current state

Claims and `## BLOCKED` are the STATE.md view on this lane's `diwan-state` branch (`state.py show`).

## Phase

Release R-roaddesigner-01 (V1.0.0): every row of M-roaddesigner-01 and -02 is done; their `owner:` checks and the `v1.0.0` tag remain (`docs/MILESTONES.toml`). M-roaddesigner-03 (V1.0.1) is specified in docs/INVARIANTS.md §16; its rows follow once that section is on main.

## What works

- The engine builds DXF, XLSX and both PDFs from an axe file and a terrain CSV (`build_design`, docs/INVARIANTS.md §4).
- Three surfaces run on it: the CLI, the Streamlit app, and the React SPA with its FastAPI backend (§15).
- CI runs `scripts/verify.sh` (engine and backend tests, then the React build) on every PR and on main.
- The backend allows CORS only for `https://rd.beam-stack.com` while `ALLOWED_ORIGIN` is unset (T-001).
- Every doc names `rd.beam-stack.com` as the SPA's origin; `*.pages.dev` appears only as the Cloudflare fallback (T-002).
- The Streamlit app is declared frozen and shows a notice pointing to `rd.beam-stack.com` (T-003).
- A job reports its stage and PDF page counter, and the SPA shows them (T-004, T-005).
- `build_design` on the samples is faster: vectorised terrain queries and ligne-rouge objective (T-006, T-007).
- A box-1 systemd timer pings `/health` every 20-120 min; the GitHub keep-alive workflow is gone (T-008).

## What is broken or absent

- The SPA is French-only, with no consent banner, privacy notice or newsletter ask (§16).

## What is next

The owner's checks for V1.0.0, then M-roaddesigner-03's rows.
