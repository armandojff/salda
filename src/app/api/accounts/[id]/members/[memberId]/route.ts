import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string; memberId: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id: accountId, memberId } = await ctx.params;

  const account = await prisma.sharedAccount.findFirst({
    where: { id: accountId, businessId: auth.business.id },
  });
  if (!account) {
    return NextResponse.json({ ok: false, error: "Servicio no encontrado." }, { status: 404 });
  }

  const member = await prisma.member.findFirst({
    where: { id: memberId, accountId },
  });
  if (!member) {
    return NextResponse.json({ ok: false, error: "Persona no encontrada." }, { status: 404 });
  }

  await prisma.member.delete({ where: { id: memberId } });

  return NextResponse.json({
    ok: true,
    removedName: member.name,
    accountId,
    service: account.service,
  });
}
