import { toWhatsAppChatId } from "@/lib/whatsapp/message";
import type {
  SendWhatsAppInput,
  SendWhatsAppResult,
  WhatsAppProvider,
} from "@/lib/whatsapp/types";

type GreenApiConfig = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

function getGreenApiConfig(): GreenApiConfig | null {
  const apiUrl = process.env.GREEN_API_URL?.replace(/\/$/, "");
  const idInstance = process.env.GREEN_API_INSTANCE_ID;
  const apiTokenInstance = process.env.GREEN_API_TOKEN;

  if (!apiUrl || !idInstance || !apiTokenInstance) {
    return null;
  }

  return { apiUrl, idInstance, apiTokenInstance };
}

export function isGreenApiConfigured() {
  return getGreenApiConfig() !== null;
}

export class GreenApiProvider implements WhatsAppProvider {
  name = "green-api" as const;

  async sendMessage(input: SendWhatsAppInput): Promise<SendWhatsAppResult> {
    const config = getGreenApiConfig();
    if (!config) {
      return {
        ok: false,
        provider: "green-api",
        error:
          "Green API no está configurada. Agrega GREEN_API_URL, GREEN_API_INSTANCE_ID y GREEN_API_TOKEN.",
      };
    }

    const url = `${config.apiUrl}/waInstance${config.idInstance}/sendMessage/${config.apiTokenInstance}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: toWhatsAppChatId(input.phone),
          message: input.message,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        idMessage?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        return {
          ok: false,
          provider: "green-api",
          error:
            data?.message ||
            `Green API respondió ${response.status}. Revisa instancia, token y que el WhatsApp esté conectado (QR).`,
        };
      }

      return {
        ok: true,
        provider: "green-api",
        mode: "automatic",
        messageId: data?.idMessage,
      };
    } catch (error) {
      return {
        ok: false,
        provider: "green-api",
        error:
          error instanceof Error
            ? error.message
            : "No se pudo conectar con Green API.",
      };
    }
  }
}
