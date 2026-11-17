import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computePaymentStatus } from "@/lib/payment-status";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const debtors = await prisma.debtor.findMany({
    where: { businessId: auth.business.id },
    orderBy: [{ dueDate: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({
    ok: true,
    debtors: debtors.map((d) => ({
      ...d,
      amount: Number(d.amount),
      dueDate: d.dueDate.toISOString().slice(0, 10),
      status: computePaymentStatus(d.dueDate),
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    service?: string;
    amount?: number | string;
    dueDate?: string;
  };

  const name = body.name?.trim();
  const phone = body.phone?.replace(/\D/g, "");
  const service = body.service?.trim() || "Servicio";
  const amount = Number(body.amount);
  const dueDate = body.dueDate ? new Date(`${body.dueDate}T00:00:00.000Z`) : null;

  if (!name || !phone || !dueDate || Number.isNaN(amount)) {
    return NextResponse.json(
      { ok: false, error: "Nombre, teléfono, monto y vencimiento son obligatorios." },
      { status: 400 },
    );
  }

  const debtor = await prisma.debtor.create({
    data: {
      businessId: auth.business.id,
      name,
      phone,
      service,
      amount,
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
