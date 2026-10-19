# HANDOVERS — H- records handed to this repo for its steward to dispose

Append-only, one record per handover. Only `cleared:` is ever edited, by the steward who disposes it
(TheBeamstack/diwan `docs/seats/hamadi.md`, R22).

## H-20261019-02 Road_Designer: Dependabot alert #5 (source-map-js GHSA-68fv-2mgg-jv7q) is covered by open PR #5
- opened: 2026-10-19T11:43Z
- by: zayd
- from: Custodianship
- scope: item
- item: PR #5
- what: triage verdict covered by an open PR for open alert #5 GHSA-68fv-2mgg-jv7q (CVE-2026-93749, high, development scope, frontends/react/package-lock.json, vulnerable >= 1.0.0, < 1.2.2, first patched 1.2.2), "source-map-js allows event-loop denial of service through indexed source-map section offsets"; of open Road_Designer Dependabot PRs #1, #2 and #5 only PR #5 fixes it, moving the lock's one copy node_modules/source-map-js from 1.2.1 to 1.2.2; not dismissable
- why: the alert API reads `{"created_at":"2026-10-18T12:29:33Z","cve":"CVE-2026-93749","dismissed_at":null,"fixed_at":null,"ghsa":"GHSA-68fv-2mgg-jv7q","manifest":"frontends/react/package-lock.json","number":5,"patched":"1.2.2","pkg":"source-map-js","range":">= 1.0.0, < 1.2.2","scope":"development","severity":"high","state":"open"}`; main 72dd410 locks node_modules/source-map-js at 1.2.1 (dev), inside the range, so it is not dismissable as not affected; its one dependent there is postcss (^1.2.1), satisfied by 1.2.2; PR #5's head 964a5f9 is 1 ahead and 0 behind main, MERGEABLE, and its only file is frontends/react/package-lock.json (+4 -12), which beside the bump adds the root `"license": "SEE LICENSE IN LICENSE"` and drops nine `"peer": true` lines, lockfile metadata only
- evidence: `gh api repos/TheBeamstack/Road_Designer/dependabot/alerts/5`; `gh pr list -R TheBeamstack/Road_Designer --author app/dependabot --state open --json number,title,headRefName,headRefOid,mergeable` → PRs #1, #2, #5; `gh pr diff <n> -R TheBeamstack/Road_Designer` for n = 1, 2, 5 → source-map-js lines change only in PR #5; `gh api -H 'Accept: application/vnd.github.raw' 'repos/TheBeamstack/Road_Designer/contents/frontends/react/package-lock.json?ref=<sha>'` at 72dd410c998c9627c69ef51e6b821b4a0a482517 (1.2.1) and 964a5f935ab265bb8c0ec7bcdb0d8fd07a8501db (1.2.2); `gh api repos/TheBeamstack/Road_Designer/compare/main...964a5f935ab265bb8c0ec7bcdb0d8fd07a8501db` → ahead_by 1, behind_by 0; `npm view source-map-js@1.2.2 version` → 1.2.2
- need: dispose of alert #5 by deciding PR #5, whose merge moves frontends/react's node_modules/source-map-js to 1.2.2
- cleared: -
