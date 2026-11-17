import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Plan } from "@prisma/client";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "salda_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    // Fallback solo para desarrollo local; en producción define AUTH_SECRET.
    return new TextEncoder().encode("salda-dev-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  businessId: string;
  email: string;
  plan: Plan;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const businessId = payload.businessId as string | undefined;
    const email = payload.email as string | undefined;
    const plan = payload.plan as Plan | undefined;
    if (!businessId || !email || !plan) return null;
    return { businessId, email, plan };
  } catch {
    return null;
  }
}

export async function requireBusiness() {
  const session = await getSession();
  if (!session) {
    return { error: "No autenticado." as const, status: 401 as const };
  }

  const business = await prisma.business.findUnique({
    where: { id: session.businessId },
  });

  if (!business) {
    return { error: "Negocio no encontrado." as const, status: 401 as const };
  }

  return { business, session };
}
