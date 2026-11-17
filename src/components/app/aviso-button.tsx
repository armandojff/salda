"use client";

import { useState } from "react";
import type { Debtor } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type SendResponse = {
  ok: boolean;
  mode?: "automatic" | "manual";
  waMeUrl?: string;
  messageId?: string;
  error?: string;
  activeProvider?: string;
};

export function AvisoButton({ debtor }: { debtor: Debtor }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debtorId: debtor.id }),
      });

      const data = (await response.json()) as SendResponse;

      if (!data.ok) {
        setStatus("error");
        setError(data.error || "No se pudo enviar.");
        return;
      }

      if (data.mode === "manual" && data.waMeUrl) {
        window.open(data.waMeUrl, "_blank", "noopener,noreferrer");
        setStatus("sent");
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Error de red al enviar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-3.5 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60",
          status === "sent" ? "bg-success" : "bg-[#25D366]",
        )}
      >
        {loading ? "Enviando…" : status === "sent" ? "Enviado" : "Enviar auto"}
      </button>
      {error ? <p className="max-w-[180px] text-right text-[11px] text-danger">{error}</p> : null}
    </div>
  );
}
