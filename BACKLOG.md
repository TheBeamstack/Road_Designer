# BACKLOG — Road_Designer, rendered from `state.json` by scripts/state.py; never edited by hand

## Tasks

| Task | Status | Title | Area | Machine | Risk | Depends on |
|---|---|---|---|---|---|---|
| T-001 | done | The backend answers CORS only for https://rd.beam-stack.com unless ALLOWED_ORIGIN says otherwise | backend | any | normal | — |
| T-002 | done | Every doc names rd.beam-stack.com as the SPA's origin, and DEPLOYMENT.md Part F proves CORS is locked | spec | any | normal | T-001 |
| T-003 | done | The Streamlit surface is declared frozen and points its users at rd.beam-stack.com | frontend | any | normal | T-002 |
| T-004 | ready | A running design job reports its current stage and, while PDFs render, its page counter | backend | any | normal | — |
| T-005 | blocked | The SPA shows the running job's stage and PDF page counter | frontend | any | normal | T-004 |

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

### T-003 — The Streamlit surface is declared frozen and points its users at rd.beam-stack.com
- outcome: CLAUDE.md and docs/INVARIANTS.md §15 state that frontends/streamlit/ takes no new features, only fixes that keep it running against the engine, and the Streamlit app shows a one-line French notice linking https://rd.beam-stack.com as the maintained app
- implements: docs/INVARIANTS.md §10 (Streamlit Cloud non-negotiables) and §15 (the surfaces table and Why two frontends)
- done-when: §15 of CLAUDE.md and docs/INVARIANTS.md names the Streamlit app as frozen in the surfaces table and says what a change to frontends/streamlit/ may still be
- done-when: frontends/streamlit/app.py renders a French notice with a link to https://rd.beam-stack.com above the generate controls, and touches no other behaviour
- done-when: the Powered by Beamstack credit in frontends/streamlit/app.py is unchanged
- done-when: bash scripts/verify.sh is green
- verify: bash scripts/verify.sh
- depends-on: T-002 · area: frontend · machine: any · risk: normal
- milestone: M-roaddesigner-01

### T-004 — A running design job reports its current stage and, while PDFs render, its page counter
- outcome: build_design takes an optional keyword-only progress callback called at each stage and once per PDF page, and GET /designs/{id} returns the running job's stage, page and pages
- implements: docs/INVARIANTS.md §5 (road_design.py build_design, pdf_direct.py entry points) and §15 (The one engine change; backend/ request lifecycle)
- done-when: build_design(..., progress=None) keeps its current positional and keyword order and its output unchanged when progress is omitted
- done-when: with a progress callback, build_design calls it with a stage name for each of: tracé et ligne rouge, profils en travers, cubatures, DXF, XLSX, PDF plan, PDF profils en travers, and with (page, pages) once per page of each PDF
- done-when: GET /designs/{id} returns optional stage, page and pages fields that are set while the job runs and null when queued
- done-when: a test in tests/ records the callback's calls on the samples and asserts the stage order and that the PT PDF's last call has page == pages; a test in backend/tests/ asserts the three fields exist in GET /designs/{id}
- done-when: §15 of CLAUDE.md and docs/INVARIANTS.md names progress as the second additive build_design kwarg, with the same text in each
- done-when: bash scripts/verify.sh is green
- verify: bash scripts/verify.sh
- depends-on: — · area: backend · machine: any · risk: normal
- milestone: M-roaddesigner-02

### T-005 — The SPA shows the running job's stage and PDF page counter
- outcome: While a job runs, JobStatusPanel shows the stage GET /designs/{id} reports and, during PDF rendering, page k / N, instead of one fixed label
- implements: docs/INVARIANTS.md §15 (frontends/react/: useDesignJob polling, JobStatusPanel)
- done-when: frontends/react/src/lib/types.ts JobStatus carries optional stage, page and pages matching the backend schema
- done-when: JobStatusPanel renders the stage text while status is running and appends page k / N when page and pages are set, and falls back to the current label when stage is null
- done-when: the polling interval in useDesignJob.ts is unchanged at 2000 ms
- done-when: bash scripts/verify.sh is green, including the React build
- verify: bash scripts/verify.sh
- depends-on: T-004 · area: frontend · machine: any · risk: normal
- milestone: M-roaddesigner-02

## Discovered


## Parked

- 2026-11-27 The React app builds on tailwindcss 4 — frontends/react uses tailwindcss 4 with @tailwindcss/postcss, its postcss.config.js and tailwind config migrated, and the UI renders as before · implements: docs/INVARIANTS.md §15 frontends/react/ — Vite + React + TypeScript + Tailwind
- 2026-11-27 The React app builds on vite 8 with a vite-8-compatible @vitejs/plugin-react — frontends/react pins vite 8.x and an @vitejs/plugin-react whose peer range includes it, in one lockfile, and the build output is unchanged in shape · implements: docs/INVARIANTS.md §15 frontends/react/ — Vite + React + TypeScript + Tailwind
