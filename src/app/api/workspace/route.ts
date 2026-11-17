import { NextResponse } from "next/server";
import { createSession, requireBusiness } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlan, isPlanId } from "@/lib/plans";
import { getBusinessQuota } from "@/lib/wa-quota-db";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }

  const plan = getPlan(auth.business.plan);
  const quota = await getBusinessQuota(auth.business.id, auth.business.plan);

  return NextResponse.json({
    ok: true,
    authenticated: true,
    planId: auth.business.plan,
    planName: plan.name,
    price: plan.price,
    waLimit: quota.limit,
    waUsed: quota.used,
    waRemaining: quota.remaining,
    month: quota.month,
    businessName: auth.business.name,
    businessEmail: auth.business.email,
  });
}

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const body = (await request.json()) as { planId?: string };
  if (!body.planId || !isPlanId(body.planId)) {
    return NextResponse.json({ ok: false, error: "Plan inválido." }, { status: 400 });
  }

  const business = await prisma.business.update({
    where: { id: auth.business.id },
    data: { plan: body.planId },
  });

  await createSession({
    businessId: business.id,
    email: business.email,
    plan: business.plan,
  });

  const plan = getPlan(business.plan);
  const quota = await getBusinessQuota(business.id, business.plan);

  return NextResponse.json({
    ok: true,
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    waLimit: plan.waLimit,
    waUsed: quota.used,
    waRemaining: quota.remaining,
  });
}
