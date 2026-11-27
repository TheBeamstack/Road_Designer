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
- B-20261127-10 T-006 done-when 3 cannot hold on x86 and aarch64: main's own build_design differs across platforms — need: steward: rule on T-006 done-when 3, since main's unmodified engine (road_designer/ at main 8c448c7, numpy 2.5.5, scipy 1.18.1, py3.12) gives Σ Déblai 35829.532239073305 / Σ Remblai 17254.32342570709 on box aarch64 (pytest tests/test_zz_diag_platform.py, commit 4f60a6a) and 35811.54864024953 / 17270.515020984356 on CI x86_64 (run 46044297731, same commit), rel 5.0e-4, PVI Z differing from 1e-8 to 9e-4 m, so no single 1e-9 pin can pass on both; the branch's x86 value 35799.377216 (run 45947844286) also differs from main's x86 value, so the SLSQP result on the non-smooth Σ|Δz| objective amplifies ULP-level differences on either platform
