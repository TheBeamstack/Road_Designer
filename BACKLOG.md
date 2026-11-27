# BACKLOG — Road_Designer, rendered from `state.json` by scripts/state.py; never edited by hand

## Tasks

| Task | Status | Title | Area | Machine | Risk | Depends on |
|---|---|---|---|---|---|---|
| T-001 | ready | The backend answers CORS only for https://rd.beam-stack.com unless ALLOWED_ORIGIN says otherwise | backend | any | normal | — |

### T-001 — The backend answers CORS only for https://rd.beam-stack.com unless ALLOWED_ORIGIN says otherwise
- outcome: backend/app/main.py defaults ALLOWED_ORIGIN to https://rd.beam-stack.com instead of *, so an unset variable fails closed; local dev sets it explicitly
- implements: docs/INVARIANTS.md §15 backend/ — FastAPI service (the CORS bullet)
- done-when: with ALLOWED_ORIGIN unset, a GET /health carrying Origin: https://rd.beam-stack.com gets access-control-allow-origin: https://rd.beam-stack.com, pinned by a test in backend/tests/
- done-when: with ALLOWED_ORIGIN unset, a GET /health and an OPTIONS preflight carrying Origin: https://evil.example get no access-control-allow-origin header, pinned by a test in backend/tests/
- done-when: with ALLOWED_ORIGIN='https://a.example,https://b.example' both origins are allowed and a third is not, pinned by a test in backend/tests/
- done-when: the TODO(user) comment and module docstring in backend/app/main.py name the new default and no longer say the default is *
- done-when: bash scripts/verify.sh is green
- verify: bash scripts/verify.sh
- depends-on: — · area: backend · machine: any · risk: normal
- milestone: M-roaddesigner-01

## Discovered


## Parked

