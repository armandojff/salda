"use client";

import { useWorkspace } from "@/components/app/workspace-provider";

export function QuotaBadge() {
  const { waUsed, waLimit, planName, loading } = useWorkspace();

  if (loading) {
    return (
      <span className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted">
        Cargando cupo…
      </span>
    );
  }

  const pct = waLimit === 0 ? 0 : waUsed / waLimit;
  const tone =
    pct >= 1 ? "text-danger" : pct >= 0.8 ? "text-warning" : "text-foreground";

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-card-border bg-card px-2.5 py-1 text-[11px] text-muted">
      {planName} ·{" "}
      <span className={`font-medium ${tone}`}>
        {waUsed}/{waLimit} WA
      </span>
    </span>
  );
}
