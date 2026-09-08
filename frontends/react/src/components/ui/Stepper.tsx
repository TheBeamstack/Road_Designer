export interface StepDef {
  id: number;
  label: string;
}

export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: StepDef[];
  current: number;
  onJump: (id: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label="Étapes du formulaire">
      {steps.map((step, i) => {
        const state = step.id === current ? "current" : step.id < current ? "done" : "todo";
        return (
          <li key={step.id} className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onJump(step.id)}
              aria-current={state === "current" ? "step" : undefined}
              className={
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors sm:px-3 sm:text-sm " +
                (state === "current"
                  ? "bg-navy text-white"
                  : state === "done"
                    ? "bg-signal/10 text-signal hover:bg-signal/20"
                    : "bg-navy/5 text-muted hover:bg-navy/10")
              }
            >
              <span
                className={
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold sm:h-5 sm:w-5 " +
                  (state === "current"
                    ? "bg-white text-navy"
                    : state === "done"
                      ? "bg-signal text-white"
                      : "bg-navy/15 text-muted")
                }
              >
                {state === "done" ? "✓" : step.id}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < steps.length - 1 && <span className="h-px w-3 bg-navy/15 sm:w-4" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
