import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { encryptSecret, decryptSecret } from "@/lib/crypto-secret";
import { prisma } from "@/lib/db";
import { computePaymentStatus } from "@/lib/payment-status";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  if (auth.business.plan !== "streaming") {
    return NextResponse.json(
      { ok: false, error: "Tu plan actual es Simple. Cambia a Servicios para gestionar servicios compartidos." },
      { status: 403 },
    );
  }

  const accounts = await prisma.sharedAccount.findMany({
    where: { businessId: auth.business.id },
    include: { members: { orderBy: { name: "asc" } } },
    orderBy: { service: "asc" },
  });

  return NextResponse.json({
    ok: true,
    accounts: accounts.map((a) => ({
      id: a.id,
      service: a.service,
      email: a.email,
      password: decryptSecret(a.passwordEnc),
      status: a.status,
      members: a.members.map((m) => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        amount: Number(m.amount),
        dueDate: m.dueDate.toISOString().slice(0, 10),
        status: computePaymentStatus(m.dueDate),
      })),
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  if (auth.business.plan !== "streaming") {
    return NextResponse.json(
      { ok: false, error: "Necesitas el plan Servicios." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    service?: string;
    email?: string;
    password?: string;
  };

  const service = body.service?.trim();
  const email = body.email?.trim();
  const password = body.password;

  if (!service || !email || !password) {
    return NextResponse.json(
      { ok: false, error: "Servicio, correo y clave son obligatorios." },
      { status: 400 },
    );
  }

  const account = await prisma.sharedAccount.create({
    data: {
      businessId: auth.business.id,
      service,
      email,
      passwordEnc: encryptSecret(password),
      status: "ok",
    },
  });

  return NextResponse.json({
    ok: true,
    account: {
      id: account.id,
      service: account.service,
      email: account.email,
      status: account.status,
    },
  });
}
