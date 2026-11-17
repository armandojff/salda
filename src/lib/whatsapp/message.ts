import type { Debtor } from "@/lib/demo-data";

export function buildPaymentReminderMessage(debtor: Debtor) {
  return `Hola ${debtor.name}, te recordamos tu pago de $${debtor.amount} por ${debtor.service}, con vencimiento el ${debtor.dueDate}. ¿Me confirmas cuando puedas?`;
}

/** Normaliza a dígitos internacionales, ej. 58412... */
export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

/** chatId de Green API / WhatsApp: 58412...@c.us */
export function toWhatsAppChatId(phone: string) {
  return `${normalizePhone(phone)}@c.us`;
}

export function buildWaMeUrl(phone: string, message: string) {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}
