"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/app/workspace-provider";

type Urgent = { id: string; name: string; amount: number };

export default function DashboardPage() {
  const { planId, planName, price, waUsed, waLimit, waRemaining } = useWorkspace();
  const [stats, setStats] = useState({ debe: 0, pronto: 0, ok: 0, caidas: 0 });
  const [urgentes, setUrgentes] = useState<Urgent[]>([]);

  useEffect(() => {
    async function load() {
      if (planId === "streaming") {
        const res = await fetch("/api/accounts");
        const data = (await res.json()) as {
          accounts?: {
            status: string;
            members: { id: string; name: string; amount: number; status: string }[];
          }[];
        };
        const members = (data.accounts || []).flatMap((a) => a.members);
        setStats({
          debe: members.filter((m) => m.status === "debe").length,
          pronto: members.filter((m) => m.status === "pronto").length,
          ok: members.filter((m) => m.status === "ok").length,
          caidas: (data.accounts || []).filter((a) => a.status === "down").length,
        });
        setUrgentes(
          members
            .filter((m) => m.status === "debe")
            .slice(0, 4)
            .map((m) => ({ id: m.id, name: m.name, amount: m.amount })),
        );
      } else {
        const res = await fetch("/api/debtors");
        const data = (await res.json()) as {
          debtors?: { id: string; name: string; amount: number; status: string }[];
        };
        const debtors = data.debtors || [];
        setStats({
          debe: debtors.filter((m) => m.status === "debe").length,
          pronto: debtors.filter((m) => m.status === "pronto").length,
          ok: debtors.filter((m) => m.status === "ok").length,
          caidas: 0,
        });
        setUrgentes(
          debtors
            .filter((m) => m.status === "debe")
            .slice(0, 4)
            .map((m) => ({ id: m.id, name: m.name, amount: m.amount })),
        );
      }
    }
    void load();
  }, [planId]);

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
          ? "Sin cupo de WhatsApp este mes."
          : `Tienes ${stats.debe} por cobrar. Te quedan ${waRemaining} avisos WA.`}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Debe", value: stats.debe, className: "text-danger" },
          { label: "Por vencer", value: stats.pronto, className: "text-warning" },
          { label: "Al día", value: stats.ok, className: "text-success" },
          {
            label: "Cupo WA",
            value: waRemaining,
            className: "text-accent",
          },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-card-border bg-card p-4">
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
          {urgentes.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">Nada urgente por ahora.</li>
          ) : (
            urgentes.map((d) => (
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
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
