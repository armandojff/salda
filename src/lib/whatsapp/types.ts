export type WhatsAppProviderName = "green-api" | "meta" | "wa-me";

export type SendWhatsAppInput = {
  phone: string;
  message: string;
};

export type SendWhatsAppResult =
  | {
      ok: true;
      provider: WhatsAppProviderName;
      mode: "automatic";
      messageId?: string;
    }
  | {
      ok: true;
      provider: "wa-me";
      mode: "manual";
      waMeUrl: string;
    }
  | {
      ok: false;
      provider: WhatsAppProviderName;
      error: string;
    };

export interface WhatsAppProvider {
  name: WhatsAppProviderName;
  sendMessage(input: SendWhatsAppInput): Promise<SendWhatsAppResult>;
}
