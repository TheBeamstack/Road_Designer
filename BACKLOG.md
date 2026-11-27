# BACKLOG — Road_Designer, rendered from `state.json` by scripts/state.py; never edited by hand

## Tasks

| Task | Status | Title | Area | Machine | Risk | Depends on |
|---|---|---|---|---|---|---|
| T-001 | done | The backend answers CORS only for https://rd.beam-stack.com unless ALLOWED_ORIGIN says otherwise | backend | any | normal | — |
| T-002 | done | Every doc names rd.beam-stack.com as the SPA's origin, and DEPLOYMENT.md Part F proves CORS is locked | spec | any | normal | T-001 |
| T-003 | done | The Streamlit surface is declared frozen and points its users at rd.beam-stack.com | frontend | any | normal | T-002 |
| T-004 | claimed | A running design job reports its current stage and, while PDFs render, its page counter | backend | any | normal | — |
| T-005 | blocked | The SPA shows the running job's stage and PDF page counter | frontend | any | normal | T-004 |
| T-006 | blocked | build_design on the samples runs faster with unchanged outputs: no second cross-section pass, vectorised TN queries | backend | any | normal | T-004 |
| T-007 | blocked | The ligne-rouge optimiser evaluates its objective vectorised, so SLSQP finishes faster | backend | any | normal | T-006 |
| T-008 | blocked | A systemd timer kept in deploy/keep-alive/ pings the backend at a random 20-120 min, and the GitHub keep-alive workflow is gone | infra | box | normal | T-004 |

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

### T-006 — build_design on the samples runs faster with unchanged outputs: no second cross-section pass, vectorised TN queries
- outcome: write_dxf reuses the sections build_design computed instead of calling all_sections again, and RoadDesign queries TN for its vertices and dense samples in one vectorised call each
- implements: docs/INVARIANTS.md §4 (data flow), §5 (mnt_engine.py, cross_section.py, dxf_export.py) and §7.3 (cubature run order)
- done-when: dxf_export.py no longer calls all_sections when the design already carries the sections build_design computed, and no longer overwrites design.section_areas
- done-when: TerrainModel offers a vectorised query that returns the same values as query_z point by point, with the same nearest-neighbour fallback and one-time warning outside the hull, pinned by a test comparing both on the samples
- done-when: a test pins Σ Déblai, Σ Remblai and the PVI elevations of build_design on the samples to the values main gives before this change, within 1e-9 relative
- done-when: a committed script scripts/bench_build.py prints build_design's wall time on the samples, and the PR body gives its output on main and on the branch, measured on the same machine
- done-when: bash scripts/verify.sh is green
- verify: bash scripts/verify.sh
- depends-on: T-004 · area: backend · machine: any · risk: normal
- milestone: M-roaddesigner-02

### T-007 — The ligne-rouge optimiser evaluates its objective vectorised, so SLSQP finishes faster
- outcome: RoadDesign._objective evaluates the sum of |Z_projet - Z_TN| over the dense PK grid with a vectorised VerticalAlignment evaluation instead of a Python loop of get_z calls
- implements: docs/INVARIANTS.md §7.1 (PVI optimisation) and §7.2 (parabolic vertical curve)
- done-when: VerticalAlignment offers a vectorised z evaluation over an array of PKs that equals get_z point by point within 1e-9 m on the samples, pinned by a test
- done-when: _objective uses it, and the three SLSQP constraints and maxiter are unchanged
- done-when: on the samples every PVI elevation is within 0.01 m of the values T-006 pinned and Σ Déblai and Σ Remblai within 0.5 %, and the pinning test is updated only within those tolerances
- done-when: the PR body gives python3 scripts/bench_build.py's output on main and on the branch, measured on the same machine, and the branch's is lower
- done-when: bash scripts/verify.sh is green
- verify: bash scripts/verify.sh
- depends-on: T-006 · area: backend · machine: any · risk: normal
- milestone: M-roaddesigner-02

### T-008 — A systemd timer kept in deploy/keep-alive/ pings the backend at a random 20-120 min, and the GitHub keep-alive workflow is gone
- outcome: Road_Designer ships a user-level systemd service and timer that curl the backend's /health with a fresh random delay of 20 to 120 minutes after each run, with install steps for box 1, and .github/workflows/keep-alive-backend.yml is deleted
- implements: docs/INVARIANTS.md §15 (backend/ Keep-alive bullet; Env vars / secrets table) and DEPLOYMENT.md Part E
- done-when: deploy/keep-alive/ holds a .service that curls a health URL read from an environment file with --max-time 20 and a .timer whose OnUnitActiveSec and RandomizedDelaySec give each interval a new random length between 20 and 120 minutes
- done-when: systemd-analyze --user verify passes on both unit files
- done-when: .github/workflows/keep-alive-backend.yml is deleted and git grep -n BACKEND_HEALTH_URL names no GitHub secret
- done-when: §15 of CLAUDE.md and docs/INVARIANTS.md, DEPLOYMENT.md Part E and backend/README.md describe the box timer and its install commands, with CLAUDE.md and docs/INVARIANTS.md carrying the same text
- done-when: bash scripts/verify.sh is green
- verify: bash scripts/verify.sh && systemd-analyze --user verify deploy/keep-alive/*.service deploy/keep-alive/*.timer
- depends-on: T-004 · area: infra · machine: box · risk: normal
- milestone: M-roaddesigner-02

## Discovered


## Parked

- 2026-11-27 The React app builds on tailwindcss 4 — frontends/react uses tailwindcss 4 with @tailwindcss/postcss, its postcss.config.js and tailwind config migrated, and the UI renders as before · implements: docs/INVARIANTS.md §15 frontends/react/ — Vite + React + TypeScript + Tailwind
- 2026-11-27 The React app builds on vite 8 with a vite-8-compatible @vitejs/plugin-react — frontends/react pins vite 8.x and an @vitejs/plugin-react whose peer range includes it, in one lockfile, and the build output is unchanged in shape · implements: docs/INVARIANTS.md §15 frontends/react/ — Vite + React + TypeScript + Tailwind
