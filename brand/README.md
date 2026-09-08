# Beamstack brand assets

These assets exist so that people building on Road-Designer can satisfy the
**attribution requirement** in [`../LICENSE`](../LICENSE) Section 3.7. They are
**not** placed in the public domain — see "Usage rules" below.

Mirrored from the canonical kit at `beamstack-licensing/brand/` (org-wide
policy repo) — that repo is the source of truth; if the two ever drift,
re-sync from there rather than editing hex values here by hand.

## Files

| File | Purpose |
|---|---|
| `beamstack-logo.svg` | The full mark, on-white colourway — this is what a light-background UI (like Road Designer's) should use. Identical to `mark-full-on-white.svg`. |
| `mark-full-on-night.svg` | The full mark, on-night colourway — for dark grounds only. |
| `mark-40px.svg` | The full mark at its practical size floor (40px). |
| `mark-16px-reduced.svg` | The reduced mark (drops the chevron + stack, keeps beam/support/roller) — favicons, 16px chrome. |
| `wordmark.svg` | **Beam** (Paper white) + **stack** (Signal blue) lockup, Archivo 700 — dark grounds only. |

All standalone SVGs — explicit hex fills, no `currentColor`, no CSS custom
properties.

## The Attribution Mark

Per `LICENSE` Section 1.17, the Attribution Mark is **either**:

- the text **`Powered by Beamstack`**, or
- the Beamstack logo in this folder / as published at <https://beam-stack.com>.

Using the plain text is always acceptable. Use the logo where a graphical
credit fits better (splash screens, footers with other logos, etc.).

## Colours

| Name | Hex | Role |
|---|---|---|
| Night | `#0B0E13` | Dark grounds — avatar, hero panels, social cards |
| Signal blue | `#4C8DFF` | Chevron/beam on dark grounds |
| Paper white | `#E8EDF4` | Stack/supports/type on dark |
| Deep blue | `#2563D8` | The mark and links on **white** grounds |

`#4C8DFF` reaches only ~2.6:1 contrast on white (below WCAG AA's 4.5:1 for
text) — light grounds use `#2563D8` instead. Same hue family, no visible seam
between the two contexts.

The wordmark reads **Beam** (Paper white) + **stack** (Signal blue) — dark
grounds only; use `beamstack-logo.svg` (the mark alone) on light grounds.

## Which variant on which ground

| Ground | Use |
|---|---|
| Night `#0B0E13` or other dark surface | `mark-full-on-night.svg`, `wordmark.svg` |
| White or other light surface | `beamstack-logo.svg` (= `mark-full-on-white.svg`) |
| ≤40px on a light surface (favicons, chrome) | `mark-40px.svg`, or `mark-16px-reduced.svg` below 40px |

Do not place the on-night variant on a light ground or vice versa — the fills
are chosen per-ground for contrast, not decoration.

## Clear space and minimum size

- **Minimum size:** 40px for the full mark; below that, use
  `mark-16px-reduced.svg` rather than scaling the full mark down further.
- **Clear space:** one stack-bar's height (5.5 of the 64-unit grid, ≈ 8.6% of
  the mark's width) of empty margin on all sides.

## Usage rules (from `LICENSE` Section 3.7(e))

**You may** use the mark **only** to give the credit the licence requires:

- Show it on an About / Credits / Legal screen, an app footer, a splash screen,
  or an equivalent docs page — legibly, no smaller or less prominent than other
  third-party credits shown there.
- Link it to <https://beam-stack.com> where links are supported.
- Say your work is "based on Beamstack software" / "Powered by Beamstack".

**You may not:**

- use "Beamstack" or a confusingly similar term as, or within, the name of your
  own product, service, or organisation;
- imply Beamstack endorses, sponsors, or is affiliated with your work;
- alter, recolour, distort, or rebuild the logo;
- use the mark for any purpose beyond the required attribution.

For anything else — including a co-branding or partnership arrangement, or a
waiver of the attribution requirement — contact **askdaoudi@gmail.com**.

## Trademark status

"Beamstack" is a word mark registered with **OMPIC** (Office Marocain de la
Propriété Industrielle et Commerciale, Kingdom of Morocco). The logo is an
unregistered mark of Beamstack. Beamstack is the umbrella for a family of
projects in the AEC (architecture, engineering, construction) industry;
Road-Designer is one of them.
