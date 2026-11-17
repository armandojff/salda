"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "#problema", label: "Problema" },
  { href: "#como", label: "Cómo funciona" },
  { href: "#producto", label: "Producto" },
  { href: "#precio", label: "Precio" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-card-border bg-[var(--nav)] backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          Salda
          <span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-sm text-muted transition hover:text-foreground sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:brightness-110"
          >
            Empezar
          </Link>
        </div>
      </div>
    </header>
  );
}
