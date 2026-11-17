import {
  demoDebtors,
  statusClass,
  statusLabel,
} from "@/lib/demo-data";

export default function DeudoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Deudores
          </h1>
          <p className="mt-1 text-muted">Tu lista de control de cobros.</p>
        </div>
        <button
          type="button"
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg"
        >
          + Agregar cliente
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-card-border bg-card">
        <div className="hidden grid-cols-[1.3fr_1fr_0.7fr_0.9fr_0.8fr] gap-3 border-b border-card-border px-4 py-3 text-xs uppercase tracking-wider text-muted md:grid">
          <span>Cliente</span>
          <span>Servicio</span>
          <span>Monto</span>
          <span>Vence</span>
          <span>Estado</span>
        </div>
        <ul className="divide-y divide-card-border">
          {demoDebtors.map((d) => (
            <li
              key={d.id}
              className="grid gap-2 px-4 py-3 md:grid-cols-[1.3fr_1fr_0.7fr_0.9fr_0.8fr] md:items-center md:gap-3"
            >
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-muted md:hidden">{d.service}</p>
              </div>
              <p className="hidden text-sm text-muted md:block">{d.service}</p>
              <p className="text-sm font-semibold">${d.amount}</p>
              <p className="text-sm text-muted">{d.dueDate}</p>
              <span
                className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[d.status]}`}
              >
                {statusLabel[d.status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
