# STATE — Road_Designer, rendered from `state.json` by scripts/state.py; never edited by hand

next: builder (any) — T-001

## Claims

none

## Review

none

## Awaiting approval (R93)

none

## BLOCKED

- T-002 — depends on T-001 (ready)
- T-003 — depends on T-002 (ready)

## Open blockers

- B-20261127-02 PR #8 vite 8.3.5 fails npm ci: @vitejs/plugin-react 4.7.0 peers vite <=7; branch predates .agent.toml so no review can post — need: steward: close PR #8 and route vite 8 as one change that also bumps @vitejs/plugin-react
- B-20261127-03 PR #7 conflicts with main after #10, and tailwindcss 4.3.3 fails its own build: the PostCSS plugin moved to @tailwindcss/postcss — need: steward: close PR #7 and route Tailwind 4 as a builder task that adds @tailwindcss/postcss and migrates postcss.config.js
