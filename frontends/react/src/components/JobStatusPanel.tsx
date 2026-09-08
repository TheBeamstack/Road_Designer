import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fileDownloadUrl } from "@/lib/api";
import type { JobStatus } from "@/lib/types";

const STATUS_META: Record<JobStatus["status"], { label: string; dot: string }> = {
  queued: { label: "En file d'attente…", dot: "bg-muted" },
  running: { label: "Calcul en cours (ligne rouge, cubatures, DXF, PDF)…", dot: "bg-amber-500 animate-pulse" },
  done: { label: "Terminé", dot: "bg-emerald-500" },
  error: { label: "Erreur", dot: "bg-accent" },
};

const DOWNLOADS: { kind: keyof NonNullable<JobStatus["files"]>; label: string; filename: string }[] = [
  { kind: "dxf", label: "DXF", filename: "road_design.dxf" },
  { kind: "xlsx", label: "XLSX", filename: "tableau_profil_en_long.xlsx" },
  { kind: "pdf_plan", label: "PDF Plan", filename: "plan_par_sections.pdf" },
  { kind: "pdf_pt", label: "PDF Profils en travers", filename: "profils_en_travers.pdf" },
];

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path d="M8 2v8m0 0-3-3m3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 12.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function EmptyStateIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 text-navy/15" fill="none" aria-hidden>
      <rect x="8" y="6" width="28" height="36" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M14 16h16M14 23h16M14 30h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="34" r="9" fill="white" stroke="currentColor" strokeWidth="2" />
      <path d="M34 30v8m-4-4h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function JobStatusPanel({ job }: { job: JobStatus | null }) {
  if (!job) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <EmptyStateIcon />
          <p className="max-w-xs text-sm text-muted">
            Renseignez le formulaire puis cliquez sur « Générer » pour lancer un calcul — le
            statut du job et les téléchargements apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  const meta = STATUS_META[job.status];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} aria-hidden />
        <CardTitle>{meta.label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {job.status === "error" && (
          <p className="rounded-md bg-accent/5 p-3 text-sm text-accent">{job.error}</p>
        )}

        {job.status === "done" && job.files && (
          <div className="grid grid-cols-2 gap-2">
            {DOWNLOADS.map((d) => (
              <a key={d.kind} href={fileDownloadUrl(job.files![d.kind])} download={d.filename}>
                <Button type="button" variant="outline" className="w-full gap-1.5">
                  <DownloadIcon />
                  {d.label}
                </Button>
              </a>
            ))}
          </div>
        )}

        {job.warnings && job.warnings.length > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-800">
              {job.warnings.length} avertissement(s) REFT
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs text-amber-800">
              {job.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
