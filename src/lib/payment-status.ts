import type { PaymentStatus } from "@prisma/client";

/** Calcula estado según fecha de vencimiento (hoy en UTC). */
export function computePaymentStatus(dueDate: Date, now = new Date()): PaymentStatus {
  const due = new Date(Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()));
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "debe";
  if (diffDays <= 3) return "pronto";
  return "ok";
}
