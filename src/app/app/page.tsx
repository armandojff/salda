"use client";

import Link from "next/link";
import { useWorkspace } from "@/components/app/workspace-provider";
import { demoDebtors } from "@/lib/demo-data";
import { demoAccounts, demoMembers } from "@/lib/streaming-data";

export default function DashboardPage() {
  const { planId, planName, price, waUsed, waLimit, waRemaining } = useWorkspace();

  const debe =
    planId === "streaming"
      ? demoMembers.filter((d) => d.status === "debe").length
      : demoDebtors.filter((d) => d.status === "debe").length;
  const pronto =
    planId === "streaming"
      ? demoMembers.filter((d) => d.status === "pronto").length
      : demoDebtors.filter((d) => d.status === "pronto").length;
  const ok =
    planId === "streaming"
      ? demoMembers.filter((d) => d.status === "ok").length
      : demoDebtors.filter((d) => d.status === "ok").length;
  const caidas =
    planId === "streaming"
      ? demoAccounts.filter((a) => a.status === "down").length
      : 0;

  const urgentes =
    planId === "streaming"
      ? demoMembers.filter((d) => d.status === "debe").slice(0, 4)
      : demoDebtors.filter((d) => d.status === "debe").slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted">
          Modo {planName} · ${price}/mes · cupo WhatsApp {waUsed}/{waLimit}
        </p>
      </div>

      <div className="rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        {waRemaining <= 0
          ? "Sin cupo de WhatsApp este mes. Sube de plan o espera el próximo ciclo."
          : planId === "streaming"
            ? `Tienes ${debe} miembros por cobrar y ${caidas} cuentas marcadas como caídas.`
            : `Tienes ${debe} clientes por cobrar. Te quedan ${waRemaining} avisos WA.`}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Debe", value: debe, className: "text-danger" },
          { label: "Por vencer", value: pronto, className: "text-warning" },
          { label: "Al día", value: ok, className: "text-success" },
          {
            label: planId === "streaming" ? "Cuentas caídas" : "Cupo WA",
            value: planId === "streaming" ? caidas : waRemaining,
            className: "text-accent",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-card-border bg-card p-4"
          >
            <p className="text-xs uppercase tracking-wider text-muted">{card.label}</p>
            <p className={`mt-1 font-display text-3xl font-semibold ${card.className}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-card-border bg-card">
        <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
          <h2 className="font-display text-lg font-semibold">Urgentes</h2>
          <Link href="/app/avisos" className="text-sm text-accent hover:underline">
            Ir a avisos
          </Link>
        </div>
        <ul className="divide-y divide-card-border">
          {urgentes.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-sm text-muted">${d.amount}</p>
              </div>
              <Link
                href="/app/avisos"
                className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg"
              >
                Avisar
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
