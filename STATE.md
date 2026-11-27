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

- B-20261127-03 PR #7 conflicts with main after #10, and tailwindcss 4.3.3 fails its own build: the PostCSS plugin moved to @tailwindcss/postcss — need: steward: close PR #7 and route Tailwind 4 as a builder task that adds @tailwindcss/postcss and migrates postcss.config.js
- B-20261127-04 PR #5 source-map-js 1.2.2 is green on a local merge with main but its branch predates .agent.toml and CI, so no review can post or merge — need: steward: have Dependabot rebase PR #5 onto main, then route it back to hmdnah
- B-20261127-05 stop rule: lane roaddesigner, refused twice by agent_start.py: the seat registry docs/seats/README.md is missing. — need: steward: remove what makes agent_start.py refuse in this lane
