# STATE — Road_Designer, rendered from `state.json` by scripts/state.py; never edited by hand

next: builder (any) — T-002

## Claims

none

## Review

none

## Awaiting approval (R93)

none

## BLOCKED

- T-003 — depends on T-002 (ready)

## Open blockers

- B-20261127-04 PR #5 source-map-js 1.2.2 is green on a local merge with main but its branch predates .agent.toml and CI, so no review can post or merge — need: steward: have Dependabot rebase PR #5 onto main, then route it back to hmdnah
- B-20261127-06 PR #11 vite 8.4.0 fails npm ci: @vitejs/plugin-react@4.7.0 peers vite <=7 — need: steward: close PR #11 and sequence one task that bumps vite to 8 together with a @vitejs/plugin-react release whose peer range includes vite 8
