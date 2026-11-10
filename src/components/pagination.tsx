"use client";

import Link from "next/link";
import { useCatalogNavigation } from "./catalog-navigation";

export function Pagination({
  page,
  pageCount,
  baseParams,
}: {
  page: number;
  pageCount: number;
  baseParams: string;
}) {
  const { go } = useCatalogNavigation();
  if (pageCount <= 1) return null;

  // Through the catalogue navigation like the filters, so the results dim on the tap.
  // The href stays for opening a page in a new tab.
  const open = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    go(new URLSearchParams(e.currentTarget.search));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const href = (p: number) => {
    const sp = new URLSearchParams(baseParams);
    if (p === 1) sp.delete("oldal");
    else sp.set("oldal", String(p));
    const q = sp.toString();
    return q ? `?${q}` : "?";
  };

  // Always show first, last, current and its neighbours; gaps become an ellipsis.
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1);

  const out: (number | "gap")[] = [];
  for (const [i, p] of pages.entries()) {
    if (i > 0 && p - (pages[i - 1] as number) > 1) out.push("gap");
    out.push(p);
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Lapozás">
      {page > 1 && (
        <Link href={href(page - 1)} onClick={open} rel="prev" aria-label="Előző oldal"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-sheet">
          ‹
        </Link>
      )}
      {out.map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1.5 text-ink-soft">…</span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            onClick={open}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-sm font-bold ${
              p === page ? "bg-brand text-white" : "text-ink hover:bg-sheet"
            }`}
          >
            {p}
          </Link>
        ),
      )}
      {page < pageCount && (
        <Link href={href(page + 1)} onClick={open} rel="next" aria-label="Következő oldal"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-sheet">
          ›
        </Link>
      )}
    </nav>
  );
}
