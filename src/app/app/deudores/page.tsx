"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/components/app/workspace-provider";
import { statusClass, statusLabel, type DebtorStatus } from "@/lib/demo-data";

type DebtorRow = {
  id: string;
  name: string;
  phone: string;
  service: string;
  amount: number;
  dueDate: string;
  status: DebtorStatus;
};

export default function DeudoresPage() {
  const { planId, loading: wsLoading } = useWorkspace();
  const router = useRouter();
  const [debtors, setDebtors] = useState<DebtorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/debtors");
      const data = (await res.json()) as { ok: boolean; debtors?: DebtorRow[]; error?: string };
      if (!data.ok) {
        setError(data.error || "No se pudieron cargar.");
        return;
      }
      setDebtors(data.debtors || []);
    } catch {
      setError("Error de red o base de datos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!wsLoading && planId === "streaming") {
      router.replace("/app/cuentas");
      return;
    }
    if (!wsLoading) void load();
  }, [wsLoading, planId, router]);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/debtors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        service: form.get("service"),
        amount: form.get("amount"),
        dueDate: form.get("dueDate"),
      }),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) {
      setError(data.error || "No se pudo crear.");
      return;
    }
    setOpen(false);
    e.currentTarget.reset();
    await load();
  }

  async function markPaid(id: string) {
    await fetch(`/api/debtors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markPaid: true }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/debtors/${id}`, { method: "DELETE" });
    await load();
  }

  if (wsLoading || planId === "streaming") {
    return <p className="text-sm text-muted">Cargando…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Deudores
          </h1>
          <p className="mt-1 text-muted">Clientes guardados en PostgreSQL.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg"
        >
          {open ? "Cerrar" : "+ Agregar cliente"}
        </button>
      </div>

      {open ? (
        <form
          onSubmit={onCreate}
          className="grid gap-3 rounded-2xl border border-card-border bg-card p-4 sm:grid-cols-2"
        >
          <input
            name="name"
            required
            placeholder="Nombre"
            className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="phone"
            required
            placeholder="Teléfono (58412...)"
            className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="service"
            placeholder="Servicio"
            className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="amount"
            required
            type="number"
            step="0.01"
            placeholder="Monto"
            className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="dueDate"
            required
            type="date"
            className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm sm:col-span-2"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg sm:col-span-2"
          >
            Guardar en base de datos
          </button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-card-border bg-card">
        {loading ? (
          <p className="p-4 text-sm text-muted">Cargando deudores…</p>
        ) : debtors.length === 0 ? (
          <p className="p-4 text-sm text-muted">Aún no hay clientes. Agrega el primero.</p>
        ) : (
          <ul className="divide-y divide-card-border">
            {debtors.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-sm text-muted">
                    {d.service} · ${d.amount} · vence {d.dueDate} · {d.phone}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[d.status]}`}
                  >
                    {statusLabel[d.status]}
                  </span>
                  <button
                    type="button"
                    onClick={() => markPaid(d.id)}
                    className="rounded-full border border-card-border px-3 py-1.5 text-xs"
                  >
                    Marcar pagado
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    className="rounded-full border border-danger/30 px-3 py-1.5 text-xs text-danger"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
