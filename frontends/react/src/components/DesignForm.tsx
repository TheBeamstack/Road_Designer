import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Section } from "@/components/ui/Section";
import { Stepper, type StepDef } from "@/components/ui/Stepper";
import { fetchSampleFile, sampleFileUrl, ApiError } from "@/lib/api";
import {
  REFT_PRESETS,
  defaultDesignConfig,
  type DesignConfigIn,
  type RoadCategory,
} from "@/lib/types";

export interface DesignFormSubmitPayload {
  axeFile: File;
  terrainFile: File | null;
  config: DesignConfigIn;
}

const STEPS: StepDef[] = [
  { id: 1, label: "Données d'entrée" },
  { id: 2, label: "Géométrie & REFT" },
  { id: 3, label: "Section & mise en page" },
  { id: 4, label: "Cartouche" },
];

export function DesignForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (payload: DesignFormSubmitPayload) => void;
  submitting: boolean;
}) {
  const [step, setStep] = useState(1);
  const [cfg, setCfg] = useState<DesignConfigIn>(defaultDesignConfig());
  const [axeMode, setAxeMode] = useState<"sample" | "upload">("sample");
  const [axeFile, setAxeFile] = useState<File | null>(null);
  const [terrainMode, setTerrainMode] = useState<"sample" | "upload" | "synthetic">("sample");
  const [terrainFile, setTerrainFile] = useState<File | null>(null);
  const [resolvingSamples, setResolvingSamples] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);

  const companyOk = cfg.cartouche.company_name.trim().length > 0;
  const axeOk = axeMode === "sample" || axeFile !== null;
  const terrainOk = terrainMode !== "upload" || terrainFile !== null;
  // Minimal-input gate for the Generate button — deliberately independent of
  // `step`, so Generate stays clickable from any step the moment the
  // essentials (company name + axe + terrain) are satisfied, exactly as it
  // was before the wizard split the form across steps.
  const readyToRun = companyOk && axeOk && terrainOk && !submitting && !resolvingSamples;

  const missing = useMemo(() => {
    const m: string[] = [];
    if (!companyOk) m.push("nom de l'entreprise (étape 4)");
    if (!axeOk) m.push("fichier axe en plan (étape 1)");
    if (!terrainOk) m.push("CSV terrain (étape 1)");
    return m;
  }, [companyOk, axeOk, terrainOk]);

  function patch(partial: Partial<DesignConfigIn>) {
    setCfg((prev) => ({ ...prev, ...partial }));
  }
  function patchTypical(partial: Partial<DesignConfigIn["typical_section"]>) {
    setCfg((prev) => ({ ...prev, typical_section: { ...prev.typical_section, ...partial } }));
  }
  function patchCartouche(partial: Partial<DesignConfigIn["cartouche"]>) {
    setCfg((prev) => ({ ...prev, cartouche: { ...prev.cartouche, ...partial } }));
  }

  function handleCategoryChange(category: RoadCategory) {
    const preset = REFT_PRESETS[category];
    patch({
      road_category: category,
      r_summit: preset.r_summit,
      r_sag: preset.r_sag,
      max_radius: preset.max_radius,
      max_pente: preset.max_pente,
      min_tangent_length: preset.min_tangent_length,
      min_straight_tangent: preset.min_straight_tangent,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!readyToRun) return;

    setSampleError(null);
    setResolvingSamples(true);
    let resolvedAxeFile: File;
    let resolvedTerrainFile: File | null;
    try {
      resolvedAxeFile =
        axeMode === "sample" ? await fetchSampleFile("axe") : (axeFile as File);
      resolvedTerrainFile =
        terrainMode === "sample"
          ? await fetchSampleFile("terrain")
          : terrainMode === "upload"
            ? terrainFile
            : null;
    } catch (err) {
      setSampleError(
        err instanceof ApiError ? err.message : "Impossible de charger le fichier d'exemple."
      );
      setResolvingSamples(false);
      return;
    }
    setResolvingSamples(false);

    const config: DesignConfigIn = {
      ...cfg,
      synth_terrain:
        terrainMode === "synthetic"
          ? {
              z_base: 780.0,
              slope_long: 0.02,
              amplitude: 4.0,
              wavelength: 600.0,
              noise_sigma: 0.4,
              extent: 60.0,
              perp_step: 5.0,
              pk_step: 5.0,
              seed: 42,
            }
          : null,
      cartouche: { ...cfg.cartouche, company_name: cfg.cartouche.company_name.trim() },
    };

    onSubmit({
      axeFile: resolvedAxeFile,
      terrainFile: resolvedTerrainFile,
      config,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-lg border border-navy/10 bg-white px-4 py-3">
        <Stepper steps={STEPS} current={step} onJump={setStep} />
      </div>

      {/* ── Step 1 — Données d'entrée ─────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Section title="Axe en plan et terrain" defaultOpen>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium text-ink">
                Axe en plan <span className="text-accent">★</span>
              </label>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={axeMode === "sample"}
                    onChange={() => setAxeMode("sample")}
                  />
                  Exemple bundle
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={axeMode === "upload"}
                    onChange={() => setAxeMode("upload")}
                  />
                  Charger un TXT
                </label>
              </div>
              {axeMode === "upload" ? (
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => setAxeFile(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              ) : (
                <p className="text-xs text-muted">
                  Utilise sample_axe.txt fourni avec le dépôt.{" "}
                  <a
                    href={sampleFileUrl("axe")}
                    download="sample_axe.txt"
                    className="font-medium text-signal hover:underline"
                  >
                    Télécharger l'exemple ↓
                  </a>
                </p>
              )}
              <p className="text-xs text-muted">
                Format : PK0 X0 Y0, puis blocs D (droite) / C (courbe, avec XC/YC/R). Voir
                docs/INPUT_FORMAT.md dans le dépôt.
              </p>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium text-ink">Terrain (MNT)</label>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={terrainMode === "sample"}
                    onChange={() => setTerrainMode("sample")}
                  />
                  Exemple bundle
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={terrainMode === "upload"}
                    onChange={() => setTerrainMode("upload")}
                  />
                  Charger un CSV X,Y,Z
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={terrainMode === "synthetic"}
                    onChange={() => setTerrainMode("synthetic")}
                  />
                  Générer synthétique
                </label>
              </div>
              {terrainMode === "upload" ? (
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setTerrainFile(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              ) : terrainMode === "synthetic" ? (
                <p className="text-xs text-muted">
                  Un MNT plausible sera généré côté serveur autour de l'axe (paramètres par
                  défaut).
                </p>
              ) : (
                <p className="text-xs text-muted">
                  Utilise sample_terrain.csv fourni avec le dépôt.{" "}
                  <a
                    href={sampleFileUrl("terrain")}
                    download="sample_terrain.csv"
                    className="font-medium text-signal hover:underline"
                  >
                    Télécharger l'exemple ↓
                  </a>
                </p>
              )}
            </div>
          </Section>
        </div>
      )}

      {/* ── Step 2 — Catégorie REFT, géométrie horizontale, ligne rouge ── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <Section title="Catégorie REFT et géométrie horizontale" defaultOpen>
            <Select
              label="Catégorie de route"
              value={cfg.road_category}
              onChange={(e) => handleCategoryChange(e.target.value as RoadCategory)}
            >
              {(Object.keys(REFT_PRESETS) as RoadCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {REFT_PRESETS[cat].label}
                </option>
              ))}
            </Select>
            <Field
              label="Largeur de chaussée [m]"
              type="number"
              step={0.5}
              value={cfg.road_width}
              onChange={(e) => patch({ road_width: Number(e.target.value) })}
              hint="Utilisée pour les bords en plan, les profils en travers et les cubatures."
            />
            <Field
              label="Pas d'échantillonnage [m]"
              type="number"
              step={0.5}
              value={cfg.profile_sampling}
              onChange={(e) => patch({ profile_sampling: Number(e.target.value) })}
            />
          </Section>

          <Section title="Ligne rouge — minima REFT">
            <Field
              label="R minimum sommet [m]"
              type="number"
              step={100}
              value={cfg.r_summit ?? ""}
              onChange={(e) => patch({ r_summit: Number(e.target.value) })}
            />
            <Field
              label="R minimum cuvette [m]"
              type="number"
              step={100}
              value={cfg.r_sag ?? ""}
              onChange={(e) => patch({ r_sag: Number(e.target.value) })}
            />
            <Field
              label="R plafond [m]"
              type="number"
              step={500}
              value={cfg.max_radius ?? ""}
              onChange={(e) => patch({ max_radius: Number(e.target.value) })}
            />
            <Field
              label="Pente maximale [%]"
              type="number"
              step={0.5}
              value={cfg.max_pente ?? ""}
              onChange={(e) => patch({ max_pente: Number(e.target.value) })}
            />
            <Field
              label="Longueur min entre PVI [m]"
              type="number"
              step={10}
              value={cfg.min_tangent_length ?? ""}
              onChange={(e) => patch({ min_tangent_length: Number(e.target.value) })}
            />
            <Field
              label="Longueur min tangente droite [m]"
              type="number"
              step={5}
              value={cfg.min_straight_tangent ?? ""}
              onChange={(e) => patch({ min_straight_tangent: Number(e.target.value) })}
              hint="Distance droite entre la fin d'une courbe verticale et le début de la suivante."
            />
            <Field
              label="Seuil de création de PVI [fraction]"
              type="number"
              step={0.001}
              value={cfg.max_grade_change ?? ""}
              onChange={(e) => patch({ max_grade_change: Number(e.target.value) })}
            />
            <Field
              label="Bande verticale d'optimisation"
              type="number"
              step={0.01}
              min={0.02}
              max={0.4}
              value={cfg.vertical_band_ratio ?? ""}
              onChange={(e) => patch({ vertical_band_ratio: Number(e.target.value) })}
              hint="Fraction de l'amplitude TN dans laquelle SLSQP peut déplacer chaque PVI."
            />
          </Section>
        </div>
      )}

      {/* ── Step 3 — Section type, cubatures, mise en page PDF ──────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <Section title="Section type / cubatures" defaultOpen>
            <Field
              label="Dévers normal [%]"
              type="number"
              step={0.1}
              value={cfg.typical_section.crown_slope_pct}
              onChange={(e) => patchTypical({ crown_slope_pct: Number(e.target.value) })}
            />
            <Field
              label="Largeur accotement [m]"
              type="number"
              step={0.1}
              value={cfg.typical_section.accotement_width}
              onChange={(e) => patchTypical({ accotement_width: Number(e.target.value) })}
            />
            <Field
              label="Pente accotement [%]"
              type="number"
              step={0.1}
              value={cfg.typical_section.accotement_slope_pct}
              onChange={(e) => patchTypical({ accotement_slope_pct: Number(e.target.value) })}
            />
            <Field
              label="Profondeur fossé [m]"
              type="number"
              step={0.1}
              value={cfg.typical_section.ditch_depth}
              onChange={(e) => patchTypical({ ditch_depth: Number(e.target.value) })}
            />
            <Field
              label="Largeur fossé [m]"
              type="number"
              step={0.1}
              value={cfg.typical_section.ditch_width}
              onChange={(e) => patchTypical({ ditch_width: Number(e.target.value) })}
            />
            <Field
              label="Talus déblai H/V"
              type="number"
              step={0.05}
              value={cfg.typical_section.talus_deblai_h_v}
              onChange={(e) => patchTypical({ talus_deblai_h_v: Number(e.target.value) })}
            />
            <Field
              label="Talus remblai H/V"
              type="number"
              step={0.05}
              value={cfg.typical_section.talus_remblai_h_v}
              onChange={(e) => patchTypical({ talus_remblai_h_v: Number(e.target.value) })}
            />
            <Field
              label="Profils en travers : tous les N profils"
              type="number"
              step={1}
              min={1}
              value={cfg.cross_section_step_pk}
              onChange={(e) => patch({ cross_section_step_pk: Number(e.target.value) })}
            />
            <Field
              label="Étendue PT ± [m] (0 = auto)"
              type="number"
              step={0.5}
              min={0}
              value={cfg.cross_section_extent ?? 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                patch({ cross_section_extent: v > 0 ? v : null });
              }}
              hint="Défaut = 1.5 × largeur de chaussée par côté."
            />
          </Section>

          <Section title="Mise en page / PDF">
            <Field
              label="Longueur par planche A1 [m]"
              type="number"
              step={50}
              value={cfg.sheet_length_pk}
              onChange={(e) => patch({ sheet_length_pk: Number(e.target.value) })}
            />
            <Field
              label="Échelle H DXF"
              type="number"
              step={0.1}
              value={cfg.h_scale}
              onChange={(e) => patch({ h_scale: Number(e.target.value) })}
            />
            <Field
              label="Échelle V DXF (exagération)"
              type="number"
              step={1}
              value={cfg.v_scale}
              onChange={(e) => patch({ v_scale: Number(e.target.value) })}
            />
            <Field
              label="PDF DPI"
              type="number"
              step={50}
              min={100}
              max={400}
              value={cfg.pdf_dpi}
              onChange={(e) => patch({ pdf_dpi: Number(e.target.value) })}
            />
            <Field
              label="Plan PDF — Échelle H 1/N (0 = auto)"
              type="number"
              step={100}
              value={cfg.pdf_plan_h_scale ?? 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                patch({ pdf_plan_h_scale: v > 0 ? v : null });
              }}
            />
            <Field
              label="Plan PDF — Échelle V 1/N (0 = auto)"
              type="number"
              step={10}
              value={cfg.pdf_plan_v_scale ?? 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                patch({ pdf_plan_v_scale: v > 0 ? v : null });
              }}
            />
            <Field
              label="PT PDF — Échelle H 1/N (0 = auto)"
              type="number"
              step={10}
              value={cfg.pdf_pt_h_scale ?? 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                patch({ pdf_pt_h_scale: v > 0 ? v : null });
              }}
            />
            <Field
              label="PT PDF — Échelle V 1/N (0 = auto)"
              type="number"
              step={5}
              value={cfg.pdf_pt_v_scale ?? 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                patch({ pdf_pt_v_scale: v > 0 ? v : null });
              }}
              hint="Défaut H 1:100 / V 1:25 sur A4 portrait, avec ajustement auto si trop haut."
            />
          </Section>
        </div>
      )}

      {/* ── Step 4 — Cartouche ───────────────────────────────────────── */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <Section title="Cartouche" defaultOpen>
            <Field
              label="Nom de l'entreprise"
              required
              value={cfg.cartouche.company_name}
              onChange={(e) => patchCartouche({ company_name: e.target.value })}
              hint="Apparaît en gros en haut de chaque page PDF."
              error={!companyOk ? "Requis pour générer les PDFs." : undefined}
            />
            <Field
              label="Projet"
              value={cfg.cartouche.projet}
              onChange={(e) => patchCartouche({ projet: e.target.value })}
            />
            <Field
              label="Maître d'ouvrage"
              value={cfg.cartouche.maitre_ouvrage}
              onChange={(e) => patchCartouche({ maitre_ouvrage: e.target.value })}
            />
            <Field
              label="BET"
              value={cfg.cartouche.bet}
              onChange={(e) => patchCartouche({ bet: e.target.value })}
            />
            <Field
              label="Concepteur"
              value={cfg.cartouche.designer}
              onChange={(e) => patchCartouche({ designer: e.target.value })}
            />
            <Field
              label="N° de plan"
              value={cfg.cartouche.plan_n}
              onChange={(e) => patchCartouche({ plan_n: e.target.value })}
            />
            <Field
              label="Indice"
              value={cfg.cartouche.indice}
              onChange={(e) => patchCartouche({ indice: e.target.value })}
            />
            <Field
              label="Date"
              value={cfg.cartouche.date}
              onChange={(e) => patchCartouche({ date: e.target.value })}
            />
            <Field
              label="Échelle H"
              value={cfg.cartouche.echelle_h}
              onChange={(e) => patchCartouche({ echelle_h: e.target.value })}
            />
            <Field
              label="Échelle V"
              value={cfg.cartouche.echelle_v}
              onChange={(e) => patchCartouche({ echelle_v: e.target.value })}
            />
          </Section>
        </div>
      )}

      {/* Persistent footer — Back/Next navigate steps, but Generate is always
          visible and clickable the moment the minimal inputs are satisfied,
          regardless of which step is showing. */}
      <div className="sticky bottom-0 -mx-1 mt-2 flex flex-col gap-2 border-t border-navy/10 bg-white/95 px-1 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            ← Précédent
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
            disabled={step === STEPS.length}
          >
            Suivant →
          </Button>
        </div>
        <div className="flex flex-col items-stretch gap-1 sm:items-end">
          <Button
            type="submit"
            disabled={!readyToRun}
            className="gap-1.5 sm:w-56"
            title={missing.join(", ")}
          >
            {submitting || resolvingSamples ? (
              <svg viewBox="0 0 16 16" className="h-4 w-4 animate-spin" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" opacity="0.3" />
                <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                <path d="M4 8h7m0 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {submitting
              ? "Génération en cours…"
              : resolvingSamples
                ? "Chargement des exemples…"
                : "Générer"}
          </Button>
          {!readyToRun && !submitting && missing.length > 0 && (
            <p className="text-xs text-accent">Renseignez : {missing.join(", ")}.</p>
          )}
        </div>
      </div>

      {/* Always visible regardless of step — a failed sample fetch (backend
          unreachable, misconfigured VITE_API_BASE_URL, CORS) must never fail
          silently just because the user isn't currently on step 1. */}
      {sampleError && (
        <div className="rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          <p className="font-semibold">Échec du chargement de l'exemple</p>
          <p className="mt-0.5">{sampleError}</p>
        </div>
      )}
    </form>
  );
}
