import { useState } from "react";
import { Button } from "@/components/ui/Button";

const CONTACT_EMAIL = "Askdaoudi@gmail.com";
const BEAMSTACK_NEWSLETTER_URL = "https://beam-stack.com/#subscribe-form";

export function ContactFooter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const canSend = message.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    const subject = `Idée logicielle — ${name.trim() || "sans nom"}`;
    const body = [
      `Nom / organisme : ${name.trim() || "-"}`,
      `Contact : ${email.trim() || "-"}`,
      "",
      "Qu'est-ce que vous voulez construire ?",
      message.trim(),
    ].join("\n");
    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  return (
    <footer className="mx-auto mt-10 max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 gap-6 border-t border-navy/10 pt-8 lg:grid-cols-2">
        {/* About BeamStack */}
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-signal">
            À propos de BeamStack
          </div>
          <h2 className="font-display text-lg font-bold text-navy sm:text-xl">
            Un logiciel métier à construire ?
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            BeamStack construit des outils d'ingénierie de haut niveau accessibles à toutes les
            équipes. Road Designer transforme un axe en plan et un MNT en livrables BET prêts à
            relire — un exemple d'un workflow répétitif devenu outil métier.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="mailto:Askdaoudi@gmail.com"
              className="inline-flex min-h-9 items-center rounded-md border border-navy/15 bg-white px-3 py-2 text-sm font-semibold text-navy hover:border-signal/60 hover:text-signal"
            >
              {CONTACT_EMAIL}
            </a>
            <a
              href={BEAMSTACK_NEWSLETTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center rounded-md bg-signal px-3 py-2 text-sm font-semibold text-white hover:bg-signal/90"
            >
              S'abonner à la newsletter BeamStack ↗
            </a>
          </div>
        </div>

        {/* What do you want to build */}
        <form onSubmit={handleSubmit} className="rounded-lg border border-navy/10 bg-white p-5">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-signal">
            Une idée de logiciel ?
          </div>
          <h3 className="font-display text-base font-bold text-navy">
            Qu'est-ce que vous voulez construire ?
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="brief-name" className="text-xs font-medium text-ink">
                Nom / organisme
              </label>
              <input
                id="brief-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-navy/15 bg-white px-3 py-1.5 text-sm text-ink focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="brief-email" className="text-xs font-medium text-ink">
                Contact
              </label>
              <input
                id="brief-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-navy/15 bg-white px-3 py-1.5 text-sm text-ink focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <label htmlFor="brief-message" className="text-xs font-medium text-ink">
              Le workflow à transformer <span className="text-accent">★</span>
            </label>
            <textarea
              id="brief-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Exemple : je saisis des données terrain, je refais les mêmes calculs, puis je prépare un rapport et des plans…"
              className="rounded-md border border-navy/15 bg-white px-3 py-1.5 text-sm text-ink focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
            />
          </div>
          <Button type="submit" variant="secondary" className="mt-3" disabled={!canSend}>
            Envoyer
          </Button>
        </form>
      </div>
    </footer>
  );
}
