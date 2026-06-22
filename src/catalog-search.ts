export const CATALOG_SEARCH_Q_MAX = 200;

export function normalizeCatalogSearchQ(
  raw: string | null | undefined,
): string {
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, CATALOG_SEARCH_Q_MAX);
}

export function isCatalogPath(pathname: string): boolean {
  return pathname === "/catalog" || pathname.startsWith("/catalog/");
}

/** `/catalog` or `/catalog/:type` — preserves typed category routes. */
export function catalogPathFromPathname(pathname: string): string {
  const typeMatch = /^\/catalog\/([^/?#]+)/.exec(pathname);
  return typeMatch ? `/catalog/${typeMatch[1]}` : "/catalog";
}

/**
 * Query params after a search submit. Clears `sort` (search API ignores it).
 * Preserves `availability` when updating an existing catalog URL.
 */
export function catalogSearchParamsFromSubmit(
  q: string,
  existing?: URLSearchParams,
): URLSearchParams {
  const p = existing
    ? new URLSearchParams(existing.toString())
    : new URLSearchParams();
  const term = normalizeCatalogSearchQ(q);
  p.delete("sort");
  if (term) p.set("q", term);
  else p.delete("q");
  return p;
}

/** Full path + query for header / cross-page search navigation. */
export function buildCatalogSearchLocation(
  q: string,
  pathname: string,
  existing?: URLSearchParams,
): string {
  const base = catalogPathFromPathname(pathname);
  const params = catalogSearchParamsFromSubmit(
    q,
    isCatalogPath(pathname) ? existing : undefined,
  );
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function currentCatalogSearchLocation(): string {
  const { pathname, search } = window.location;
  return `${pathname}${search}`;
}
