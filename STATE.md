# STATE — Road_Designer, rendered from `state.json` by scripts/state.py; never edited by hand

next: blocked: depends on T-006 (claimed) — T-007

## Claims

- T-006 zayd on task/T-006-build-design-on-the-samples-runs-faster

## Review

none

## Awaiting approval (R93)

none

## BLOCKED

- T-007 — depends on T-006 (claimed)

## Open blockers

- B-20261127-09 PR #17 (T-006) CI verify red: tests/test_build_golden.py's pinned Σ Déblai 35829.532239 is box-only, CI run 45947844286 gets 35799.377216 (rel 8.4e-4) — need: builder: zayd, make T-006's golden test in tests/test_build_golden.py pass on CI's x86_64 runner as well as on box at rtol 1e-9, then finish T-006 with --continue
