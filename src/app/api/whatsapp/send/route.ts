import { NextResponse } from "next/server";
import { demoDebtors } from "@/lib/demo-data";
import { buildPaymentReminderMessage } from "@/lib/whatsapp/message";
import {
  getActiveWhatsAppProviderLabel,
  sendWhatsAppMessage,
} from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      debtorId?: string;
      phone?: string;
      message?: string;
    };

    let phone = body.phone?.trim();
    let message = body.message?.trim();

    if (body.debtorId) {
      const debtor = demoDebtors.find((d) => d.id === body.debtorId);
      if (!debtor) {
        return NextResponse.json(
          { ok: false, error: "Deudor no encontrado." },
          { status: 404 },
        );
      }
      phone = debtor.phone;
      message = buildPaymentReminderMessage(debtor);
    }

    if (!phone || !message) {
      return NextResponse.json(
        { ok: false, error: "Faltan teléfono o mensaje." },
        { status: 400 },
      );
    }

    const result = await sendWhatsAppMessage({ phone, message });

    return NextResponse.json({
      ...result,
      activeProvider: getActiveWhatsAppProviderLabel(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error interno al enviar WhatsApp." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    activeProvider: getActiveWhatsAppProviderLabel(),
  });
}
