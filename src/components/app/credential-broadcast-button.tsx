"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/app/workspace-provider";

export function CredentialBroadcastButton({
  accountId,
  recipientCount,
}: {
  accountId: string;
  recipientCount: number;
}) {
  const { refresh, waRemaining } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, type: "credentials" }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        sentCount?: number;
        mode?: string;
        waMeUrl?: string;
      };
      await refresh();

      if (!data.ok) {
        setError(data.error || "No se pudo avisar.");
        return;
      }

      if (data.mode === "manual" && data.waMeUrl) {
        window.open(data.waMeUrl, "_blank", "noopener,noreferrer");
      }

      setMessage(
        `Aviso enviado a ${data.sentCount ?? recipientCount} vigentes (no incluye vencidos).`,
      );
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSend}
        disabled={loading || recipientCount === 0 || waRemaining < recipientCount}
        className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-fg disabled:opacity-60"
      >
        {loading
          ? "Enviando…"
          : `Avisar cambio a vigentes (${recipientCount})`}
      </button>
      {message ? <p className="text-xs text-success">{message}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
