import { NextResponse } from "next/server";
import { getPlan, isPlanId } from "@/lib/plans";
import { readQuotaState, setPlanCookie } from "@/lib/quota";

export async function GET() {
  const quota = await readQuotaState();
  const plan = getPlan(quota.planId);
  return NextResponse.json({
    planId: quota.planId,
    planName: plan.name,
    price: plan.price,
    waLimit: quota.limit,
    waUsed: quota.used,
    waRemaining: quota.remaining,
    month: quota.month,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { planId?: string };
  if (!body.planId || !isPlanId(body.planId)) {
    return NextResponse.json({ ok: false, error: "Plan inválido." }, { status: 400 });
  }

  await setPlanCookie(body.planId);
  const plan = getPlan(body.planId);
  const quota = await readQuotaState();

  return NextResponse.json({
    ok: true,
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    waLimit: plan.waLimit,
    // used puede seguir el mes actual; el plan nuevo aplica el tope nuevo
    waUsed: quota.used,
    waRemaining: Math.max(0, plan.waLimit - quota.used),
  });
}
