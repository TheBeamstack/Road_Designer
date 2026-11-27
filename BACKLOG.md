# BACKLOG — Road_Designer, rendered from `state.json` by scripts/state.py; never edited by hand

## Tasks

| Task | Status | Title | Area | Machine | Risk | Depends on |
|---|---|---|---|---|---|---|
| T-001 | ready | The backend answers CORS only for https://rd.beam-stack.com unless ALLOWED_ORIGIN says otherwise | backend | any | normal | — |
| T-002 | blocked | Every doc names rd.beam-stack.com as the SPA's origin, and DEPLOYMENT.md Part F proves CORS is locked | spec | any | normal | T-001 |

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

### T-002 — Every doc names rd.beam-stack.com as the SPA's origin, and DEPLOYMENT.md Part F proves CORS is locked
- outcome: README.md, README.fr.md, DEPLOYMENT.md, CLAUDE.md, docs/INVARIANTS.md, backend/README.md, frontends/react/README.md and frontends/react/.env.example name https://rd.beam-stack.com where they named road-designer.beam-stack.com or a pages.dev origin, and describe the T-001 CORS default
- implements: docs/INVARIANTS.md §15 (Env vars / secrets table, backend/ CORS bullet); DEPLOYMENT.md Part C and Part F (§8)
- done-when: git grep -n 'road-designer.beam-stack.com' -- . ':!docs/MILESTONES.toml' prints nothing
- done-when: every remaining pages.dev mention is described as the Cloudflare fallback, not as the SPA's origin or an ALLOWED_ORIGIN value
- done-when: DEPLOYMENT.md Part F opens https://rd.beam-stack.com and has a curl step showing a request with Origin: https://rd.beam-stack.com gets access-control-allow-origin and one with another Origin gets none
- done-when: the local-dev instructions in CLAUDE.md, docs/INVARIANTS.md and backend/README.md set ALLOWED_ORIGIN for localhost, since the default no longer allows it
- done-when: CLAUDE.md and docs/INVARIANTS.md carry the same text for every section this task edits
- done-when: bash scripts/verify.sh is green
- verify: bash scripts/verify.sh
- depends-on: T-001 · area: spec · machine: any · risk: normal
- milestone: M-roaddesigner-01

## Discovered


## Parked

