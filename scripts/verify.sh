#!/usr/bin/env bash
# The lane's gate (`.agent.toml` [commands] verify) and CI's one step: the engine and backend tests,
# then the React build. The venv lives outside the repo, rebuilt when a requirements file changes.
set -euo pipefail
cd "$(dirname "$0")/.."

VENV="${ROADDESIGNER_VENV:-$HOME/.cache/roaddesigner-venv}"
stamp="$VENV/.requirements.sha256"
want="$(cat requirements.txt backend/requirements.txt | sha256sum | cut -d' ' -f1)"
if [ ! -x "$VENV/bin/python" ] || [ "$(cat "$stamp" 2>/dev/null)" != "$want" ]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q --upgrade pip
  "$VENV/bin/pip" install -q -r backend/requirements.txt
  echo "$want" > "$stamp"
fi
"$VENV/bin/python" -m pytest -q -p no:warnings tests backend/tests

# `tsc -b` rewrites the tracked build caches; put them back unless this change edits them itself.
web=frontends/react
caches=$(git ls-files "$web/*.tsbuildinfo")
dirty=$(git status --porcelain -- $caches)
lock="$web/node_modules/.package-lock.sha256"
want="$(sha256sum "$web/package-lock.json" | cut -d' ' -f1)"
if [ "$(cat "$lock" 2>/dev/null)" != "$want" ]; then
  npm --prefix "$web" ci --no-audit --no-fund
  echo "$want" > "$lock"
fi
npm --prefix "$web" run build
[ -n "$dirty" ] || git checkout -- $caches
