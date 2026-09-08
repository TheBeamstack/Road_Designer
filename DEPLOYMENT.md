<!-- SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com> -->
<!-- SPDX-License-Identifier: LicenseRef-BCL-1.1 -->

# Deployment Guide

A step-by-step, no-assumed-experience guide to getting all three Road Designer surfaces live:

| Surface | Host | Role |
|---|---|---|
| **Streamlit app** | Streamlit Community Cloud (free) | Always-on, standalone. The fallback that never needs a backend. |
| **FastAPI backend** | **Hugging Face Spaces** (Docker, PRO plan) — **current solution** | The API the React SPA calls. Portable — can be *promoted* to Google Cloud Run later ([Part G](#12-part-g--promoting-the-backend-to-google-cloud-run-later)) if usage outgrows a single flat-rate Space. |
| **React SPA** | Cloudflare Pages (free), served at **`road-designer.beam-stack.com`** | The "product" frontend. Talks to the backend over HTTPS. |

Written for someone doing this for the first time — every click is spelled out. If you get
stuck partway through, jump to [Troubleshooting](#10-troubleshooting), or ask for help with
whatever screen you're on.

> **Why Hugging Face right now?** It's the simplest path to a working backend: one flat **PRO**
> subscription ($9/mo) unlocks Docker Spaces, deploying is a `git push`, and the free `CPU
> Basic` hardware tier is enough for this workload at $0/hour on top of that. The trade-off is
> that `CPU Basic` sleeps after 48 h of inactivity (unconfigurable — [Part E](#7-part-e--keeping-the-backend-awake-sleep--cold-starts)
> covers keeping it warm for free) and there's no scale-to-zero free tier the way Cloud Run has.
> The `Dockerfile` is intentionally host-neutral, so **Part G** documents promoting to Google
> Cloud Run later, if traffic ever grows enough that Cloud Run's free allotment + elastic scaling
> beats HF PRO's flat cost — that switch is designed to take about 20 minutes when the day comes.

---

## Contents

1. [The big picture](#1-the-big-picture)
2. [Before you start](#2-before-you-start)
3. [Part A — Deploy the backend to Hugging Face Spaces](#3-part-a--deploy-the-backend-to-hugging-face-spaces)
4. [Part B — Deploy the frontend to Cloudflare Pages](#4-part-b--deploy-the-frontend-to-cloudflare-pages)
5. [Part C — Close the loop: lock down CORS](#5-part-c--close-the-loop-lock-down-cors)
6. [Part D — Fix the Streamlit Cloud app](#6-part-d--fix-the-streamlit-cloud-app)
7. [Part E — Keeping the backend awake (sleep & cold starts)](#7-part-e--keeping-the-backend-awake-sleep--cold-starts)
8. [Part F — Final end-to-end check](#8-part-f--final-end-to-end-check)
9. [Updating later](#9-updating-later)
10. [Troubleshooting](#10-troubleshooting)
11. [What this costs](#11-what-this-costs)
12. [Part G — Promoting the backend to Google Cloud Run later](#12-part-g--promoting-the-backend-to-google-cloud-run-later)

---

## 1. The big picture

```
  Part A                    Part B                  Part D
┌─────────────┐           ┌───────────┐         ┌─────────────┐
│  Backend    │ ◄──────── │ Frontend  │         │  Streamlit  │
│ (FastAPI,   │  calls    │  (React,  │         │ (standalone,│
│  Hugging    │  its API  │ Cloudflare│         │  own account│
│  Face Space)│           │  Pages)   │         │  and URL)   │
└─────────────┘           └───────────┘         └─────────────┘
```

- **Backend first** — it works standalone (test it in a browser before the frontend exists),
  and the frontend needs its URL as a build-time setting.
- **Frontend second** — needs the backend's URL.
- **Part C loops back** to the backend once, to lock its CORS setting down to the frontend's
  real URL (until then it's wide open, which is fine for getting things working).
- **Streamlit is independent** of the other two — it needs no backend and no other service. If
  the Hugging Face backend is ever asleep or down, the Streamlit app still does everything.

Each surface can be redeployed independently later — only the CORS setting and the frontend's
build-time API URL link the backend and the SPA together.

**One licence thing before you start.** Road Designer is published under the Beamstack
Community License 1.1 (`LICENSE` at the repo root; plain-language summary in `LICENSING.md`).
Deploying it publicly is fine and expected, but the licence asks two small things of every
public deployment, yours included:

1. The `LICENSE`, `NOTICE`, and `THIRD-PARTY-NOTICES.md` files must travel with the code you
   push to Hugging Face — Part A's assembly step copies them in, and the `Dockerfile` `COPY`s
   them into the image.
2. The user-facing surfaces — the React SPA (Part B) and the Streamlit app (Part D) — must show
   a "Powered by Beamstack" credit linked to <https://beam-stack.com>, somewhere a user would
   look for credits (a footer, an About panel, a splash screen). It need not be on every screen.
   The FastAPI backend has no UI, so it only needs point 1.

---

## 2. Before you start

Accounts:

- [ ] **GitHub** — this repository must already be pushed to it (Cloudflare pulls from there).
- [ ] **Hugging Face** — sign up at [huggingface.co/join](https://huggingface.co/join), then
      **upgrade to PRO** ($9/month, cancel any time) — Docker Spaces require it to *create*, even
      on the free `CPU Basic` hardware tier. [Part A](#3-part-a--deploy-the-backend-to-hugging-face-spaces)
      walks through the upgrade.
- [ ] **Cloudflare** — sign up at [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
- [ ] A **Google Cloud** account is **not** needed unless/until you do Part G.

Tools:

- **Git** (you have it — this is a git repo).
- Nothing else — no CLI to install for Part A. Hugging Face Spaces deploy over plain `git push`.

---

## 3. Part A — Deploy the backend to Hugging Face Spaces

This is written assuming you've never used Hugging Face Spaces before — every screen is spelled
out. If you've done this before, skim for the parts specific to this repo (A.5's assembly step,
A.6's licence declaration).

### A.1 — Create a Hugging Face account and subscribe to PRO

1. Sign up at [huggingface.co/join](https://huggingface.co/join) if you don't already have an
   account.
2. Click your profile picture (top-right) → **Settings** → **Billing**, or go directly to
   [huggingface.co/pricing](https://huggingface.co/pricing) and choose **PRO** ($9/month).
   Add a card and confirm the subscription.
3. **Why this is required, precisely:** Hugging Face's own docs state it plainly — *"Gradio and
   Docker Spaces run on compute and require a paid plan to create: PRO for personal accounts,
   Team or Enterprise for organizations."* This gate is on **creating** a Docker Space, not on
   the hardware you then choose. Once you're PRO, the `CPU Basic` hardware tier this backend
   runs on (2 vCPU, 16 GB RAM) is listed at **$0/hour** — so the $9/month is the whole bill for
   this backend, no usage-based surprises on top.

### A.2 — Create the Space

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space) (log in first).
2. Fill in the form:
   - **Owner**: your username.
   - **Space name**: something like `road-designer-api`.
   - **License**: choose **Other**. Road Designer is under the Beamstack Community
     License 1.1, which isn't in Hugging Face's licence list; you'll declare it properly in the
     Space's `README.md` in A.6. (The dropdown doesn't affect how the Space runs — it just
     shouldn't misreport the licence as MIT/Apache/etc.)
   - **Select the Space SDK**: choose **Docker**.
   - **Docker template**: choose the **Blank** template (you'll replace its placeholder files
     in A.5).
   - **Space hardware**: **CPU basic** (the free-of-hourly-cost tier — available to you now
     that you're PRO).
   - **Visibility**: **Public** is simplest; **Private** also works if you'd rather the code
     not be visible on huggingface.co (the FastAPI backend has no UI either way, so there's
     little upside to Public beyond simplicity).
3. Click **Create Space**.

You now have an empty Space at `https://huggingface.co/spaces/<your-username>/<space-name>`,
with an auto-generated `README.md` (it already contains the metadata Hugging Face needs — don't
delete it, you'll edit it in A.6) and a placeholder `Dockerfile`.

### A.3 — Get a write access token

Hugging Face Spaces are git repositories — you push code to them like any other git remote. To
push over HTTPS you need a token (not your account password):

1. Click your profile picture (top-right) → **Settings** → **Access Tokens**.
2. Click **New token** (or **Create new token**).
3. Name it something like `road-designer-deploy`, set **Type** to **Write**.
4. Click **Create**, then **copy the token somewhere safe** — it's shown only once. You'll paste
   it as the git password in A.5.

### A.4 — Why this needs a small assembly step

Hugging Face's Docker SDK requires the `Dockerfile` to sit at the **root** of the Space's own
git repository, with `road_designer/`, `samples/`, and `backend/` as *siblings* it can `COPY` in
(see the repo-root `Dockerfile` and `CLAUDE.md` § 15 for the full reasoning). That's already true
of *this* repo's layout — but the Space is a **separate** git repository from your GitHub repo,
so you can't just point Hugging Face at GitHub and expect it to pick the right subset of files.

So instead of pushing this whole monorepo as-is (which would also drag `frontends/react/`,
`docs/`, `tests/`, etc. into the image unnecessarily), you'll push a **separate clone of the
Space**, containing just `road_designer/`, `samples/`, `backend/`, the Notice Files, and the
`Dockerfile`. This is a one-time setup; updating later (§ 9) is the same handful of commands run
again.

### A.5 — Assemble and push

Run this from a terminal, **outside** your `Road_Designer` project folder (anywhere is fine —
this creates a new folder next to it):

```bash
git clone https://huggingface.co/spaces/YOUR_HF_USERNAME/road-designer-api road-designer-space
cd road-designer-space

# adjust this path to wherever your Road_Designer project actually lives
PROJECT=/path/to/Road_Designer

cp -r "$PROJECT/road_designer" ./road_designer
cp -r "$PROJECT/samples"       ./samples
cp -r "$PROJECT/backend"       ./backend
cp -r "$PROJECT/brand"         ./brand
cp "$PROJECT/Dockerfile" "$PROJECT/LICENSE" "$PROJECT/NOTICE" "$PROJECT/THIRD-PARTY-NOTICES.md" ./

git add -A
git commit -m "Deploy Road Designer API"
git push
```

When `git push` asks for credentials:
- **Username**: your Hugging Face username.
- **Password**: paste the **access token** from A.3 (not your account password).

Hugging Face starts building the Docker image as soon as it receives the push — watch progress
on the Space page's **Logs** tab. The first build takes a few minutes (installing
numpy/scipy/matplotlib).

### A.6 — Declare the licence on the Space

The Space came with an auto-generated `README.md` whose top block (between two `---` lines) is
Hugging Face front-matter. Open it (in the Space's own repo you just pushed to, or edit directly
on huggingface.co) and add these lines inside that block, leaving the rest (`title`, `sdk:
docker`, etc.) as-is:

```yaml
license: other
license_name: beamstack-community-license-1.1
license_link: LICENSE
```

Optionally add a body line below the front-matter: `Powered by Beamstack — source:
https://github.com/<you>/<repo>`. Commit and push this file the same way as A.5 (no UI badge is
needed here — the backend itself has no UI).

### A.7 — Test it

Once the Space page shows **Running** (check the **App** tab, or the **Logs** tab for build
progress), its URL is:

```
https://YOUR_HF_USERNAME-road-designer-api.hf.space
```

(Hugging Face lower-cases and hyphenates the username/space-name pair automatically — the exact
URL is also shown at the top of the Space's **App** tab.)

Open in a browser:

- `https://YOUR-SPACE-URL/health` → `{"status":"ok"}`
- `https://YOUR-SPACE-URL/docs` → FastAPI's Swagger UI

**Write this URL down** — Part B needs it.

### A.8 — About sleep on `CPU Basic`

Hugging Face's own docs are explicit: *"On free hardware, your Space will 'go to sleep' and stop
executing after a period of time if unused."* For `CPU Basic` specifically, that period is a
**fixed 48 hours of inactivity, and it is not configurable** (only paid/upgraded hardware tiers
allow a custom sleep timeout, or no sleep at all). This is a property of the **hardware tier**,
not of your PRO subscription — being PRO does not by itself stop `CPU Basic` from sleeping.

That's fine — [Part E](#7-part-e--keeping-the-backend-awake-sleep--cold-starts) covers keeping it
warm for free with a scheduled ping, which is the opposite advice from what this guide used to
give for Cloud Run (where keeping an instance warm costs money). On HF `CPU Basic`, keeping it
warm costs nothing extra beyond the flat PRO subscription.

---

## 4. Part B — Deploy the frontend to Cloudflare Pages

### B.1 — Create the Pages project

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com).
2. Left sidebar → **Workers & Pages**.
3. **Create** → the **Pages** tab → **Connect to Git**.
4. Authorise Cloudflare for your GitHub account if prompted, then pick this repository.

### B.2 — Configure the build

Cloudflare needs to know the React app lives in a subfolder:

| Field | Value |
|---|---|
| Project name | anything, e.g. `road-designer` (becomes part of your `*.pages.dev` URL) |
| Production branch | `main` |
| Framework preset | **Vite** (or **None** — the build command is explicit either way) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Root directory** | **`frontends/react`** ← the monorepo setting, don't skip it |

### B.3 — Set the backend URL

Cloudflare builds immediately after you save — let it, but the app can't reach the backend
until you set the URL:

1. Pages project → **Settings** → **Environment variables**.
2. Add, for **both Production and Preview**:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: your Hugging Face Space URL from A.7, e.g.
     `https://your-username-road-designer-api.hf.space` (no trailing slash).
3. **Deployments** tab → **Retry deployment** (or push any commit) to rebuild.

**`VITE_API_BASE_URL` is baked into the JavaScript at build time**, not read at runtime.
Changing it does nothing until the next build.

### B.4 — Get your URL

The finished deploy gives you `https://road-designer.pages.dev`. Open it — the UI loads, but
submitting a design fails with a CORS error until Part C. That's expected.

### B.5 — Add the custom domain

You'll serve the SPA from **`road-designer.beam-stack.com`**, not the `*.pages.dev` URL.

1. Pages project → **Custom domains** → **Set up a domain** → enter `road-designer.beam-stack.com`
   → **Continue**.
2. If `beam-stack.com` is already managed in this same Cloudflare account, Cloudflare adds the
   DNS record for you — click **Activate domain**. If the domain's DNS lives elsewhere,
   Cloudflare shows a `CNAME` (`road-designer` → `your-project.pages.dev`) to add at your DNS
   provider.
3. Wait for the status to read **Active** (a minute or two; TLS certificate is automatic).

`road-designer.beam-stack.com` is now the SPA's canonical URL. The `*.pages.dev` URL keeps
working — decide in Part C whether to allow it in CORS too.

### B.6 — Check the "Powered by Beamstack" credit is visible

`LICENSE` § 3.7 requires any deployed UI built on Road Designer to show "Powered by Beamstack"
(the text, or the logo in `brand/`), linked to <https://beam-stack.com>, somewhere a user would
look for credits — a footer, an About panel, a splash screen. Not required on every screen.
Confirm it renders; if it's missing, add it to the SPA before treating the deploy as done. This
applies to any fork or third-party deployment too, not just yours.

---

## 5. Part C — Close the loop: lock down CORS

Right now the backend accepts any origin (`ALLOWED_ORIGIN` defaults to `"*"`). Point it at your
SPA's real origin — the custom domain from B.5:

1. Go to your Space → **Settings** → **Variables and secrets** → **New variable**.
2. **Name**: `ALLOWED_ORIGIN`
   **Value**: `https://road-designer.beam-stack.com`
3. Save. The Space rebuilds/restarts with the new variable in a minute or so.

To also allow the `*.pages.dev` fallback (and Cloudflare preview builds), comma-separate the
origins — no spaces, no trailing slashes:

```
https://road-designer.beam-stack.com,https://road-designer.pages.dev
```

The React app at `road-designer.beam-stack.com` can now submit designs.

---

## 6. Part D — Fix the Streamlit Cloud app

The Streamlit app's code moved from `app.py` to `frontends/streamlit/app.py` in the repo
restructure. If it's already deployed on Streamlit Community Cloud, its dashboard likely still
points at the old path — **this is the fix for the app currently not loading**:

1. Go to [share.streamlit.io](https://share.streamlit.io) and log in.
2. Find your app → the **⋮** menu → **Settings**.
3. Under **General**, set **Main file path** to:
   ```
   frontends/streamlit/app.py
   ```
4. Save. The app reboots with the new path.
5. While you're there, confirm the app is tracking the right **repository** and **branch**
   (`main`) — a stale pointer to a fork or old branch produces the same symptom.

If you haven't deployed the Streamlit app yet, point a new Streamlit Cloud app at that same
path from the start.

**Note on `.streamlit/config.toml`:** Streamlit Community Cloud only reads a config file from
the **repository root**, even when the app's entrypoint lives in a subdirectory — a nested
`frontends/streamlit/.streamlit/config.toml` is silently ignored. This repo's config (upload
size cap, theme) now lives at the repo-root `.streamlit/config.toml` for that reason; nothing
further to do here, just don't move it back into the subdirectory.

As with the React SPA (B.6), the Streamlit app must show the "Powered by Beamstack" credit
(`LICENSE` § 3.7) — in the sidebar, the page footer, or an "À propos" expander — linked to
<https://beam-stack.com>. Confirm it's there after the reboot.

---

## 7. Part E — Keeping the backend awake (sleep & cold starts)

As covered in A.8, a Hugging Face Space on `CPU Basic` sleeps after **48 hours of inactivity**,
with no way to configure that timeout on this hardware tier. When asleep, the next request pays
a cold start (container restart + Python imports — expect on the order of tens of seconds, not
minutes) before the app responds normally again.

Unlike this guide's old Cloud Run advice, **keeping this Space warm costs nothing extra** — you
already pay the flat PRO subscription, and `CPU Basic` hours are $0 regardless of how continuously
they're used. So it's safe, and recommended, to use the keep-alive workflow this repo ships:

1. Repo **Settings → Secrets and variables → Actions → New repository secret**.
2. **Name**: `BACKEND_HEALTH_URL`
   **Value**: `https://YOUR-SPACE-URL/health` (from A.7).
3. `.github/workflows/keep-alive-backend.yml` will now ping that URL every ~12 minutes,
   comfortably under the 48-hour sleep window, so the Space effectively never sleeps.

If you'd rather not run the extra GitHub Actions minutes (they're free/cheap on a public repo,
but it's a fair thing to skip), just leave the secret unset — the workflow no-ops, and you accept
an occasional cold start on the first request after a quiet stretch. Both are reasonable choices;
the keep-alive ping is the only one that guarantees no cold starts.

---

## 8. Part F — Final end-to-end check

1. Open `https://road-designer.beam-stack.com`.
2. Fill the form — an axe file, a terrain CSV (or the synthetic-terrain option), a REFT
   category, and a **company name** (required — submit stays disabled without it).
3. Submit; watch the job go `queued → running → done` (if the Space had gone to sleep, the first
   submit eats a cold start — give it up to a minute).
4. Download all 4 files (DXF, XLSX, both PDFs); confirm they open.
5. Check the preview tabs (profil en long / Bruckner / tracé en plan) render.
6. Separately, open your Streamlit Cloud URL and confirm it loads and generates a design.
7. Confirm "Powered by Beamstack" is visible on both the SPA and the Streamlit app.

---

## 9. Updating later

Each surface updates differently:

- **Streamlit** and **Cloudflare Pages** auto-redeploy on every push to `main` — nothing to do.
- **Hugging Face Spaces does not auto-deploy from your GitHub repo** — the Space is a separate
  git remote, so after pushing backend or engine changes to GitHub, re-sync and push to the Space:

  ```bash
  cd road-designer-space           # the folder from A.5
  PROJECT=/path/to/Road_Designer

  rsync -a --delete "$PROJECT/road_designer/" ./road_designer/
  rsync -a --delete "$PROJECT/samples/"       ./samples/
  rsync -a --delete "$PROJECT/backend/"       ./backend/
  rsync -a --delete "$PROJECT/brand/"         ./brand/
  cp "$PROJECT/Dockerfile" "$PROJECT/LICENSE" "$PROJECT/NOTICE" "$PROJECT/THIRD-PARTY-NOTICES.md" ./

  git add -A && git commit -m "Update Road Designer API" && git push
  ```

  Environment variables (`ALLOWED_ORIGIN`) persist across pushes — you don't need to re-set them.
  The Space rebuilds automatically on push; watch the **Logs** tab.

*(Want push-to-deploy straight from GitHub without the manual `rsync`? A small GitHub Actions
workflow that pushes the assembled subset to the Space's git remote on every push to `main` is a
reasonable follow-up if this becomes a chore — not set up here to keep the first deploy simple.)*

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `git push` to the Space asks for credentials and rejects them | Used your HF account password instead of a token, or the token has read-only scope | Recheck A.3 — generate a **Write** token and use it as the password |
| Space stuck on "Building" or fails the build | A file is missing from the assembled push (e.g. forgot `backend/requirements.txt`) | Check the Space's **Logs** tab for the exact pip/Docker error; recheck A.5's file list |
| Space shows "Runtime error" after building | Usually an import error or missing env var at startup | **Logs** tab shows the traceback; test the same image locally first with `docker build -t road-designer-api . && docker run --rm -p 8000:7860 road-designer-api` |
| Browser console shows a CORS error when submitting | `ALLOWED_ORIGIN` doesn't match the Pages URL exactly | Recheck Part C — no trailing slash, exact `https://`, exact hostname |
| Every API call from the SPA hits `localhost` or 404s | `VITE_API_BASE_URL` wasn't set before the last build, or has a typo | Recheck B.3, then trigger a fresh Cloudflare Pages build — it's baked in at build time |
| First request after a while takes ~10–30 s | The Space went to sleep (48 h idle on `CPU Basic`) | Expected if you skipped the keep-alive ping (Part E). Set `BACKEND_HEALTH_URL` to avoid it. |
| Job seems slow on big inputs | 100+ page cross-section PDFs take real time to render | Give it a minute; check the Space's **Logs** tab for progress |
| Creating a Docker Space is blocked / greyed out | Account isn't on PRO yet | Recheck A.1 — the PRO subscription must be active before the Docker SDK option is usable |
| Streamlit app blank / import error after the path change | Main file path not saved, or a stale deploy | Recheck Part D's path string, save again, "Reboot app" from the dashboard |
| Streamlit's upload limit / theme doesn't seem to apply | `.streamlit/config.toml` is in the wrong place | It must be at the **repo root**, not inside `frontends/streamlit/` — see the note in Part D |

---

## 11. What this costs

- **Streamlit Community Cloud** — free for public apps.
- **Cloudflare Pages** — free: unlimited requests and bandwidth for static sites; monthly build
  quota is generous for a project updated a few times a week.
- **Hugging Face PRO** — **$9/month flat**, unlocks the Docker SDK for Spaces. The `CPU Basic`
  hardware tier this backend runs on is listed at **$0/hour**, so the $9/month is the whole
  recurring cost for the backend, independent of how much or how little it's used (barring
  Hugging Face changing that pricing structure again).
- **GitHub Actions** (optional keep-alive ping, Part E) — public repos get free minutes; a
  ping every 12 minutes is a negligible fraction of that allotment.

**When to reconsider Google Cloud Run (Part G).** HF PRO's $9/month is flat regardless of usage.
Cloud Run's free monthly allotment (~50 instance-hours at 1 vCPU/1 GiB) is real, and its
scale-to-zero model means near-zero traffic can genuinely cost $0 — but usage-based billing
past that allotment can add up faster than $9/month if the backend gets sustained real traffic.
If you're ever unsure which is cheaper for your actual usage, that's the moment to read Part G,
not before.

---

## 12. Part G — Promoting the backend to Google Cloud Run later

This is **not** part of the current deployment — it's here for when/if it makes sense to move
off Hugging Face (see [§ 11](#11-what-this-costs) for the "when"). The `Dockerfile` is already
host-neutral (listens on `$PORT`, falls back to `7860`), so this is additive: nothing about
Parts A–F needs to change first, and you can run both backends side by side while cutting over.

### G.1 — Create a project and enable billing

1. Go to the [Google Cloud console](https://console.cloud.google.com).
2. Top bar → the project dropdown → **New Project**. Name it e.g. `road-designer`; note the
   **Project ID** it generates (like `road-designer-472912`) — you'll use it below.
3. Left menu → **Billing** → link a billing account (add a card if you don't have one). Cloud
   Run will refuse to deploy without this even for free-tier usage.
4. *(Optional but recommended)* **Billing → Budgets & alerts → Create budget**: amount `$1`,
   alert at 100 %. You'll get an email long before any real charge.

### G.2 — Point gcloud at your project and enable the APIs

Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) locally, or use
[Cloud Shell](https://shell.cloud.google.com) in your browser (gcloud is pre-installed there).

```bash
gcloud auth login                       # opens a browser; skip in Cloud Shell (already authed)
gcloud config set project YOUR_PROJECT_ID

gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

If you're using Cloud Shell, also get the code there: `git clone` your GitHub repo, then `cd`
into it. If you're local, `cd` into your `Road_Designer` folder.

### G.3 — Deploy

From the **repo root** (the folder containing `Dockerfile`, `road_designer/`, `backend/`) —
note this deploys straight from your main GitHub-tracked working copy, **not** the assembled
`road-designer-space` folder from Part A:

```bash
gcloud run deploy road-designer-api \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --no-cpu-throttling \
  --max-instances 3 \
  --timeout 600
```

What each flag does:

| Flag | Why |
|---|---|
| `--source .` | Build the image from the repo-root `Dockerfile` (Cloud Build does it; the first run offers to create an Artifact Registry repo — answer **Y**). |
| `--region europe-west1` | Belgium — close to Morocco with full Cloud Run support. `europe-southwest1` (Madrid) is closer still; any region works, free-tier compute is region-independent. |
| `--allow-unauthenticated` | It's a public API. |
| `--memory 1Gi` | scipy + matplotlib rendering a 100-page cross-section PDF needs headroom. `512Mi` works for modest inputs and stretches the free tier further, at some OOM risk. |
| `--no-cpu-throttling` | **Important.** This backend finishes design jobs in a background thread *after* the HTTP response is sent. Without this flag Cloud Run throttles CPU to ~zero once the response is sent and the job stalls. |
| `--max-instances 3` | Caps a runaway bill from a bug or abuse. Plenty for this workload. |
| `--timeout 600` | 10-minute request ceiling. Requests are actually short (submit / poll / download), but big first builds can be slow. |

The build takes a few minutes. When it finishes, gcloud prints a **Service URL** like
`https://road-designer-api-abcdefghij-ew.a.run.app`.

### G.4 — Test it, then cut over

1. `https://YOUR-SERVICE-URL/health` and `/docs` should respond, same as A.7.
2. Update CORS: `gcloud run services update road-designer-api --region europe-west1
   --update-env-vars ALLOWED_ORIGIN=https://road-designer.beam-stack.com` (same value as
   Part C).
3. **Cloudflare Pages → Settings → Environment variables**: change `VITE_API_BASE_URL` to the
   Cloud Run Service URL, then **Retry deployment**.
4. Once the SPA is confirmed working against Cloud Run, either pause or delete the Hugging Face
   Space to stop the PRO-gated Docker Space (downgrading the whole HF account off PRO if nothing
   else on it needs Docker Spaces).

### G.5 — About the free tier and cold starts on Cloud Run

With `--no-cpu-throttling`, Cloud Run bills for the whole time an instance is alive — during
requests, plus ~15 minutes idle before it scales to zero. At 1 vCPU + 1 GiB, the free monthly
allotment (180,000 vCPU-seconds) is about **50 instance-hours per month**. Occasional use stays
well under that.

The trade-off: after it scales to zero, the next request pays a **cold start** (~10–30 s for
this image). That's normal, and — unlike the HF setup in Part E — you should **not** wire up
`.github/workflows/keep-alive-backend.yml` against a `--no-cpu-throttling` Cloud Run service:
keeping it warm 24/7 is billed continuously and would blow the free monthly allotment. Leave the
`BACKEND_HEALTH_URL` secret unset (or pointed at nothing) if you've fully cut over to Cloud Run.

**Updating later, on Cloud Run:** re-run the `gcloud run deploy` command from G.3 after pushing
changes — Cloud Run does not auto-deploy from GitHub either, unless you wire up **Cloud Run →
your service → Set up Continuous Deployment**, which connects it to your GitHub repo via Cloud
Build.
