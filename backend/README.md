# Road Designer — FastAPI backend

The API layer for the React frontend (`frontends/react/`). Wraps the same
`road_designer.road_design.build_design()` entry point the CLI and Streamlit app use — no
engine logic lives here, only request handling, job tracking, and file streaming.

See the repo root `CLAUDE.md` § 15 ("Deployment architecture — three surfaces") for how this
fits with the other two surfaces, and § 6 for the `DesignConfig` contract this API mirrors.

## Local development

From the **repo root** (not from inside `backend/`) so `road_designer` resolves on the path:

```bash
python -m venv .venv                 # or reuse an existing venv with the root requirements installed
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
ALLOWED_ORIGIN=http://localhost:5173 uvicorn backend.app.main:app --reload
```

Serves on `http://localhost:8000`. Unset, `ALLOWED_ORIGIN` defaults to `https://rd.beam-stack.com` and
refuses every other origin, so local dev sets it to the Vite dev server's origin.

Interactive API docs: `http://localhost:8000/docs` (FastAPI's built-in Swagger UI).

## Running tests

```bash
pip install -r backend/requirements.txt   # includes pytest + httpx
pytest backend/tests/ -q
```

`backend/tests/conftest.py` reuses the repo-root `tests/conftest.py`'s `axe_path` and
`terrain_path` fixtures — running from the repo root matters for that import to resolve.

## API surface

| Method & path | Purpose |
|---|---|
| `GET /health` | Liveness check — also what the `deploy/keep-alive/` timer pings |
| `POST /designs` | Multipart: axe file + (terrain CSV **or** synth-terrain params) + `DesignConfigIn`/`CartoucheInfoIn` JSON. Returns `202` + `{job_id}` immediately; the actual build runs in a background thread. |
| `GET /designs/{id}` | Job status: `queued\|running\|done\|error`, plus REFT warnings and file availability once `done`. |
| `GET /designs/{id}/files/{kind}` | Streams one of `dxf\|xlsx\|pdf_plan\|pdf_pt`. |
| `GET /designs/{id}/preview` | JSON for the React SVG charts: plan axis + edges, TN/projet profile, Bruckner curve. Built from the engine's existing public getters via the `build_design(..., return_design=True)` hook — no new engine computation. |

Validation mirrors the engine's own rules rather than duplicating separate ones: e.g.
`CartoucheInfoIn.company_name` must be non-empty, the same rule `build_design()` already
enforces — it just surfaces as an HTTP `422` instead of a `500` raised from inside the engine.

## Job store — what "in-memory" means here

`backend/app/jobs.py` keeps jobs in a plain process-local dict, run through a
`ThreadPoolExecutor`. There is no external broker (no Celery, no Redis) — a small free-tier
container host has no room for one, and a synchronous design-generation tool doesn't need job
durability across restarts. A background sweep evicts jobs after a 30-minute TTL. **A restart
or redeploy drops every in-flight and completed job** — by design, not as a bug. If this
backend is ever repurposed for something that needs jobs to survive restarts, that's a
different architecture (external queue + storage), not a tweak to this one.

Because the build runs in a background thread *after* the HTTP response is sent, the container
must keep getting CPU while idle-of-requests. On Cloud Run that means deploying with
`--no-cpu-throttling`; other hosts allocate CPU for the instance lifetime by default.

## Docker

```bash
# from the repo root — the Dockerfile lives at the repo root and its build
# context IS the repo root, so road_designer/ and samples/ are copied in
# alongside backend/.
docker build -t road-designer-api .
docker run --rm -p 8000:7860 road-designer-api
# → http://localhost:8000/health
```

The container listens on `$PORT` if set, else `7860` (so Cloud Run / Render / Koyeb / Fly and
Hugging Face Spaces all work with no change).

## Deploying

The full step-by-step is in the repo-root [`DEPLOYMENT.md`](../DEPLOYMENT.md). In short:

- **Current: Hugging Face Spaces** (Part A) — needs a **PRO** plan ($9/mo flat) to create a
  Docker Space at all; the `CPU Basic` hardware it then runs on is $0/hour. SDK = Docker,
  `Dockerfile` at the Space repo's own root (a small assembled subset of this repo is pushed
  there — see Part A.4–A.5), port 7860 auto-selected. Sleeps after 48 h idle on `CPU Basic`
  (unconfigurable) — Part E installs a free keep-alive timer on box 1: a user-level systemd
  service curling `/health` from `deploy/keep-alive/`, re-run every 20–120 min at random:
  ```bash
  mkdir -p ~/.config/systemd/user ~/.config/road-designer
  cp deploy/keep-alive/road-designer-keep-alive.{service,timer} ~/.config/systemd/user/
  cp deploy/keep-alive/keep-alive.env.example ~/.config/road-designer/keep-alive.env  # set the URL
  systemctl --user daemon-reload
  systemctl --user enable --now road-designer-keep-alive.timer
  loginctl enable-linger "$USER"
  ```
- **Later-promotion path: Google Cloud Run** (Part G) — `gcloud run deploy road-designer-api
  --source . --region <r> --allow-unauthenticated --memory 1Gi --no-cpu-throttling` from the
  repo root. Free monthly compute allotment covers light/moderate use; scales to zero. Worth
  reconsidering if sustained traffic makes HF PRO's flat cost no longer the cheaper option.

The Dockerfile is host-neutral, so switching hosts later is: build the same image there,
repoint `VITE_API_BASE_URL` on Cloudflare Pages, re-set `ALLOWED_ORIGIN`.

## Env vars / secrets to fill in after first real deploy

| Where | Name | Set to |
|---|---|---|
| Backend host (HF: Space Variables; Cloud Run if promoted later: `--set-env-vars`) | `ALLOWED_ORIGIN` | The SPA's origin `https://rd.beam-stack.com` (the default when unset); comma-add the `*.pages.dev` URL only to also allow the Cloudflare fallback |
| Cloudflare Pages dashboard | `VITE_API_BASE_URL` | The backend's public URL, no trailing slash (see `frontends/react/README.md`) |
| Box 1, `~/.config/road-designer/keep-alive.env` (optional, recommended) | `BACKEND_HEALTH_URL` | `https://<space>.hf.space/health` — read by the `deploy/keep-alive/` timer to stop the current HF Space from sleeping; free to run there. **Not** for a Cloud Run deployment with `--no-cpu-throttling`. |

## Directory layout

```
backend/
├── app/
│   ├── main.py          ← FastAPI() instance, CORS via ALLOWED_ORIGIN, lifespan-managed cleanup task
│   ├── schemas.py        ← Pydantic DesignConfigIn/TypicalSectionIn/CartoucheInfoIn/SynthTerrainParams
│   ├── jobs.py           ← in-memory job dict + ThreadPoolExecutor runner + 30-min TTL sweep
│   └── routers/
│       ├── designs.py    ← POST /designs, GET /designs/{id}, GET /designs/{id}/files/{kind}
│       ├── preview.py    ← GET /designs/{id}/preview
│       └── health.py     ← GET /health
├── requirements.txt
└── tests/
    ├── conftest.py
    └── test_designs.py
```
