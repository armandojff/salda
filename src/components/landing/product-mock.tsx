const rows = [
  { name: "María Rivas", service: "Streaming", amount: "$12", due: "Hoy", status: "debe" as const },
  { name: "Luis Ortega", service: "Hosting", amount: "$28", due: "En 2 días", status: "pronto" as const },
  { name: "Ana Pérez", service: "VPN", amount: "$8", due: "Pagado", status: "ok" as const },
  { name: "Carlos Díaz", service: "Canva Pro", amount: "$15", due: "Ayer", status: "debe" as const },
];

const statusStyles = {
  debe: "bg-danger/15 text-danger",
  pronto: "bg-warning/15 text-warning",
  ok: "bg-success/15 text-success",
};

const statusLabel = {
  debe: "Debe",
  pronto: "Por vencer",
  ok: "Al día",
};

export function ProductMock() {
  return (
    <div className="animate-float relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-[2rem] bg-accent/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-card-border bg-card shadow-[0_30px_80px_-40px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Panel</p>
            <p className="font-display text-lg font-semibold">Control de cobros</p>
          </div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            3 por avisar
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 py-4">
          {[
            { label: "Debe", value: "8", tone: "text-danger" },
            { label: "Hoy", value: "2", tone: "text-warning" },
            { label: "Al día", value: "21", tone: "text-success" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-card-border bg-surface/70 px-3 py-3"
            >
              <p className="text-[11px] text-muted">{item.label}</p>
              <p className={`font-display text-2xl font-semibold ${item.tone}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2 px-4 pb-5">
          {rows.map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-background/40 px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{row.name}</p>
                <p className="truncate text-xs text-muted">
                  {row.service} · {row.due}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-semibold">{row.amount}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[row.status]}`}
                >
                  {statusLabel[row.status]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-card-border bg-surface/50 px-4 py-3">
          <div className="flex items-center justify-between rounded-xl bg-[#25D366]/15 px-3 py-2.5 text-sm">
            <span className="font-medium text-foreground">Avisar por WhatsApp</span>
            <span className="text-xs text-muted">1 toque</span>
          </div>
        </div>
      </div>
    </div>
  );
}
