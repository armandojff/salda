import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { decryptSecret } from "@/lib/crypto-secret";
import { prisma } from "@/lib/db";
import { computePaymentStatus } from "@/lib/payment-status";
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
      type?: "payment" | "credentials";
    };

    const sends: { phone: string; message: string; markIds?: { debtorId?: string; memberId?: string } }[] =
      [];

    if (body.type === "credentials" && body.accountId) {
      const account = await prisma.sharedAccount.findFirst({
        where: { id: body.accountId, businessId: auth.business.id },
        include: { members: true },
      });
      if (!account) {
        return NextResponse.json({ ok: false, error: "Cuenta no encontrada." }, { status: 404 });
      }

      const password = decryptSecret(account.passwordEnc);
      const vigentes = account.members.filter(
        (m) => computePaymentStatus(m.dueDate) !== "debe",
      );

      if (vigentes.length === 0) {
        return NextResponse.json(
          { ok: false, error: "No hay miembros vigentes para avisar." },
          { status: 400 },
        );
      }

      for (const member of vigentes) {
        sends.push({
          phone: member.phone,
          message: `Hola ${member.name}, actualizamos tu acceso a ${account.service}. Nuevo correo: ${account.email} | Nueva clave: ${password}. Si tienes dudas, escríbenos.`,
        });
      }
    } else if (body.memberId) {
      const member = await prisma.member.findFirst({
        where: {
          id: body.memberId,
          account: { businessId: auth.business.id },
        },
        include: { account: true },
      });
      if (!member) {
        return NextResponse.json({ ok: false, error: "Miembro no encontrado." }, { status: 404 });
      }
      sends.push({
        phone: member.phone,
        message: `Hola ${member.name}, te recordamos tu pago de $${Number(member.amount)} por ${member.account.service}, con vencimiento el ${member.dueDate.toISOString().slice(0, 10)}. ¿Me confirmas cuando puedas?`,
        markIds: { memberId: member.id },
      });
    } else if (body.debtorId) {
      const debtor = await prisma.debtor.findFirst({
        where: { id: body.debtorId, businessId: auth.business.id },
      });
      if (!debtor) {
        return NextResponse.json({ ok: false, error: "Deudor no encontrado." }, { status: 404 });
      }
      sends.push({
        phone: debtor.phone,
        message: `Hola ${debtor.name}, te recordamos tu pago de $${Number(debtor.amount)} por ${debtor.service}, con vencimiento el ${debtor.dueDate.toISOString().slice(0, 10)}. ¿Me confirmas cuando puedas?`,
        markIds: { debtorId: debtor.id },
      });
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
