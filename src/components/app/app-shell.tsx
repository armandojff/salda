"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutDashboard, LogOut, MessageCircle, Users } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/deudores", label: "Deudores", icon: Users },
  { href: "/app/avisos", label: "Avisos", icon: MessageCircle },
  { href: "/app/cuenta", label: "Cuenta", icon: Bell },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
        <aside className="hidden w-60 shrink-0 border-r border-card-border p-5 md:block">
          <Link href="/" className="font-display text-xl font-semibold">
            Salda<span className="text-accent">.</span>
          </Link>
          <nav className="mt-8 space-y-1">
            {nav.map((item) => {
              const active =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-accent-soft font-medium text-accent"
                      : "text-muted hover:bg-card hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-card-border px-3 text-sm text-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-card-border px-4 py-3 md:hidden">
            <Link href="/" className="font-display text-lg font-semibold">
              Salda<span className="text-accent">.</span>
            </Link>
            <ThemeToggle />
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>

          <nav className="sticky bottom-0 grid grid-cols-4 border-t border-card-border bg-[var(--nav)] backdrop-blur-xl md:hidden">
            {nav.map((item) => {
              const active =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                    active ? "text-accent" : "text-muted",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
