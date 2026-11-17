import Link from "next/link";
import { demoDebtors } from "@/lib/demo-data";

export default function DashboardPage() {
  const debe = demoDebtors.filter((d) => d.status === "debe").length;
  const pronto = demoDebtors.filter((d) => d.status === "pronto").length;
  const ok = demoDebtors.filter((d) => d.status === "ok").length;
  const sinAvisar = demoDebtors.filter((d) => d.status !== "ok" && !d.lastNotified);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted">Resumen de cobros de hoy.</p>
      </div>

      <div className="rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        Tienes <strong>{sinAvisar.length}</strong> clientes por cobrar sin avisar.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Debe", value: debe, className: "text-danger" },
          { label: "Por vencer", value: pronto, className: "text-warning" },
          { label: "Al día", value: ok, className: "text-success" },
          { label: "Sin avisar", value: sinAvisar.length, className: "text-accent" },
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
          {sinAvisar.slice(0, 4).map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-sm text-muted">
                  {d.service} · ${d.amount}
                </p>
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
