"use client";

import { AvisoButton } from "@/components/app/aviso-button";
import { ProviderBadge } from "@/components/app/provider-badge";
import { QuotaBadge } from "@/components/app/quota-badge";
import { useWorkspace } from "@/components/app/workspace-provider";
import { demoDebtors, statusClass, statusLabel } from "@/lib/demo-data";
import { demoAccounts, demoMembers } from "@/lib/streaming-data";

export default function AvisosPage() {
  const { planId } = useWorkspace();

  const pendientesSimple = demoDebtors.filter((d) => d.status !== "ok");
  const pendientesStreaming = demoMembers.filter((m) => m.status !== "ok");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Avisos
          </h1>
          <p className="mt-1 text-muted">
            {planId === "streaming"
              ? "Cobros de miembros en cuentas compartidas. El cambio de clave se hace desde Cuentas."
              : "Envío automático de cobros. Cupo según tu plan."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuotaBadge />
          <ProviderBadge />
        </div>
      </div>

      {planId === "streaming" ? (
        <ul className="space-y-3">
          {pendientesStreaming.map((m) => {
            const account = demoAccounts.find((a) => a.id === m.accountId);
            return (
              <li
                key={m.id}
                className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{m.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass[m.status]}`}
                    >
                      {statusLabel[m.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {account?.service} · ${m.amount} · vence {m.dueDate}
                  </p>
                </div>
                <AvisoButton target={{ kind: "member", id: m.id }} />
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-3">
          {pendientesSimple.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{d.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass[d.status]}`}
                  >
                    {statusLabel[d.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {d.service} · ${d.amount} · vence {d.dueDate}
                </p>
              </div>
              <AvisoButton target={{ kind: "debtor", id: d.id }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
