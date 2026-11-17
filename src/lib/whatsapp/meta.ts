import type {
  SendWhatsAppInput,
  SendWhatsAppResult,
  WhatsAppProvider,
} from "@/lib/whatsapp/types";

/**
 * Stub para producción futura con WhatsApp Cloud API (Meta).
 * Se activará con WHATSAPP_PROVIDER=meta + credenciales WABA.
 */
export class MetaCloudProvider implements WhatsAppProvider {
  name = "meta" as const;

  async sendMessage(_input: SendWhatsAppInput): Promise<SendWhatsAppResult> {
    return {
      ok: false,
      provider: "meta",
      error:
        "Meta Cloud API aún no está conectada. En desarrollo usa Green API (WHATSAPP_PROVIDER=green-api).",
    };
  }
}
