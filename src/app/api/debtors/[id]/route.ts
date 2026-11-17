import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computePaymentStatus } from "@/lib/payment-status";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const existing = await prisma.debtor.findFirst({
    where: { id, businessId: auth.business.id },
  });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "No encontrado." }, { status: 404 });
  }

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    service?: string;
    amount?: number | string;
    dueDate?: string;
    markPaid?: boolean;
  };

  let dueDate = existing.dueDate;
  if (body.dueDate) {
    dueDate = new Date(`${body.dueDate}T00:00:00.000Z`);
  } else if (body.markPaid) {
    const next = new Date(existing.dueDate);
    next.setUTCMonth(next.getUTCMonth() + 1);
    dueDate = next;
  }

  const debtor = await prisma.debtor.update({
    where: { id },
    data: {
      name: body.name?.trim() || existing.name,
      phone: body.phone?.replace(/\D/g, "") || existing.phone,
      service: body.service?.trim() || existing.service,
      amount: body.amount !== undefined ? Number(body.amount) : existing.amount,
      dueDate,
      status: computePaymentStatus(dueDate),
    },
  });

  return NextResponse.json({
    ok: true,
    debtor: {
      ...debtor,
      amount: Number(debtor.amount),
      dueDate: debtor.dueDate.toISOString().slice(0, 10),
    },
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const existing = await prisma.debtor.findFirst({
    where: { id, businessId: auth.business.id },
  });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "No encontrado." }, { status: 404 });
  }

  await prisma.debtor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
