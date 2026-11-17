import { cookies } from "next/headers";
import { getPlan, isPlanId, type PlanId } from "@/lib/plans";

export const COOKIE_PLAN = "salda_plan";
export const COOKIE_WA_USED = "salda_wa_used";
export const COOKIE_WA_MONTH = "salda_wa_month";

function currentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export type QuotaState = {
  planId: PlanId;
  limit: number;
  used: number;
  remaining: number;
  month: string;
};

export async function readQuotaState(): Promise<QuotaState> {
  const jar = await cookies();
  const planRaw = jar.get(COOKIE_PLAN)?.value ?? "simple";
  const planId: PlanId = isPlanId(planRaw) ? planRaw : "simple";
  const plan = getPlan(planId);
  const month = jar.get(COOKIE_WA_MONTH)?.value;
  const usedRaw = jar.get(COOKIE_WA_USED)?.value ?? "0";
  const key = currentMonthKey();

  const used = month === key ? Math.max(0, Number.parseInt(usedRaw, 10) || 0) : 0;

  return {
    planId,
    limit: plan.waLimit,
    used,
    remaining: Math.max(0, plan.waLimit - used),
    month: key,
  };
}

export async function consumeQuota(
  count = 1,
): Promise<
  | { ok: true; quota: QuotaState }
  | { ok: false; quota: QuotaState; error: string }
> {
  const quota = await readQuotaState();
  if (quota.remaining < count) {
    return {
      ok: false,
      quota,
      error: `Necesitas ${count} avisos y solo te quedan ${quota.remaining} este mes (tope ${quota.limit}, plan ${getPlan(quota.planId).name}).`,
    };
  }

  const jar = await cookies();
  const nextUsed = quota.used + count;
  jar.set(COOKIE_WA_USED, String(nextUsed), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 40,
  });
  jar.set(COOKIE_WA_MONTH, quota.month, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 40,
  });

  return {
    ok: true,
    quota: {
      ...quota,
      used: nextUsed,
      remaining: Math.max(0, quota.limit - nextUsed),
    },
  };
}

export async function setPlanCookie(planId: PlanId) {
  const jar = await cookies();
  jar.set(COOKIE_PLAN, planId, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
