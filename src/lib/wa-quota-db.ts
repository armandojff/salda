import { getPlan } from "@/lib/plans";
import type { Plan } from "@prisma/client";
import { prisma } from "@/lib/db";

function currentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getBusinessQuota(businessId: string, plan: Plan) {
  const month = currentMonthKey();
  const limit = getPlan(plan).waLimit;
  const row = await prisma.waUsage.findUnique({
    where: { businessId_month: { businessId, month } },
  });
  const used = row?.used ?? 0;
  return {
    planId: plan,
    month,
    limit,
    used,
    remaining: Math.max(0, limit - used),
  };
}

export async function consumeBusinessQuota(
  businessId: string,
  plan: Plan,
  count = 1,
) {
  const quota = await getBusinessQuota(businessId, plan);
  if (quota.remaining < count) {
    return {
      ok: false as const,
      quota,
      error: `Necesitas ${count} avisos y solo te quedan ${quota.remaining} este mes (tope ${quota.limit}).`,
    };
  }

  const row = await prisma.waUsage.upsert({
    where: {
      businessId_month: { businessId, month: quota.month },
    },
    create: {
      businessId,
      month: quota.month,
      used: count,
    },
    update: {
      used: { increment: count },
    },
  });

  return {
    ok: true as const,
    quota: {
      ...quota,
      used: row.used,
      remaining: Math.max(0, quota.limit - row.used),
    },
  };
}
