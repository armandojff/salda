"use client";

import { useEffect, useState } from "react";

export function ProviderBadge() {
  const [label, setLabel] = useState<string>("…");

  useEffect(() => {
    fetch("/api/whatsapp/send")
      .then((r) => r.json())
      .then((data: { activeProvider?: string }) => {
        setLabel(data.activeProvider || "desconocido");
      })
      .catch(() => setLabel("error"));
  }, []);

  return (
    <span className="inline-flex items-center rounded-full border border-card-border bg-card px-2.5 py-1 text-[11px] text-muted">
      Canal: <span className="ml-1 font-medium text-foreground">{label}</span>
    </span>
  );
}
