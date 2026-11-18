"use client";

import { useWorkspace } from "@/components/app/workspace-provider";
import { PLAN_LIST, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

export default function CuentaPage() {
  const {
    planId,
    setPlan,
    waUsed,
    waLimit,
    waRemaining,
    loading,
    businessName,
    businessEmail,
  } = useWorkspace();

  async function handleSelect(next: PlanId) {
    await setPlan(next);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Cuenta
        </h1>
        <p className="mt-1 text-muted">Elige tu modo y revisa el cupo de WhatsApp.</p>
      </div>

      <section className="rounded-2xl border border-card-border bg-card p-5 transition-shadow duration-300 hover:shadow-[0_12px_40px_-28px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-wider text-muted">Cupo este mes</p>
        <p className="mt-2 font-display text-3xl font-semibold text-accent transition-all duration-300">
          {loading ? "…" : `${waUsed} / ${waLimit}`}
        </p>
        <p className="mt-1 text-sm text-muted">
          Quedan {waRemaining} avisos WhatsApp. Al llegar al tope, el envío se bloquea.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {PLAN_LIST.map((plan) => {
          const active = planId === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleSelect(plan.id)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-all duration-300 ease-out",
                active
                  ? "scale-[1.01] border-accent bg-accent-soft shadow-[0_16px_40px_-28px_var(--glow)]"
                  : "border-card-border bg-card hover:-translate-y-0.5 hover:border-accent/40",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-accent">{plan.tagline}</p>
                {active ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg">
                    Activo
                  </span>
                ) : null}
              </div>
              <p className="mt-2 font-display text-2xl font-semibold">{plan.name}</p>
              <p className="mt-1 font-display text-3xl font-semibold">
                ${plan.price}
                <span className="text-base font-normal text-muted">/mes</span>
              </p>
              <p className="mt-2 text-sm text-muted">{plan.description}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted">Negocio</p>
        <p className="mt-2 font-display text-xl font-semibold">
          {businessName || "Mi negocio"}
        </p>
        <p className="mt-1 text-sm text-muted">{businessEmail || "—"}</p>
      </section>
    </div>
  );
}
