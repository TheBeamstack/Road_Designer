# DECISIONS — Road_Designer, rendered from `state.json` by scripts/state.py; never edited by hand

## D-20261127-01 Nothing is ready on box: V1.0.0 waits on two owner permissions
- opened: 2026-11-27T06:35Z
- by: brahim
- item: queue
- asks: whether the lane starts decomposing M-roaddesigner-03 (English UI, consent, newsletter ask) while V1.0.0 waits on the permissions in B-20261127-07 and B-20261127-08
- context: Every remaining V1.0.0 row is held: PR #17 (T-006, faster build) needs the box to allow scripts/bench_build.py under the project venv, and PR #18 (T-008, keep-alive timer) needs it to allow systemd-analyze --user verify; T-007 waits on T-006.
    Granting those two permissions unblocks review at once and is the faster route to V1.0.0, which is due today.
    continue: the steward cuts the first M-roaddesigner-03 rows so builders keep working meanwhile; V1.0.0 still goes first the moment a permission lands.
    hold: the lane builds nothing new until the two permissions are granted.
- options: continue | hold
- default-if-silent: hold
- expires: 2026-12-02
- directions-read: none in force
- ANSWER: hold
- free-text: both permissions (B-20261127-07, B-20261127-08) are granted by the owner 2026-11-27; V1.0.0 first
- answered: 2026-11-27T13:04Z

## D-20261127-02 V1.0.0's rows are done: start building V1.0.1 (M-roaddesigner-03)
- opened: 2026-11-27T21:39Z
- by: brahim
- item: M-roaddesigner-03
- asks: whether the lane starts building M-roaddesigner-03 (English UI, consent banner, privacy notice, newsletter ask) while V1.0.0 waits only on your checks and its tag
- context: Every V1.0.0 row (T-001 to T-008) is merged; what remains is your owner checks in M-roaddesigner-01 and -02 and the v1.0.0 tag, which no box seat can do.
    PR #22 writes the V1.0.1 spec (CLAUDE.md and docs/INVARIANTS.md section 16); two choices in it are mine: the run count stays in the visitor's browser and is never sent to a server, and the newsletter ask shows at most once per browser.
    continue: once PR #22 merges, the steward cuts about 8 rows from section 16 and builders start; all banner, ask and privacy wording ships marked TO-CONFIRM for your approval.
    hold: the lane builds nothing until you finish the V1.0.0 checks.
- options: continue | hold
- default-if-silent: continue
- expires: 2026-12-03
- directions-read: none in force
- ANSWER:
- answered: -
