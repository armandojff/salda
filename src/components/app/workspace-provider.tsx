"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { PlanId } from "@/lib/plans";

type WorkspaceState = {
  authenticated: boolean;
  planId: PlanId;
  planName: string;
  price: number;
  waLimit: number;
  waUsed: number;
  waRemaining: number;
  businessName: string;
  businessEmail: string;
  loading: boolean;
  refresh: () => Promise<void>;
  setPlan: (planId: PlanId) => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState({
    authenticated: false,
    planId: "simple" as PlanId,
    planName: "Simple",
    price: 3,
    waLimit: 100,
    waUsed: 0,
    waRemaining: 100,
    businessName: "",
    businessEmail: "",
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace");
      if (res.status === 401) {
        setState((prev) => ({ ...prev, authenticated: false, loading: false }));
        router.replace("/login");
        return;
      }
      const data = (await res.json()) as {
        planId: PlanId;
        planName: string;
        price: number;
        waLimit: number;
        waUsed: number;
        waRemaining: number;
        businessName?: string;
        businessEmail?: string;
      };
      setState({
        authenticated: true,
        planId: data.planId,
        planName: data.planName,
        price: data.price,
        waLimit: data.waLimit,
        waUsed: data.waUsed,
        waRemaining: data.waRemaining,
        businessName: data.businessName || "",
        businessEmail: data.businessEmail || "",
        loading: false,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [router]);

  const setPlan = useCallback(
    async (planId: PlanId) => {
      await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ ...state, refresh, setPlan }),
    [state, refresh, setPlan],
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace debe usarse dentro de WorkspaceProvider");
  }
  return ctx;
}
