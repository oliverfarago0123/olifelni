"use client";

import { createContext, useContext, useOptimistic, useTransition, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type CatalogNav = {
  /** The query the page is heading to: updated on the tap, before the server answers. */
  params: URLSearchParams;
  pending: boolean;
  go: (next: URLSearchParams) => void;
};

const Ctx = createContext<CatalogNav | null>(null);

/**
 * Filter, sort and page changes on the catalogue all go through here.
 *
 * Each change needs a server round trip, and on a slow connection that took seconds with
 * nothing on screen changing — not even the checkbox that was tapped. Now the control
 * updates on the tap (an optimistic copy of the query) and the results dim until the new
 * ones arrive.
 */
export function CatalogNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const current = useSearchParams().toString();
  const [pending, start] = useTransition();
  const [query, setQuery] = useOptimistic(current);

  const go = (next: URLSearchParams) => {
    const q = next.toString();
    start(() => {
      setQuery(q);
      router.push(q ? `?${q}` : "?", { scroll: false });
    });
  };

  return (
    <Ctx.Provider value={{ params: new URLSearchParams(query), pending, go }}>{children}</Ctx.Provider>
  );
}

export function useCatalogNavigation(): CatalogNav {
  const nav = useContext(Ctx);
  if (!nav) throw new Error("useCatalogNavigation must be used inside <CatalogNavigation>");
  return nav;
}

/** Dims the results while a filter change is on its way, so a tap visibly did something. */
export function PendingResults({ children }: { children: ReactNode }) {
  const { pending } = useCatalogNavigation();
  return (
    <div aria-busy={pending} className={`transition-opacity duration-150 ${pending ? "pointer-events-none opacity-40" : ""}`}>
      {children}
    </div>
  );
}
