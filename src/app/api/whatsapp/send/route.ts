import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computePaymentStatus } from "@/lib/payment-status";
import {
  buildCredentialsMessage,
  buildExpiringMessage,
  notifyActiveMembersCredentials,
} from "@/lib/notify-credentials";
import { decryptSecret } from "@/lib/crypto-secret";
import { consumeBusinessQuota, getBusinessQuota } from "@/lib/wa-quota-db";
import {
  getActiveWhatsAppProviderLabel,
  sendWhatsAppMessage,
} from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const auth = await requireBusiness();
    if ("error" in auth) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const body = (await request.json()) as {
      debtorId?: string;
      memberId?: string;
      accountId?: string;
      type?: "payment" | "credentials" | "expiring";
    };

    if (body.type === "credentials" && body.accountId) {
      const account = await prisma.sharedAccount.findFirst({
        where: { id: body.accountId, businessId: auth.business.id },
      });
      if (!account) {
        return NextResponse.json({ ok: false, error: "Servicio no encontrado." }, { status: 404 });
      }

      const result = await notifyActiveMembersCredentials({
        businessId: auth.business.id,
        plan: auth.business.plan,
        account,
      });

      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error, quota: "quota" in result ? result.quota : undefined },
          { status: 402 },
        );
      }

      return NextResponse.json({
        ok: true,
        mode: "automatic",
        sentCount: result.sentCount,
        activeProvider: getActiveWhatsAppProviderLabel(),
        quota: "quota" in result ? result.quota : undefined,
      });
    }

    const sends: {
      phone: string;
      message: string;
      markIds?: { debtorId?: string; memberId?: string };
    }[] = [];

    if (body.memberId) {
      const member = await prisma.member.findFirst({
        where: {
          id: body.memberId,
          account: { businessId: auth.business.id },
        },
        include: { account: true },
      });
      if (!member) {
        return NextResponse.json({ ok: false, error: "Persona no encontrada." }, { status: 404 });
      }

      const status = computePaymentStatus(member.dueDate);
      const due = member.dueDate.toISOString().slice(0, 10);
      const amount = Number(member.amount);

      if (body.type === "expiring" || status === "pronto") {
        sends.push({
          phone: member.phone,
          message: buildExpiringMessage(member.name, member.account.service, due, amount),
          markIds: { memberId: member.id },
        });
      } else if (status === "debe") {
        sends.push({
          phone: member.phone,
          message: `Hola ${member.name}, tu pago de ${member.account.service} está vencido (${due})${amount > 0 ? ` · $${amount}` : ""}. ¿Me confirmas cuando puedas?`,
          markIds: { memberId: member.id },
        });
      } else {
        const password = decryptSecret(member.account.passwordEnc);
        sends.push({
          phone: member.phone,
          message: buildCredentialsMessage(
            member.name,
            member.account.service,
            member.account.email,
            password,
          ),
          markIds: { memberId: member.id },
        });
      }
    } else if (body.debtorId) {
      const debtor = await prisma.debtor.findFirst({
        where: { id: body.debtorId, businessId: auth.business.id },
      });
      if (!debtor) {
        return NextResponse.json({ ok: false, error: "Deudor no encontrado." }, { status: 404 });
      }
      const status = computePaymentStatus(debtor.dueDate);
      const due = debtor.dueDate.toISOString().slice(0, 10);
      const amount = Number(debtor.amount);

      if (status === "pronto") {
        sends.push({
          phone: debtor.phone,
          message: buildExpiringMessage(debtor.name, debtor.service, due, amount),
          markIds: { debtorId: debtor.id },
        });
      } else {
        sends.push({
          phone: debtor.phone,
          message: `Hola ${debtor.name}, te recordamos tu pago de $${amount} por ${debtor.service}, con vencimiento el ${due}. ¿Me confirmas cuando puedas?`,
          markIds: { debtorId: debtor.id },
        });
      }
    } else {
      return NextResponse.json({ ok: false, error: "Faltan datos para enviar." }, { status: 400 });
    }

    const consumed = await consumeBusinessQuota(
      auth.business.id,
      auth.business.plan,
      sends.length,
    );
    if (!consumed.ok) {
      return NextResponse.json(
        { ok: false, error: consumed.error, quota: consumed.quota },
        { status: 402 },
      );
    }

    const results = [];
    for (const item of sends) {
      const result = await sendWhatsAppMessage({
        phone: item.phone,
        message: item.message,
      });
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

      if (item.markIds?.debtorId) {
        await prisma.debtor.update({
          where: { id: item.markIds.debtorId },
          data: { lastNotifiedAt: new Date() },
        });
      }
      if (item.markIds?.memberId) {
        await prisma.member.update({
          where: { id: item.markIds.memberId },
          data: { lastNotifiedAt: new Date() },
        });
      }

      results.push(result);
    }

    return NextResponse.json({
      ...results[results.length - 1],
      sentCount: results.length,
      activeProvider: getActiveWhatsAppProviderLabel(),
      quota: consumed.quota,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Error interno al enviar WhatsApp." },
      { status: 500 },
    );
  }
}

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({
      activeProvider: getActiveWhatsAppProviderLabel(),
      authenticated: false,
    });
  }

  const quota = await getBusinessQuota(auth.business.id, auth.business.plan);
  return NextResponse.json({
    activeProvider: getActiveWhatsAppProviderLabel(),
    authenticated: true,
    quota,
  });
}
