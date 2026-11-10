/** Placeholder grid shown while a filter change is fetched, so the page never goes blank. */
export function ListingGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Találatok betöltése"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-xl bg-sheet" />
          <div className="mt-3.5 h-4 w-4/5 rounded bg-sheet" />
          <div className="mt-2 h-3 w-3/5 rounded bg-sheet" />
          <div className="mt-2 h-4 w-2/5 rounded bg-sheet" />
        </div>
      ))}
    </div>
  );
}

/**
 * Shown the instant a catalogue link is tapped (via loading.tsx), instead of the old page
 * sitting there until the server answers. Mirrors CatalogPage's header so nothing jumps.
 */
export function CatalogLoading({ title }: { title: string }) {
  return (
    <>
      <header className="bg-carbon text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <p className="flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white/55">
            <span className="h-px w-7 bg-brand" aria-hidden />
            Készlet
          </p>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">{title}</h1>
          <div className="mt-4 h-4 w-3/4 max-w-xl animate-pulse rounded bg-white/10" />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[250px_1fr] lg:gap-12 lg:py-14">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-sheet" />
          ))}
        </div>
        <div className="mt-6 lg:mt-0">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-rule-soft pb-4">
            <div className="h-4 w-24 animate-pulse rounded bg-sheet" />
            <div className="h-8 w-40 animate-pulse rounded bg-sheet" />
          </div>
          <ListingGridSkeleton />
        </div>
      </div>
    </>
  );
}

/** Shown the instant a listing is tapped, until its page arrives. */
export function ListingDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12" aria-busy="true" aria-label="Betöltés">
      <div className="mb-6 h-4 w-56 animate-pulse rounded bg-sheet" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="aspect-[3/4] animate-pulse rounded-xl bg-sheet" />
        <div>
          <div className="h-10 w-3/4 animate-pulse rounded bg-sheet" />
          <div className="mt-4 h-9 w-1/3 animate-pulse rounded bg-sheet" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-5 animate-pulse rounded bg-sheet" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
