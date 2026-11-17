"use client";

import { useEffect, useState } from "react";
import { AvisoButton } from "@/components/app/aviso-button";
import { ProviderBadge } from "@/components/app/provider-badge";
import { QuotaBadge } from "@/components/app/quota-badge";
import { useWorkspace } from "@/components/app/workspace-provider";
import { statusClass, statusLabel, type DebtorStatus } from "@/lib/demo-data";

type Row = {
  id: string;
  name: string;
  service: string;
  amount: number;
  dueDate: string;
  status: DebtorStatus;
  kind: "debtor" | "member";
};

export default function AvisosPage() {
  const { planId } = useWorkspace();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (planId === "streaming") {
          const res = await fetch("/api/accounts");
          const data = (await res.json()) as {
            ok: boolean;
            accounts?: {
              service: string;
              members: {
                id: string;
                name: string;
                amount: number;
                dueDate: string;
                status: DebtorStatus;
              }[];
            }[];
          };
          const list: Row[] = [];
          for (const account of data.accounts || []) {
            for (const m of account.members) {
              if (m.status !== "ok") {
                list.push({
                  id: m.id,
                  name: m.name,
                  service: account.service,
                  amount: m.amount,
                  dueDate: m.dueDate,
                  status: m.status,
                  kind: "member",
                });
              }
            }
          }
          setRows(list);
        } else {
          const res = await fetch("/api/debtors");
          const data = (await res.json()) as {
            ok: boolean;
            debtors?: {
              id: string;
              name: string;
              service: string;
              amount: number;
              dueDate: string;
              status: DebtorStatus;
            }[];
          };
          setRows(
            (data.debtors || [])
              .filter((d) => d.status !== "ok")
              .map((d) => ({ ...d, kind: "debtor" as const })),
          );
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [planId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Avisos
          </h1>
          <p className="mt-1 text-muted">
            Envíos desde clientes reales en la base de datos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuotaBadge />
          <ProviderBadge />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">No hay pendientes de cobro.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((d) => (
            <li
              key={`${d.kind}-${d.id}`}
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
              <AvisoButton
                target={
                  d.kind === "member"
                    ? { kind: "member", id: d.id }
                    : { kind: "debtor", id: d.id }
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
