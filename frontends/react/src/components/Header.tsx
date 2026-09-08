export function Header() {
  return (
    <header className="border-b border-navy/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-7">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Road Designer
          </h1>
          <span className="font-mono text-sm text-muted">V 1.0</span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          Génération de livrables BET (DXF + XLSX + PDF) à partir d'un fichier axe et d'un MNT.
          Standards REFT (Maroc). Toutes les annotations sont en français.
        </p>
      </div>
    </header>
  );
}
