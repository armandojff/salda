import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPlanId } from "@/lib/plans";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      planId?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const planId = body.planId && isPlanId(body.planId) ? body.planId : "simple";

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Datos incompletos o contraseña muy corta." },
        { status: 400 },
      );
    }

    const exists = await prisma.business.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Ya existe una cuenta con ese email." },
        { status: 409 },
      );
    }

    const business = await prisma.business.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        plan: planId,
      },
    });

    await createSession({
      businessId: business.id,
      email: business.email,
      plan: business.plan,
    });

    return NextResponse.json({
      ok: true,
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        plan: business.plan,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "No se pudo registrar. Revisa que DATABASE_URL esté configurada y las tablas creadas.",
      },
      { status: 500 },
    );
  }
}
