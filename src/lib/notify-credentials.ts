import { decryptSecret } from "@/lib/crypto-secret";
import { prisma } from "@/lib/db";
import { computePaymentStatus } from "@/lib/payment-status";
import { consumeBusinessQuota } from "@/lib/wa-quota-db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import type { Plan, SharedAccount } from "@prisma/client";

export function buildCredentialsMessage(
  memberName: string,
  service: string,
  email: string,
  password: string,
) {
  return `Hola ${memberName}, estos son tus datos actualizados de ${service}:

Servicio: ${service}
Correo: ${email}
Clave: ${password}

Guárdalos. Si tienes dudas, escríbenos.`;
}

export function buildExpiringMessage(
  memberName: string,
  service: string,
  dueDate: string,
  amount?: number,
) {
  const amountPart =
    amount && amount > 0 ? ` Monto: $${amount}.` : "";
  return `Hola ${memberName}, tu servicio de ${service} está por vencerse (${dueDate}).${amountPart} Renueva a tiempo para no perder el acceso.`;
}

/** Notifica solo a 🟢 al día y 🟡 por vencer (nunca a 🔴 debe). */
export async function notifyActiveMembersCredentials(options: {
  businessId: string;
  plan: Plan;
  account: SharedAccount;
}) {
  const password = decryptSecret(options.account.passwordEnc);
  const members = await prisma.member.findMany({
    where: { accountId: options.account.id },
  });

  const recipients = members.filter(
    (m) => computePaymentStatus(m.dueDate) !== "debe",
  );

  if (recipients.length === 0) {
    return { ok: true as const, sentCount: 0, skipped: true as const };
  }

  const consumed = await consumeBusinessQuota(
    options.businessId,
    options.plan,
    recipients.length,
  );
  if (!consumed.ok) {
    return { ok: false as const, error: consumed.error, quota: consumed.quota };
  }

  let sentCount = 0;
  for (const member of recipients) {
    const result = await sendWhatsAppMessage({
      phone: member.phone,
      message: buildCredentialsMessage(
        member.name,
        options.account.service,
        options.account.email,
        password,
      ),
    });
    if (!result.ok) {
      return {
        ok: false as const,
        error: result.error,
        sentCount,
        quota: consumed.quota,
      };
    }
    sentCount += 1;
  }

  return { ok: true as const, sentCount, quota: consumed.quota };
}
