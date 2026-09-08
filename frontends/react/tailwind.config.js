/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Road Designer's own palette — an "engineering drawing" system, not a
        // copy of either the old flat red/navy or Beamstack's own blue/night
        // identity. `navy`/`ink`/`muted`/`panel` keep their original names (so
        // existing className usage across the app didn't need a rewrite) but
        // are retuned; `signal` is new. See brand/README.md for the separate,
        // real Beamstack brand kit used for attribution only.
        navy: "#1E2430", // structural chrome — headers, primary headings
        ink: "#191C22", // body text — near-black graphite, not flat #000
        accent: {
          // "Ligne rouge" red — the product's own domain colour (DXF PROJECT
          // layer, REFT red-line convention), refined from the old flat
          // #d92727 into a deeper, less alarm-toned vermillion.
          DEFAULT: "#B23A26",
          50: "#FBF1EF",
        },
        signal: {
          // Beamstack's own documented "Deep blue" (light-ground variant,
          // beamstack-licensing/brand/README.md) — reused as-is for secondary
          // actions/links/info states, so the product ties back to the studio
          // without adopting blue as its primary identity.
          DEFAULT: "#2563D8",
          50: "#EFF4FD",
        },
        muted: "#5B6472",
        panel: "#F3F1EC", // warm "paper" tint — page background, not pure white
      },
      fontFamily: {
        // Beamstack's documented type system (beamstack-licensing/brand/README.md)
        // — Archivo for display/headings, IBM Plex Sans for body, IBM Plex Mono
        // for technical data (PK values, filenames, coordinates).
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Archivo", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
