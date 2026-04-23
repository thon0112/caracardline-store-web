import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useRoute, useSearchParams } from "wouter";
import {
  fetchCatalog,
  fetchCatalogSearch,
  createCart,
  addCartItem,
  type CatalogListItem,
} from "../api.js";
import {
  displayListingProductType,
  displayTitle,
  primaryImage,
  storefrontListingCategory,
} from "../catalog-helpers.js";
import { useCart } from "../cart-context.js";
import {
  displayProductType,
  formatPriceUsd,
  normalizeCatalogAvailability,
  normalizeCatalogSort,
  normalizeCatalogTypeFilter,
  type CatalogAvailabilityValue,
  type CatalogSortValue,
  zhHant,
} from "../locale/zh-Hant.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { TOAST_DURATION_SHORT_MS, useToast } from "../toast-context.js";

const CATALOG_PAGE_LIMIT = 12;

function CatalogLoadMorePlaceholder() {
  return (
    <ul
      className="m-0 grid list-none grid-cols-2 gap-5 select-none p-0 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
      aria-hidden
    >
      {Array.from({ length: CATALOG_PAGE_LIMIT }, (_, i) => (
        <li
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
        >
          <div className="aspect-[3/4] animate-pulse bg-[var(--media-bg)]" />
          <div className="px-3 pb-[0.35rem] pt-[0.65rem]">
            <div className="h-[0.8125rem] max-w-[90%] animate-pulse rounded-md bg-[var(--media-bg)]" />
            <div className="mt-2 h-[0.9rem] w-16 animate-pulse rounded-md bg-[var(--media-bg)]" />
          </div>
          <span className="mx-4 mb-4 mt-3 h-[2.35rem] animate-pulse rounded-lg bg-[var(--media-bg)]" />
        </li>
      ))}
    </ul>
  );
}

