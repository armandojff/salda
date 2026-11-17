import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Entra a tu panel de cobros."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-accent hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      <form action="/app" className="space-y-4">
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
            placeholder="••••••••"
            className="w-full rounded-xl border border-card-border bg-background px-3.5 py-2.5 text-sm outline-none ring-accent focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-fg transition hover:brightness-110"
        >
          Entrar
        </button>
      </form>
    </AuthShell>
  );
}
