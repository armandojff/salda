import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto-secret";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const existing = await prisma.sharedAccount.findFirst({
    where: { id, businessId: auth.business.id },
  });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Cuenta no encontrada." }, { status: 404 });
  }

  const body = (await request.json()) as {
    service?: string;
    email?: string;
    password?: string;
    status?: "ok" | "down";
  };

  const account = await prisma.sharedAccount.update({
    where: { id },
    data: {
      service: body.service?.trim() || existing.service,
      email: body.email?.trim() || existing.email,
      passwordEnc: body.password ? encryptSecret(body.password) : existing.passwordEnc,
      status: body.status || existing.status,
    },
  });

  return NextResponse.json({ ok: true, account });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const existing = await prisma.sharedAccount.findFirst({
    where: { id, businessId: auth.business.id },
  });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Cuenta no encontrada." }, { status: 404 });
  }

  await prisma.sharedAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
