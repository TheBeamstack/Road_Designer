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

- B-20261127-01 agent_start.py refuses every non-steward turn: docs/CURRENT_STATE.md (.agent.toml [paths] state) is missing on main, as are docs/BACKLOG.md and docs/DECISIONS.md; reviews of PR #10, #8, #7, #5 cannot start — need: steward: commit docs/CURRENT_STATE.md, the path .agent.toml [paths] state names, to Road_Designer main so agent_start.py --seat hmdnah --review can run
