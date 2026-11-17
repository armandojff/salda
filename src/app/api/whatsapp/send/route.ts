import { NextResponse } from "next/server";
import { demoDebtors } from "@/lib/demo-data";
import { consumeQuota, readQuotaState } from "@/lib/quota";
import {
  activeMembersForAccount,
  buildCredentialChangeMessage,
  demoAccounts,
  demoMembers,
} from "@/lib/streaming-data";
import { buildPaymentReminderMessage } from "@/lib/whatsapp/message";
import {
  getActiveWhatsAppProviderLabel,
  sendWhatsAppMessage,
} from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      debtorId?: string;
      memberId?: string;
      accountId?: string;
      type?: "payment" | "credentials";
      phone?: string;
      message?: string;
    };

    const sends: { phone: string; message: string }[] = [];

    if (body.type === "credentials" && body.accountId) {
      const account = demoAccounts.find((a) => a.id === body.accountId);
      if (!account) {
        return NextResponse.json(
          { ok: false, error: "Cuenta no encontrada." },
          { status: 404 },
        );
      }

      const recipients = activeMembersForAccount(account.id);
      if (recipients.length === 0) {
        return NextResponse.json(
          {
            ok: false,
            error: "No hay miembros vigentes (al día / por vencer) para avisar.",
          },
          { status: 400 },
        );
      }

      for (const member of recipients) {
        sends.push({
          phone: member.phone,
          message: buildCredentialChangeMessage(member, account),
        });
      }
    } else if (body.memberId) {
      const member = demoMembers.find((m) => m.id === body.memberId);
      if (!member) {
        return NextResponse.json(
          { ok: false, error: "Miembro no encontrado." },
          { status: 404 },
        );
      }
      const account = demoAccounts.find((a) => a.id === member.accountId);
      sends.push({
        phone: member.phone,
        message: `Hola ${member.name}, te recordamos tu pago de $${member.amount} por ${account?.service ?? "tu servicio"}, con vencimiento el ${member.dueDate}. ¿Me confirmas cuando puedas?`,
      });
    } else if (body.debtorId) {
      const debtor = demoDebtors.find((d) => d.id === body.debtorId);
      if (!debtor) {
        return NextResponse.json(
          { ok: false, error: "Deudor no encontrado." },
          { status: 404 },
        );
      }
      sends.push({
        phone: debtor.phone,
        message: buildPaymentReminderMessage(debtor),
      });
    } else if (body.phone && body.message) {
      sends.push({ phone: body.phone.trim(), message: body.message.trim() });
    } else {
      return NextResponse.json(
        { ok: false, error: "Faltan datos para enviar." },
        { status: 400 },
      );
    }

    const consumed = await consumeQuota(sends.length);
    if (!consumed.ok) {
      return NextResponse.json(
        { ok: false, error: consumed.error, quota: consumed.quota },
        { status: 402 },
      );
    }

    const results = [];
    for (const item of sends) {
      const result = await sendWhatsAppMessage(item);
      if (!result.ok) {
        return NextResponse.json(
          {
            ...result,
            activeProvider: getActiveWhatsAppProviderLabel(),
            quota: consumed.quota,
          },
          { status: 502 },
        );
      }
      results.push(result);
    }

    const last = results[results.length - 1];

    return NextResponse.json({
      ...last,
      sentCount: results.length,
      activeProvider: getActiveWhatsAppProviderLabel(),
      quota: consumed.quota,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error interno al enviar WhatsApp." },
      { status: 500 },
    );
  }
}

export async function GET() {
  const quota = await readQuotaState();
  return NextResponse.json({
    activeProvider: getActiveWhatsAppProviderLabel(),
    quota,
  });
}