export function CatalogPage() {
  const { showToast } = useToast();
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [matchTyped, typedParams] = useRoute<{ type: string }>(
    "/catalog/:type",
  );
  const [matchBase] = useRoute("/catalog");
  const pathSegmentType = typedParams?.type;
  const pathTypeCode = useMemo(
    () => (matchTyped ? normalizeCatalogTypeFilter(pathSegmentType) : ""),
    [matchTyped, pathSegmentType],
  );
  const legacyQueryTypeCode = useMemo(
    () =>
      matchBase ? normalizeCatalogTypeFilter(searchParams.get("type")) : "",
    [matchBase, searchParams],
  );
  const invalidTypedCatalog =
    Boolean(matchTyped && pathSegmentType) && pathTypeCode === "";
  const activeCatalogTypeCode = pathTypeCode || legacyQueryTypeCode;

  useLayoutEffect(() => {
    if (!matchBase) return;
    const qType = normalizeCatalogTypeFilter(searchParams.get("type"));
    if (!qType) return;
    const p = new URLSearchParams(searchParams.toString());
    p.delete("type");
    const qs = p.toString();
    setLocation(`/catalog/${qType}${qs ? `?${qs}` : ""}`, { replace: true });
  }, [matchBase, searchParams, setLocation]);
  const sortFilter = useMemo(
    () => normalizeCatalogSort(searchParams.get("sort")),
    [searchParams],
  );
  const qFromUrl = useMemo(() => {
    const raw = searchParams.get("q");
    if (typeof raw !== "string") return "";
    return raw.trim().slice(0, 200);
  }, [searchParams]);
  const availabilityFilter = useMemo(
    () => normalizeCatalogAvailability(searchParams.get("availability")),
    [searchParams],
  );

  const [searchDraft, setSearchDraft] = useState(qFromUrl);

  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { refreshCart } = useCart();
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem("sf_cart_id"),
  );
  const [adding, setAdding] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreInFlightRef = useRef(false);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = useMemo(() => {
    if (!activeCatalogTypeCode) return items;
    return items.filter(
      (item) => storefrontListingCategory(item) === activeCatalogTypeCode,
    );
  }, [items, activeCatalogTypeCode]);

  function setSortQuery(value: CatalogSortValue) {
    const p = new URLSearchParams(searchParams.toString());
    if (value === "date_desc") p.delete("sort");
    else p.set("sort", value);
    setSearchParams(p, { replace: true });
  }

  function setAvailabilityQuery(value: CatalogAvailabilityValue) {
    const p = new URLSearchParams(searchParams.toString());
    if (value === "all") p.delete("availability");
    else p.set("availability", value);
    setSearchParams(p, { replace: true });
  }

  useEffect(() => {
    setSearchDraft(qFromUrl);
  }, [qFromUrl]);

  function applySearchFromDraft() {
    const p = new URLSearchParams(searchParams.toString());
    const t = searchDraft.trim().slice(0, 200);
    if (t === "") p.delete("q");
    else p.set("q", t);
    setSearchParams(p, { replace: true });
  }

  function clearSearch() {
    setSearchDraft("");
    const p = new URLSearchParams(searchParams.toString());
    p.delete("q");
    setSearchParams(p, { replace: true });
  }

  useEffect(() => {
    if (invalidTypedCatalog) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const avail =
          availabilityFilter === "in_stock" ? "in_stock" : undefined;
        const data =
          qFromUrl.length > 0
            ? await fetchCatalogSearch({
                q: qFromUrl,
                limit: CATALOG_PAGE_LIMIT,
                availability: avail,
              })
            : await fetchCatalog({
                limit: CATALOG_PAGE_LIMIT,
                productType: activeCatalogTypeCode || undefined,
                sort: sortFilter,
                availability: avail,
              });
        if (!cancelled) {
          setItems(data.items);
          setNextCursor(data.nextCursor);
        }
      } catch (e) {
        if (!cancelled) {
          if (!tryToastBadRequest(e, showToast)) {
            setErr(e instanceof Error ? e.message : zhHant.errLoadCatalog);
          }
          setItems([]);
          setNextCursor(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    showToast,
    invalidTypedCatalog,
    activeCatalogTypeCode,
    sortFilter,
    qFromUrl,
    availabilityFilter,
  ]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || invalidTypedCatalog || loadMoreInFlightRef.current) {
      return;
    }
    loadMoreInFlightRef.current = true;
    setLoadingMore(true);
    try {
      const avail = availabilityFilter === "in_stock" ? "in_stock" : undefined;
      const data =
        qFromUrl.length > 0
          ? await fetchCatalogSearch({
              q: qFromUrl,
              limit: CATALOG_PAGE_LIMIT,
              cursor: nextCursor,
              availability: avail,
            })
          : await fetchCatalog({
              limit: CATALOG_PAGE_LIMIT,
              cursor: nextCursor,
              productType: activeCatalogTypeCode || undefined,
              sort: sortFilter,
              availability: avail,
            });
      setItems((prev) => [...prev, ...data.items]);
      console.log(data.nextCursor);
      setNextCursor(data.nextCursor);
    } catch (e) {
      if (!tryToastBadRequest(e, showToast)) {
        setErr(e instanceof Error ? e.message : zhHant.errLoadMore);
      }
    } finally {
      loadMoreInFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [
    nextCursor,
    invalidTypedCatalog,
    qFromUrl,
    activeCatalogTypeCode,
    sortFilter,
    availabilityFilter,
    showToast,
  ]);

  useEffect(() => {
    if (!nextCursor || invalidTypedCatalog) return;
    const el = loadMoreSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        void loadMore();
      },
      { root: null, rootMargin: "280px 0px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [nextCursor, invalidTypedCatalog, loadMore, items.length]);

  async function ensureCart() {
    if (cartId) return cartId;
    const { cartId: id } = await createCart();
    localStorage.setItem("sf_cart_id", id);
    setCartId(id);
    return id;
  }

  async function addToCart(item: CatalogListItem) {
    try {
      setAdding(item.productId);
      const id = await ensureCart();
      await addCartItem(id, { productId: item.productId, quantity: 1 });
      await refreshCart();
      showToast(zhHant.addToCartSuccess, TOAST_DURATION_SHORT_MS);
    } catch (e) {
      if (!tryToastBadRequest(e, showToast)) {
        setErr(e instanceof Error ? e.message : zhHant.errAddToCart);
      }
    } finally {
      setAdding(null);
    }
  }

  if (invalidTypedCatalog) {
    return (
      <div className="box-border w-full min-w-0 max-w-[68rem]">
        <p className="text-[var(--muted)]">{zhHant.notFound}</p>
      </div>
    );
  }

  return (
    <div className="box-border w-full min-w-0 max-w-[68rem]">
      <h1 className="m-0 mb-4 text-[1.75rem] font-bold">
        {qFromUrl
          ? zhHant.catalogSearchResultsTitle
          : activeCatalogTypeCode
            ? `${zhHant.catalogTitle} · ${displayProductType(activeCatalogTypeCode)}`
            : zhHant.catalogTitle}
      </h1>

      <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-[1.15rem] py-4">
        <div className="flex max-w-[38rem] flex-row gap-x-3 gap-y-3 flex-wrap min-[800px]:flex-nowrap">
          <form
            className="min-w-full md:min-w-[350px]"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              applySearchFromDraft();
            }}
          >
            <label
              className="mb-[0.35rem] block text-sm font-semibold"
              htmlFor="catalog-search-q"
            >
              {zhHant.catalogSearchLabel}
            </label>
            <div className="flex gap-1">
              <input
                id="catalog-search-q"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                maxLength={200}
                placeholder={zhHant.catalogSearchPlaceholder}
                className="min-h-[2.5rem] min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-2"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <div className="flex shrink-0 gap-2">
                <button
                  type="submit"
                  className="min-h-[2.5rem] cursor-pointer rounded-lg border border-[var(--accent)] bg-[var(--accent-fill)] px-[0.85rem] py-2 font-semibold text-[var(--on-accent-fill)] hover:opacity-90"
                >
                  {zhHant.catalogSearchSubmit}
                </button>
              </div>
            </div>
          </form>
          <div className="md:min-w-[200px] max-w-[calc(60%-6px)]">
            <label
              className="mb-[0.35rem] block text-sm font-semibold"
              htmlFor="catalog-sort"
            >
              {zhHant.catalogSort}
            </label>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-2"
              id="catalog-sort"
              value={sortFilter}
              onChange={(e) => setSortQuery(e.target.value as CatalogSortValue)}
            >
              <option value="date_asc">{zhHant.catalogSortDateAsc}</option>
              <option value="date_desc">{zhHant.catalogSortDateDesc}</option>
              <option value="price_asc">{zhHant.catalogSortPriceAsc}</option>
              <option value="price_desc">{zhHant.catalogSortPriceDesc}</option>
            </select>
          </div>
          <div className="md:min-w-[200px] max-w-[calc(40%-6px)]">
            <label
              className="mb-[0.35rem] block text-sm font-semibold"
              htmlFor="catalog-filter-availability"
            >
              {zhHant.catalogFilterAvailability}
            </label>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-2"
              id="catalog-filter-availability"
              value={availabilityFilter}
              onChange={(e) =>
                setAvailabilityQuery(e.target.value as CatalogAvailabilityValue)
              }
            >
              <option value="all">{zhHant.catalogFilterAvailabilityAll}</option>
              <option value="in_stock">
                {zhHant.catalogFilterAvailabilityInStock}
              </option>
            </select>
          </div>
        </div>
      </div>

      {err && <p className="text-[var(--err)]">{err}</p>}
      {loading && !err && (
        <PageLoadingSkeleton
          variant="catalog"
          className="my-[0.35rem] mb-[1.1rem] mt-[0.35rem]"
        />
      )}

      {!loading && !err && (
        <>
          <ul className="m-0 grid list-none grid-cols-2 gap-5 select-none p-0 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] [&_a]:select-text">
            {visibleItems.map((item) => (
              <li
                key={item.productId}
                className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
              >
                <Link
                  href={`/item/${encodeURIComponent(item.slug)}`}
                  className="flex-1 text-inherit no-underline"
                >
                  <div className="relative aspect-[3/4] bg-[var(--media-bg)]">
                    {item.soldOut && (
                      <span
                        className="absolute right-2 top-2 z-[1] rounded-md bg-[color-mix(in_srgb,var(--err)_88%,transparent)] px-[0.45rem] py-0.5 text-xs font-bold leading-snug text-[var(--card)]"
                        aria-hidden
                      >
                        {zhHant.soldOutBadge}
                      </span>
                    )}
                    {primaryImage(item) && (
                      <img
                        className={
                          item.soldOut
                            ? "block h-full w-full object-cover opacity-72 grayscale-[25%]"
                            : "block h-full w-full object-cover"
                        }
                        src={primaryImage(item) || ""}
                        alt=""
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="flex-1 px-3 pb-[0.35rem] pt-[0.65rem]">
                        <h3 className="mb-1 line-clamp-2 select-text text-[0.8125rem] font-semibold leading-snug [-webkit-user-select:text] min-h-[36px]">
                          {displayTitle(item)}
                        </h3>
                        <p className="m-0 select-text text-[0.9rem] font-bold text-[var(--accent)] [-webkit-user-select:text]">
                          {formatPriceUsd(item.listPrice)}
                        </p>
                      </div>
                </Link>
                <button
                  type="button"
                  className="mx-4 mb-4 mt-3 cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={adding === item.productId || item.soldOut}
                  title={item.soldOut ? zhHant.soldOutAddDisabled : undefined}
                  onClick={() => addToCart(item)}
                >
                  {adding === item.productId
                    ? zhHant.adding
                    : item.soldOut
                      ? zhHant.soldOutBadge
                      : zhHant.addToCart}
                </button>
              </li>
            ))}
          </ul>
          {visibleItems.length === 0 && (
            <p className="text-[var(--muted)]">
              {qFromUrl.length > 0
                ? items.length === 0
                  ? zhHant.catalogNoSearchResults(qFromUrl)
                  : activeCatalogTypeCode
                    ? zhHant.catalogEmptyCategoryFilter
                    : zhHant.catalogNoSearchResults(qFromUrl)
                : availabilityFilter === "in_stock" && items.length === 0
                  ? zhHant.catalogEmptyInStockFilter
                  : activeCatalogTypeCode && items.length > 0
                    ? zhHant.catalogEmptyCategoryFilter
                    : zhHant.noProducts}
            </p>
          )}
          {(nextCursor || loadingMore) && (
            <div className="mx-0 mb-0 mt-6 w-full min-w-0">
              {loadingMore && (
                <div
                  className="mb-0"
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <span className="sr-only">{zhHant.loadingPage}</span>
                  <CatalogLoadMorePlaceholder />
                </div>
              )}
              {nextCursor && (
                <div
                  ref={loadMoreSentinelRef}
                  className="h-2 w-full shrink-0"
                  aria-hidden
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
