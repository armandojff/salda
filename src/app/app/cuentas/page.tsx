"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CredentialBroadcastButton } from "@/components/app/credential-broadcast-button";
import { useWorkspace } from "@/components/app/workspace-provider";
import { statusClass, statusLabel, type DebtorStatus } from "@/lib/demo-data";

type Member = {
  id: string;
  name: string;
  phone: string;
  amount: number;
  dueDate: string;
  status: DebtorStatus;
};

type Account = {
  id: string;
  service: string;
  email: string;
  password: string;
  status: "ok" | "down";
  members: Member[];
};

export default function CuentasPage() {
  const { planId, loading: wsLoading } = useWorkspace();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAccount, setOpenAccount] = useState(false);
  const [memberFor, setMemberFor] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts");
      const data = (await res.json()) as {
        ok: boolean;
        accounts?: Account[];
        error?: string;
      };
      if (!data.ok) {
        setError(data.error || "No se pudieron cargar las cuentas.");
        return;
      }
      setAccounts(data.accounts || []);
    } catch {
      setError("Error de red o base de datos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!wsLoading && planId !== "streaming") {
      router.replace("/app/deudores");
      return;
    }
    if (!wsLoading) void load();
  }, [wsLoading, planId, router]);

  async function createAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: form.get("service"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) {
      setError(data.error || "No se pudo crear.");
      return;
    }
    setOpenAccount(false);
    e.currentTarget.reset();
    await load();
  }

  async function addMember(e: FormEvent<HTMLFormElement>, accountId: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/accounts/${accountId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        amount: form.get("amount"),
        dueDate: form.get("dueDate"),
      }),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) {
      setError(data.error || "No se pudo agregar persona.");
      return;
    }
    setMemberFor(null);
    await load();
  }

  async function markDown(id: string, status: "ok" | "down") {
    await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function replaceCredentials(id: string) {
    const email = window.prompt("Nuevo correo de la cuenta");
    const password = window.prompt("Nueva clave");
    if (!email || !password) return;
    await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, status: "ok" }),
    });
    await load();
  }

  if (wsLoading || planId !== "streaming") {
    return <p className="text-sm text-muted">Cargando cuentas…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Cuentas compartidas
          </h1>
          <p className="mt-1 text-muted">
            Guardadas en PostgreSQL. Aviso de cambio solo a vigentes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenAccount((v) => !v)}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg"
        >
          {openAccount ? "Cerrar" : "+ Nueva cuenta"}
        </button>
      </div>

      {openAccount ? (
        <form
          onSubmit={createAccount}
          className="grid gap-3 rounded-2xl border border-card-border bg-card p-4 sm:grid-cols-3"
        >
          <input
            name="service"
            required
            placeholder="Netflix / Spotify…"
            className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="email"
            required
            type="email"
            placeholder="correo@cuenta.com"
            className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="password"
            required
            placeholder="Clave"
            className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg sm:col-span-3"
          >
            Guardar cuenta
          </button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-muted">Aún no hay cuentas. Crea la primera.</p>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => {
            const vigentes = account.members.filter((m) => m.status !== "debe");
            const debe = account.members.filter((m) => m.status === "debe").length;
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
                      {account.email} · clave: {account.password}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {account.members.length} personas · {debe} deben · {vigentes.length}{" "}
                      vigentes
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <CredentialBroadcastButton
                      accountId={account.id}
                      recipientCount={vigentes.length}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          markDown(account.id, account.status === "down" ? "ok" : "down")
                        }
                        className="rounded-full border border-card-border px-3 py-1.5 text-xs"
                      >
                        {account.status === "down" ? "Marcar OK" : "Marcar caída"}
                      </button>
                      <button
                        type="button"
                        onClick={() => replaceCredentials(account.id)}
                        className="rounded-full border border-card-border px-3 py-1.5 text-xs"
                      >
                        Reemplazar cuenta
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setMemberFor(memberFor === account.id ? null : account.id)
                        }
                        className="rounded-full border border-card-border px-3 py-1.5 text-xs"
                      >
                        + Persona
                      </button>
                    </div>
                  </div>
                </div>

                {memberFor === account.id ? (
                  <form
                    onSubmit={(e) => addMember(e, account.id)}
                    className="mt-4 grid gap-2 rounded-xl border border-card-border bg-background/50 p-3 sm:grid-cols-2"
                  >
                    <input
                      name="name"
                      required
                      placeholder="Nombre"
                      className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm"
                    />
                    <input
                      name="phone"
                      required
                      placeholder="Teléfono 58412..."
                      className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm"
                    />
                    <input
                      name="amount"
                      required
                      type="number"
                      step="0.01"
                      placeholder="Monto"
                      className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm"
                    />
                    <input
                      name="dueDate"
                      required
                      type="date"
                      className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-fg sm:col-span-2"
                    >
                      Guardar persona
                    </button>
                  </form>
                ) : null}

                <ul className="mt-4 divide-y divide-card-border rounded-xl border border-card-border">
                  {account.members.length === 0 ? (
                    <li className="px-3 py-3 text-sm text-muted">Sin personas aún.</li>
                  ) : (
                    account.members.map((m) => (
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
                    ))
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
