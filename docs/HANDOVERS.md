# HANDOVERS — H- records handed to this repo for its steward to dispose

Append-only, one record per handover. Only `cleared:` is ever edited, by the steward who disposes it
(TheBeamstack/diwan `docs/seats/hamadi.md`, R22).

## H-20261011-09 Road_Designer: Dependabot PR #1 (vite 5.4.21 to 8.2.2, esbuild 0.21.5 dropped) is superseded by PR #2
- opened: 2026-10-11T06:25Z
- by: zayd
- from: Custodianship
- scope: item
- item: PR #1
- what: triage verdict superseded for PR #1, which moves dev-scope vite 5.4.21 to 8.2.2 in frontends/react/package.json and package-lock.json, dropping esbuild 0.21.5 and rollup 4.62.5 for rolldown 1.2.6 and lightningcss 1.33.0; every package version its lockfile sets, PR #2's sets too (H-20261011-10), only placing @rolldown/pluginutils 1.0.1 at the root rather than under rolldown
- why: it fixes all four open alerts, #1 GHSA-67mh-4wv8-2f99 (medium, esbuild <= 0.24.2), #2 GHSA-4w7w-66w2-5vf9 (medium, vite <= 6.4.1), #3 GHSA-fx2h-pf6j-xcff (high, vite <= 6.4.2) and #4 GHSA-v6wh-96g9-6wx3 (medium, vite <= 6.4.2), and PR #2 fixes the same four; it keeps @vitejs/plugin-react 4.7.0, whose peer range `vite ^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0` excludes 8.2.2; MERGEABLE/CLEAN at main 72dd410, no check run on its head fc12784
- evidence: `gh api 'repos/TheBeamstack/Road_Designer/dependabot/alerts?per_page=100'`; `gh api repos/TheBeamstack/Road_Designer/compare/main...fc12784 --jq .merge_base_commit.sha` → 5c54baa, then `gh api -H 'Accept: application/vnd.github.raw' 'repos/TheBeamstack/Road_Designer/contents/frontends/react/package-lock.json?ref=<sha>'` at 5c54baa, fc12784 and 8d21ea7; `gh pr list -R TheBeamstack/Road_Designer --state open --json number,mergeable,mergeStateStatus,files,statusCheckRollup`
- need: close PR #1 unmerged
- cleared: -

## H-20261011-10 Road_Designer: Dependabot PR #2 (vite 5.4.21 to 8.2.2, @vitejs/plugin-react 4.7.0 to 6.1.1) needs product work
- opened: 2026-10-11T06:25Z
- by: zayd
- from: Custodianship
- scope: item
- item: PR #2
- what: triage verdict needs product work for PR #2, which moves dev-scope vite 5.4.21 to 8.2.2 and @vitejs/plugin-react 4.7.0 to 6.1.1 in frontends/react/package.json and package-lock.json, dropping esbuild 0.21.5, rollup 4.62.5 and the @babel tree for rolldown 1.2.6 and lightningcss 1.33.0, so it carries PR #1's whole change (H-20261011-09)
- why: it fixes all four open alerts, #1 GHSA-67mh-4wv8-2f99 (medium, esbuild <= 0.24.2), #2 GHSA-4w7w-66w2-5vf9 (medium, vite <= 6.4.1), #3 GHSA-fx2h-pf6j-xcff (high, vite <= 6.4.2) and #4 GHSA-v6wh-96g9-6wx3 (medium, vite <= 6.4.2), the same four as PR #1, so no alert is fixed by one PR alone and none by neither; a three-major build-toolchain jump that swaps the bundler, with no check run on its head 8d21ea7 and no workflow that builds frontends/react, is a migration, not a bump; vite 6.4.3, outside #2-#4's ranges, depends on esbuild ^0.25.0, outside #1's; MERGEABLE/CLEAN at main 72dd410, whose package-lock.json is unchanged since the merge-base 5c54baa
- evidence: `gh api 'repos/TheBeamstack/Road_Designer/dependabot/alerts?per_page=100'`; `gh api repos/TheBeamstack/Road_Designer/compare/main...8d21ea7 --jq .merge_base_commit.sha` → 5c54baa, then `gh api -H 'Accept: application/vnd.github.raw' 'repos/TheBeamstack/Road_Designer/contents/frontends/react/package-lock.json?ref=<sha>'` at 5c54baa and 8d21ea7; `gh api repos/TheBeamstack/Road_Designer/compare/5c54baa...main --jq '.files[].filename'`; `gh api repos/TheBeamstack/Road_Designer/contents/.github/workflows --jq '.[].name'`; `npm view vite@6.4.3 dependencies.esbuild`
- need: replace PR #2 with a product task that moves vite to at least 6.4.3 and builds frontends/react on it
- cleared: -
