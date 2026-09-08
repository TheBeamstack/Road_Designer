// SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com>
// SPDX-License-Identifier: LicenseRef-BCL-1.1

/**
 * Persistent attribution footer.
 *
 * Satisfies LICENSE Section 3.7(b): a legible "Powered by Beamstack" credit,
 * linked to https://beam-stack.com, sitting where a user looks for credits
 * (a persistent application footer). Rendered once, at the bottom of the app
 * layout (see App.tsx).
 *
 * Uses the real Beamstack brand kit (beamstack-licensing/brand/, mirrored at
 * the repo-root brand/ and src/assets/beamstack-mark-full.svg) — the
 * on-white full mark, standalone SVG with explicit hex fills (no
 * currentColor / CSS custom properties, per the kit's own file contract).
 * Minimum size per the kit is 40px; rendered here at 44px.
 */
import beamstackMarkUrl from "@/assets/beamstack-mark-full.svg";

const BEAMSTACK_URL = "https://beam-stack.com";

export function SiteFooter() {
  return (
    <footer className="border-t border-navy/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div
          dir="rtl"
          className="mx-auto max-w-md border-r-2 border-signal/50 pr-3 text-right"
          aria-label="Sourate Taha 20:114"
        >
          <div className="font-display text-base text-ink">وَقُل رَّبِّ زِدْنِي عِلْمًا</div>
          <div dir="ltr" className="mt-1 text-xs text-muted">
            « Seigneur, accrois-moi en science. » — Sourate Taha, 20:114
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-navy/10 pt-5 sm:flex-row">
          <a
            href={BEAMSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Powered by Beamstack — opens beam-stack.com in a new tab"
            className="group inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2"
          >
            <img src={beamstackMarkUrl} alt="" className="h-11 w-11" />
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-muted">Powered by</span>
              <span className="font-display text-lg font-bold text-navy group-hover:text-signal">
                Beamstack
              </span>
            </span>
          </a>
          <span className="font-mono text-xs text-muted">Road Designer v{__APP_VERSION__}</span>
        </div>
      </div>
    </footer>
  );
}
