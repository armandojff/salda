export type PlanId = "simple" | "streaming";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  waLimit: number;
  tagline: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  simple: {
    id: "simple",
    name: "Simple",
    price: 3,
    waLimit: 100,
    tagline: "Cobranza clásica",
    description:
      "Para quien solo necesita saber quién debe y avisar por WhatsApp.",
    features: [
      "Clientes, montos y vencimientos",
      "Estados 🔴 debe / 🟢 al día",
      "Avisos de cobro por WhatsApp",
      "100 avisos WhatsApp / mes",
      "Dashboard y alertas al dueño",
    ],
  },
  streaming: {
    id: "streaming",
    name: "Servicios",
    price: 5,
    waLimit: 250,
    tagline: "Servicios compartidos",
    description:
      "Netflix, Spotify y más: un servicio, varias personas, avisos de clave a vigentes.",
    highlighted: true,
    features: [
      "Todo lo del plan Simple",
      "Servicios con correo y clave",
      "Varias personas por servicio",
      "Alerta de vencimiento (por vencer)",
      "Aviso de credenciales solo a vigentes",
      "250 avisos WhatsApp / mes",
    ],
  },
};

export const PLAN_LIST: Plan[] = [PLANS.simple, PLANS.streaming];

export function getPlan(id: PlanId | string | null | undefined): Plan {
  if (id === "streaming") return PLANS.streaming;
  return PLANS.simple;
}

export function isPlanId(value: string): value is PlanId {
  return value === "simple" || value === "streaming";
}
