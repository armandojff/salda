import { buildWaMeUrl } from "@/lib/whatsapp/message";
import { GreenApiProvider, isGreenApiConfigured } from "@/lib/whatsapp/green-api";
import { MetaCloudProvider } from "@/lib/whatsapp/meta";
import type {
  SendWhatsAppInput,
  SendWhatsAppResult,
  WhatsAppProvider,
  WhatsAppProviderName,
} from "@/lib/whatsapp/types";

function resolveProviderName(): WhatsAppProviderName {
  const raw = (process.env.WHATSAPP_PROVIDER || "green-api").toLowerCase();
  if (raw === "meta" || raw === "wa-me" || raw === "green-api") {
    return raw;
  }
  return "green-api";
}

export function getWhatsAppProvider(): WhatsAppProvider {
  const name = resolveProviderName();
  if (name === "meta") return new MetaCloudProvider();
  if (name === "wa-me") {
    return {
      name: "wa-me",
      async sendMessage(input: SendWhatsAppInput): Promise<SendWhatsAppResult> {
        return {
          ok: true,
          provider: "wa-me",
          mode: "manual",
          waMeUrl: buildWaMeUrl(input.phone, input.message),
        };
      },
    };
  }
  return new GreenApiProvider();
}

export async function sendWhatsAppMessage(
  input: SendWhatsAppInput,
): Promise<SendWhatsAppResult> {
  const providerName = resolveProviderName();

  // Si pidieron Green API pero no hay credenciales, caemos a wa.me para no romper el demo.
  if (providerName === "green-api" && !isGreenApiConfigured()) {
    return {
      ok: true,
      provider: "wa-me",
      mode: "manual",
      waMeUrl: buildWaMeUrl(input.phone, input.message),
    };
  }

  return getWhatsAppProvider().sendMessage(input);
}

export function getActiveWhatsAppProviderLabel() {
  const name = resolveProviderName();
  if (name === "green-api" && !isGreenApiConfigured()) {
    return "wa-me (fallback: falta configurar Green API)";
  }
  return name;
}
