export default function CuentaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Cuenta
        </h1>
        <p className="mt-1 text-muted">Membresía y datos del negocio.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-card-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Membresía</p>
          <p className="mt-2 font-display text-3xl font-semibold text-accent">$5/mes</p>
          <p className="mt-2 text-sm text-muted">
            Estado demo: activa (UI). En el MVP real activaremos tras el pago.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full border border-card-border px-4 py-2 text-sm font-medium"
          >
            Ver instrucciones de pago
          </button>
        </section>

        <section className="rounded-2xl border border-card-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Negocio</p>
          <p className="mt-2 font-display text-xl font-semibold">Mi negocio</p>
          <p className="mt-1 text-sm text-muted">demo@salda.app</p>
        </section>
      </div>
    </div>
  );
}
