import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email y contraseña requeridos." },
        { status: 400 },
      );
    }

    const business = await prisma.business.findUnique({ where: { email } });
    if (!business || !(await verifyPassword(password, business.passwordHash))) {
      return NextResponse.json(
        { ok: false, error: "Credenciales inválidas." },
        { status: 401 },
      );
    }

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
      { ok: false, error: "Error al iniciar sesión. Revisa la base de datos." },
      { status: 500 },
    );
  }
}
