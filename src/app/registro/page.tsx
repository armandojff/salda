import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export default function RegistroPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Empieza a organizar tus cobros. Membresía $5/mes."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form action="/app" className="space-y-4">
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
          className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-fg transition hover:brightness-110"
        >
          Crear cuenta
        </button>
        <p className="text-center text-xs text-muted">
          Luego activamos tu membresía de $5/mes para desbloquear el panel completo.
        </p>
      </form>
    </AuthShell>
  );
}
