"use client";

import type { Debtor } from "@/lib/demo-data";
import { buildWhatsAppLink } from "@/lib/demo-data";

export function AvisoButton({ debtor }: { debtor: Debtor }) {
  return (
    <a
      href={buildWhatsAppLink(debtor)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-3.5 py-2 text-xs font-semibold text-white transition hover:brightness-110"
    >
      WhatsApp
    </a>
  );
}
