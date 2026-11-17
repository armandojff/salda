"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CredentialBroadcastButton } from "@/components/app/credential-broadcast-button";
import { useWorkspace } from "@/components/app/workspace-provider";
import { statusClass, statusLabel } from "@/lib/demo-data";
import {
  activeMembersForAccount,
  demoAccounts,
  membersForAccount,
} from "@/lib/streaming-data";

export default function CuentasPage() {
  const { planId, loading } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (!loading && planId !== "streaming") {
      router.replace("/app/deudores");
    }
  }, [loading, planId, router]);

  if (loading || planId !== "streaming") {
    return <p className="text-sm text-muted">Cargando cuentas…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Cuentas compartidas
        </h1>
        <p className="mt-1 text-muted">
          Una cuenta, varias personas. Si cae el servicio, reemplazas y avisas solo a vigentes.
        </p>
      </div>

      <div className="space-y-4">
        {demoAccounts.map((account) => {
          const members = membersForAccount(account.id);
          const vigentes = activeMembersForAccount(account.id);
          const debe = members.filter((m) => m.status === "debe").length;

          return (
            <section
              key={account.id}
              className="rounded-2xl border border-card-border bg-card p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">
                      {account.service}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        account.status === "down"
                          ? "bg-warning/15 text-warning"
                          : "bg-success/15 text-success"
                      }`}
                    >
                      {account.status === "down" ? "🛠️ Caída" : "OK"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {account.email} · clave demo: {account.password}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {members.length} personas · {debe} deben · {vigentes.length} vigentes
                  </p>
                </div>
                <CredentialBroadcastButton
                  accountId={account.id}
                  recipientCount={vigentes.length}
                />
              </div>

              <ul className="mt-4 divide-y divide-card-border rounded-xl border border-card-border">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted">
                        ${m.amount} · vence {m.dueDate}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass[m.status]}`}
                    >
                      {statusLabel[m.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
