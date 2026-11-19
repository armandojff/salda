"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirección: el módulo pasó a llamarse Servicios. */
export default function CuentasRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/servicios");
  }, [router]);
  return <p className="text-sm text-muted">Redirigiendo a Servicios…</p>;
}
