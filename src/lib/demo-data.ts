export type DebtorStatus = "debe" | "pronto" | "ok";

export type Debtor = {
  id: string;
  name: string;
  service: string;
  phone: string;
  amount: number;
  dueDate: string;
  status: DebtorStatus;
  lastNotified?: string;
};

export const demoDebtors: Debtor[] = [
  {
    id: "1",
    name: "María Rivas",
    service: "Streaming familiar",
    phone: "584121112233",
    amount: 12,
    dueDate: "2026-11-17",
    status: "debe",
  },
  {
    id: "2",
    name: "Luis Ortega",
    service: "Hosting web",
    phone: "584141223344",
    amount: 28,
    dueDate: "2026-11-19",
    status: "pronto",
  },
  {
    id: "3",
    name: "Ana Pérez",
    service: "VPN mensual",
    phone: "584161334455",
    amount: 8,
    dueDate: "2026-12-01",
    status: "ok",
    lastNotified: "2026-11-10",
  },
  {
    id: "4",
    name: "Carlos Díaz",
    service: "Canva Pro",
    phone: "584241445566",
    amount: 15,
    dueDate: "2026-11-16",
    status: "debe",
  },
  {
    id: "5",
    name: "Sofía Mendoza",
    service: "Curso digital",
    phone: "584261556677",
    amount: 40,
    dueDate: "2026-11-18",
    status: "pronto",
  },
];

export const statusLabel: Record<DebtorStatus, string> = {
  debe: "Debe",
  pronto: "Por vencer",
  ok: "Al día",
};

export const statusClass: Record<DebtorStatus, string> = {
  debe: "bg-danger/15 text-danger",
  pronto: "bg-warning/15 text-warning",
  ok: "bg-success/15 text-success",
};
