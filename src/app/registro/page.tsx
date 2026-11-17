"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PLAN_LIST, getPlan, isPlanId, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

function RegistroForm() {
  const router = useRouter();
  const search = useSearchParams();
  const initial = search.get("plan");
  const [planId, setPlanId] = useState<PlanId>(
    initial && isPlanId(initial) ? initial : "simple",
  );
  const [loading, setLoading] = useState(false);
  const plan = useMemo(() => getPlan(planId), [planId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      router.push("/app");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle={`Empieza con el plan ${plan.name} ($${plan.price}/mes).`}
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-2">
          <span className="text-sm font-medium">Elige tu plan</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {PLAN_LIST.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition",
                  planId === p.id
                    ? "border-accent bg-accent-soft"
                    : "border-card-border bg-background",
                )}
              >
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted">
                  ${p.price}/mes · {p.waLimit} WA
                </p>
              </button>
            ))}
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Nombre del negocio</span>
          <input
            type="text"
            name="business"
            required
            placeholder="Mi negocio"
            className="w-full rounded-xl border border-card-border bg-background px-3.5 py-2.5 text-sm outline-none ring-accent focus:ring-2"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="tu@negocio.com"
            className="w-full rounded-xl border border-card-border bg-background px-3.5 py-2.5 text-sm outline-none ring-accent focus:ring-2"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Contraseña</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-xl border border-card-border bg-background px-3.5 py-2.5 text-sm outline-none ring-accent focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-fg transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Creando…" : `Continuar con ${plan.name}`}
        </button>
        <p className="text-center text-xs text-muted">
          Incluye {plan.waLimit} avisos WhatsApp al mes. Puedes cambiar de plan luego en Cuenta.
        </p>
      </form>
    </AuthShell>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Cargando…</div>}>
      <RegistroForm />
    </Suspense>
  );
}
