import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computePaymentStatus } from "@/lib/payment-status";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id: accountId } = await ctx.params;
  const account = await prisma.sharedAccount.findFirst({
    where: { id: accountId, businessId: auth.business.id },
  });
  if (!account) {
    return NextResponse.json({ ok: false, error: "Servicio no encontrado." }, { status: 404 });
  }

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    amount?: number | string | null;
    dueDate?: string;
  };

  const name = body.name?.trim();
  const phone = body.phone?.replace(/\D/g, "");
  const dueDate = body.dueDate ? new Date(`${body.dueDate}T00:00:00.000Z`) : null;

  const rawAmount = body.amount;
  const amount =
    rawAmount === undefined || rawAmount === null || String(rawAmount).trim() === ""
      ? 0
      : Number(rawAmount);

  if (!name || !phone || !dueDate || Number.isNaN(amount)) {
    return NextResponse.json(
      { ok: false, error: "Nombre, teléfono y fecha de vencimiento son obligatorios." },
      { status: 400 },
    );
  }

  const member = await prisma.member.create({
    data: {
      accountId,
      name,
      phone,
      amount,
      dueDate,
      status: computePaymentStatus(dueDate),
    },
  });

  return NextResponse.json({
    ok: true,
    member: {
      ...member,
      amount: Number(member.amount),
      dueDate: member.dueDate.toISOString().slice(0, 10),
      status: computePaymentStatus(member.dueDate),
    },
  });
}
