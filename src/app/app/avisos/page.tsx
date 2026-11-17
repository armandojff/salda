import { AvisoButton } from "@/components/app/aviso-button";
import { demoDebtors, statusClass, statusLabel } from "@/lib/demo-data";

export default function AvisosPage() {
  const pendientes = demoDebtors.filter((d) => d.status !== "ok");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Avisos
        </h1>
        <p className="mt-1 text-muted">
          Abre WhatsApp con el mensaje listo y confirma el envío.
        </p>
      </div>

      <ul className="space-y-3">
        {pendientes.map((d) => (
          <li
            key={d.id}
            className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{d.name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass[d.status]}`}
                >
                  {statusLabel[d.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {d.service} · ${d.amount} · vence {d.dueDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AvisoButton debtor={d} />
              <button
                type="button"
                className="rounded-full border border-card-border px-3.5 py-2 text-xs font-medium text-muted hover:text-foreground"
              >
                Marcar avisado
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
