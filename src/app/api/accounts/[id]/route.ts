import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto-secret";
import { prisma } from "@/lib/db";
import { notifyActiveMembersCredentials } from "@/lib/notify-credentials";

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
    return NextResponse.json({ ok: false, error: "Servicio no encontrado." }, { status: 404 });
  }

  const body = (await request.json()) as {
    service?: string;
    email?: string;
    password?: string;
    notify?: boolean;
  };

  const nextEmail = body.email?.trim() || existing.email;
  const nextService = body.service?.trim() || existing.service;
  const passwordChanged = Boolean(body.password && body.password.length > 0);
  const emailChanged = nextEmail !== existing.email;
  const serviceChanged = nextService !== existing.service;
  const credentialsTouched = passwordChanged || emailChanged;

  const account = await prisma.sharedAccount.update({
    where: { id },
    data: {
      service: nextService,
      email: nextEmail,
      passwordEnc: passwordChanged ? encryptSecret(body.password!) : existing.passwordEnc,
      status: "ok",
    },
  });

  let notifyResult: Awaited<ReturnType<typeof notifyActiveMembersCredentials>> | null =
    null;

  // Al guardar correo y/o clave, avisamos a vigentes (🟢 y 🟡), nunca a 🔴.
  if (body.notify !== false && (credentialsTouched || serviceChanged)) {
    notifyResult = await notifyActiveMembersCredentials({
      businessId: auth.business.id,
      plan: auth.business.plan,
      account,
    });
  }

  return NextResponse.json({
    ok: true,
    account: {
      id: account.id,
      service: account.service,
      email: account.email,
      status: account.status,
    },
    notified: notifyResult,
  });
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
    return NextResponse.json({ ok: false, error: "Servicio no encontrado." }, { status: 404 });
  }

  await prisma.sharedAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
