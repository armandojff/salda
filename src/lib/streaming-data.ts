import type { DebtorStatus } from "@/lib/demo-data";

export type AccountStatus = "ok" | "down";

export type ServiceAccount = {
  id: string;
  service: string;
  email: string;
  /** Demo only — en producción va cifrado */
  password: string;
  status: AccountStatus;
};

export type AccountMember = {
  id: string;
  accountId: string;
  name: string;
  phone: string;
  amount: number;
  dueDate: string;
  status: DebtorStatus;
};

export const demoAccounts: ServiceAccount[] = [
  {
    id: "acc-1",
    service: "Netflix",
    email: "familia.netflix@mail.com",
    password: "Netflix2026!",
    status: "ok",
  },
  {
    id: "acc-2",
    service: "Spotify",
    email: "spot.premium@mail.com",
    password: "Spoty#88",
    status: "down",
  },
  {
    id: "acc-3",
    service: "Disney+",
    email: "disney.casa@mail.com",
    password: "DisneyOk1",
    status: "ok",
  },
];

export const demoMembers: AccountMember[] = [
  {
    id: "m1",
    accountId: "acc-1",
    name: "María Rivas",
    phone: "584121112233",
    amount: 4,
    dueDate: "2026-11-17",
    status: "debe",
  },
  {
    id: "m2",
    accountId: "acc-1",
    name: "Luis Ortega",
    phone: "584141223344",
    amount: 4,
    dueDate: "2026-12-01",
    status: "ok",
  },
  {
    id: "m3",
    accountId: "acc-1",
    name: "Ana Pérez",
    phone: "584161334455",
    amount: 4,
    dueDate: "2026-12-01",
    status: "ok",
  },
  {
    id: "m4",
    accountId: "acc-1",
    name: "Carlos Díaz",
    phone: "584241445566",
    amount: 4,
    dueDate: "2026-12-05",
    status: "ok",
  },
  {
    id: "m5",
    accountId: "acc-1",
    name: "Sofía Mendoza",
    phone: "584261556677",
    amount: 4,
    dueDate: "2026-11-20",
    status: "pronto",
  },
  {
    id: "m6",
    accountId: "acc-2",
    name: "Pedro Ruiz",
    phone: "584121998877",
    amount: 3,
    dueDate: "2026-11-16",
    status: "debe",
  },
  {
    id: "m7",
    accountId: "acc-2",
    name: "Elena Vargas",
    phone: "584141887766",
    amount: 3,
    dueDate: "2026-12-02",
    status: "ok",
  },
  {
    id: "m8",
    accountId: "acc-3",
    name: "Jorge Silva",
    phone: "584161776655",
    amount: 5,
    dueDate: "2026-12-10",
    status: "ok",
  },
];

export function membersForAccount(accountId: string) {
  return demoMembers.filter((m) => m.accountId === accountId);
}

export function activeMembersForAccount(accountId: string) {
  return membersForAccount(accountId).filter((m) => m.status !== "debe");
}

export function buildCredentialChangeMessage(
  member: AccountMember,
  account: ServiceAccount,
) {
  return `Hola ${member.name}, actualizamos tu acceso a ${account.service}. Nuevo correo: ${account.email} | Nueva clave: ${account.password}. Si tienes dudas, escríbenos.`;
}
