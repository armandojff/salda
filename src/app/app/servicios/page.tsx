"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useWorkspace } from "@/components/app/workspace-provider";
import { Modal } from "@/components/ui/modal";
import { statusClass, statusLabel, type DebtorStatus } from "@/lib/demo-data";
import { SERVICE_OPTIONS } from "@/lib/service-options";

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

type PendingCredWarning = {
  accountId: string;
  service: string;
  removedName: string;
};

export default function ServiciosPage() {
  const { planId, loading: wsLoading, refresh } = useWorkspace();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"servicio" | "cliente">("servicio");

  const [openCreate, setOpenCreate] = useState(false);
  const [memberFor, setMemberFor] = useState<string | null>(null);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    account: Account;
    member: Member;
  } | null>(null);
  const [pendingCred, setPendingCred] = useState<PendingCredWarning | null>(null);
  const [saving, setSaving] = useState(false);
  const [customService, setCustomService] = useState(false);
  const [notifyInfo, setNotifyInfo] = useState<string | null>(null);

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
        setError(data.error || "No se pudieron cargar los servicios.");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;

    if (searchMode === "servicio") {
      return accounts.filter((a) => a.service.toLowerCase().includes(q));
    }

    return accounts
      .map((a) => ({
        ...a,
        members: a.members.filter((m) => m.name.toLowerCase().includes(q)),
      }))
      .filter((a) => a.members.length > 0 || a.service.toLowerCase().includes(q));
  }, [accounts, query, searchMode]);

  async function createAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const serviceSelect = String(form.get("serviceSelect") || "");
    const serviceOther = String(form.get("serviceOther") || "").trim();
    const service = serviceSelect === "Otro" ? serviceOther : serviceSelect;

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "No se pudo crear el servicio.");
        return;
      }
      setOpenCreate(false);
      setCustomService(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function addMember(e: FormEvent<HTMLFormElement>, accountId: string) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/accounts/${accountId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          amount: form.get("amount") || "",
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
    } finally {
      setSaving(false);
    }
  }

  async function saveCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editAccount) return;
    setSaving(true);
    setNotifyInfo(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/accounts/${editAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password") || undefined,
          notify: true,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        notified?: { ok: boolean; sentCount?: number; error?: string; skipped?: boolean };
      };
      if (!data.ok) {
        setError(data.error || "No se pudo guardar.");
        return;
      }

      if (data.notified && !data.notified.ok) {
        setNotifyInfo(data.notified.error || "Guardado, pero falló el aviso WhatsApp.");
      } else if (data.notified?.skipped) {
        setNotifyInfo("Credenciales actualizadas. No había clientes activos (🟢/🟡) para avisar.");
      } else {
        setNotifyInfo(
          `Credenciales actualizadas. WhatsApp enviado a ${data.notified?.sentCount ?? 0} clientes activos.`,
        );
      }

      if (pendingCred?.accountId === editAccount.id) {
        setPendingCred(null);
      }
      setEditAccount(null);
      await refresh();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteMember() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/accounts/${deleteTarget.account.id}/members/${deleteTarget.member.id}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as {
        ok: boolean;
        removedName?: string;
        service?: string;
        error?: string;
      };
      if (!data.ok) {
        setError(data.error || "No se pudo eliminar.");
        return;
      }

      setPendingCred({
        accountId: deleteTarget.account.id,
        service: data.service || deleteTarget.account.service,
        removedName: data.removedName || deleteTarget.member.name,
      });
      setDeleteTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (wsLoading || planId !== "streaming") {
    return <p className="text-sm text-muted">Cargando servicios…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Servicios
          </h1>
          <p className="mt-1 text-muted">
            Netflix, Spotify y más. Personas por servicio, avisos solo a vigentes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:brightness-110"
        >
          + Agregar servicio
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-3 sm:flex-row sm:items-center">
        <div className="flex rounded-full border border-card-border p-1 text-xs">
          <button
            type="button"
            onClick={() => setSearchMode("servicio")}
            className={`rounded-full px-3 py-1.5 transition ${
              searchMode === "servicio" ? "bg-accent-soft text-accent" : "text-muted"
            }`}
          >
            Por servicio
          </button>
          <button
            type="button"
            onClick={() => setSearchMode("cliente")}
            className={`rounded-full px-3 py-1.5 transition ${
              searchMode === "cliente" ? "bg-accent-soft text-accent" : "text-muted"
            }`}
          >
            Por cliente
          </button>
        </div>
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchMode === "servicio"
                ? "Buscar servicio (ej. Netflix)"
                : "Buscar cliente por nombre"
            }
            className="w-full rounded-xl border border-card-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none ring-accent focus:ring-2"
          />
        </label>
      </div>

      {pendingCred ? (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <p className="font-medium text-warning">
            Se eliminó a {pendingCred.removedName} de {pendingCred.service}.
          </p>
          <p className="mt-1 text-muted">
            Aún no has actualizado las credenciales. Cambia la clave para que esa persona ya no
            tenga acceso.
          </p>
          <button
            type="button"
            className="mt-3 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg"
            onClick={() => {
              const acc = accounts.find((a) => a.id === pendingCred.accountId);
              if (acc) setEditAccount(acc);
            }}
          >
            Actualizar credenciales ahora
          </button>
        </div>
      ) : null}

      {notifyInfo ? (
        <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {notifyInfo}
        </div>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {accounts.length === 0
            ? "Aún no hay servicios. Agrega el primero."
            : "No hay resultados para esa búsqueda."}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((account) => {
            const vigentes = account.members.filter((m) => m.status !== "debe");
            const debe = account.members.filter((m) => m.status === "debe").length;
            return (
              <section
                key={account.id}
                className="rounded-2xl border border-card-border bg-card p-4 transition-shadow duration-300 hover:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.45)] sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{account.service}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {account.email} · clave: {account.password}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {account.members.length} personas · {debe} deben · {vigentes.length} activos
                      (🟢/🟡)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditAccount(account)}
                      className="rounded-full border border-card-border px-3 py-1.5 text-xs transition hover:border-accent/40"
                    >
                      Editar correo / clave
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setMemberFor(memberFor === account.id ? null : account.id)
                      }
                      className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg"
                    >
                      + Agregar persona
                    </button>
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
                      name="dueDate"
                      required
                      type="date"
                      className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm"
                    />
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="Monto (opcional)"
                      className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-fg sm:col-span-2 disabled:opacity-60"
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
                        className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted">
                            {m.phone} · vence {m.dueDate}
                            {m.amount > 0 ? ` · $${m.amount}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass[m.status]}`}
                          >
                            {statusLabel[m.status]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ account, member: m })}
                            className="rounded-full border border-danger/30 px-2.5 py-1 text-[11px] text-danger"
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Crear servicio */}
      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Agregar servicio"
        description="Solo necesitas nombre del servicio, correo y clave."
      >
        <form onSubmit={createAccount} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Servicio</span>
            <select
              name="serviceSelect"
              required
              defaultValue="Netflix"
              onChange={(e) => setCustomService(e.target.value === "Otro")}
              className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm outline-none ring-accent focus:ring-2"
            >
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          {customService ? (
            <input
              name="serviceOther"
              required
              placeholder="Nombre del servicio"
              className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm outline-none ring-accent focus:ring-2"
            />
          ) : null}
          <input
            name="email"
            required
            type="email"
            placeholder="Correo"
            className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm outline-none ring-accent focus:ring-2"
          />
          <input
            name="password"
            required
            placeholder="Clave"
            className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm outline-none ring-accent focus:ring-2"
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpenCreate(false)}
              className="flex-1 rounded-full border border-card-border py-2.5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-fg disabled:opacity-60"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      {/* Editar credenciales */}
      <Modal
        open={Boolean(editAccount)}
        onClose={() => setEditAccount(null)}
        title="Editar correo / clave"
        description={
          editAccount
            ? `Al guardar, se enviará WhatsApp a los clientes activos de ${editAccount.service} (no a quienes deben).`
            : undefined
        }
      >
        {editAccount ? (
          <form onSubmit={saveCredentials} className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Correo</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={editAccount.email}
                className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm outline-none ring-accent focus:ring-2"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Nueva clave</span>
              <input
                name="password"
                placeholder="Déjalo vacío si no cambia"
                className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm outline-none ring-accent focus:ring-2"
              />
            </label>
            <p className="text-xs text-muted">
              El mensaje siempre incluye servicio + correo vigente + clave vigente.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditAccount(null)}
                className="flex-1 rounded-full border border-card-border py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-fg disabled:opacity-60"
              >
                Guardar y avisar
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* Eliminar persona */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar persona"
        description="Después de eliminar a esta persona, debes cambiar la clave del servicio para que ya no tenga acceso a la cuenta."
      >
        {deleteTarget ? (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-foreground">
              Vas a eliminar a{" "}
              <span className="font-semibold">{deleteTarget.member.name}</span> de{" "}
              <span className="font-semibold">{deleteTarget.account.service}</span>.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-card-border bg-background py-2.5 text-sm transition hover:border-accent/40"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmDeleteMember}
                className="flex-1 rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-fg transition hover:brightness-110 disabled:opacity-60"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
