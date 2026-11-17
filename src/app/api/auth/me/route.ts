import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { getBusinessQuota } from "@/lib/wa-quota-db";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { business } = auth;
  const plan = getPlan(business.plan);
  const quota = await getBusinessQuota(business.id, business.plan);

  return NextResponse.json({
    ok: true,
    business: {
      id: business.id,
      name: business.name,
      email: business.email,
      plan: business.plan,
    },
    planId: business.plan,
    planName: plan.name,
    price: plan.price,
    waLimit: quota.limit,
    waUsed: quota.used,
    waRemaining: quota.remaining,
    month: quota.month,
  });
}
