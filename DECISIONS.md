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
