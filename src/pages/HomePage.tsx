import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  fetchCatalog,
  createCart,
  addCartItem,
  type CatalogListItem,
} from "../api.js";
import { displayTitle, primaryImage } from "../catalog-helpers.js";
import { useCart } from "../cart-context.js";
import { cn } from "../cn.js";
import {
  displayProductType,
  formatPriceUsd,
  homeRailAriaLabel,
  zhHant,
} from "../locale/zh-Hant.js";
import { HomeBannerCarousel } from "../components/HomeBannerCarousel.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { TOAST_DURATION_SHORT_MS, useToast } from "../toast-context.js";

const CATALOG_HOME_LIMIT = 96;
/** Max products shown per category on the home page rails */
const HOME_CATEGORY_SAMPLE_COUNT = 5;

function groupLabel(productType: string): string {
  const t = displayProductType(productType).trim();
  return t.length > 0 ? t : zhHant.homeGroupOther;
}

function groupItems(items: CatalogListItem[]): Map<string, CatalogListItem[]> {
  const m = new Map<string, CatalogListItem[]>();
  for (const item of items) {
    const key = groupLabel(item.productType);
    const list = m.get(key);
    if (list) list.push(item);
    else m.set(key, [item]);
  }
  return m;
}

export function HomePage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { refreshCart } = useCart();
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem("sf_cart_id"),
  );
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCatalog({ limit: CATALOG_HOME_LIMIT });
        if (!cancelled) {
          setItems(data.items);
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) {
          if (!tryToastBadRequest(e, showToast)) {
            setErr(e instanceof Error ? e.message : zhHant.errLoadCatalog);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const availableItems = useMemo(
    () => items.filter((item) => !item.soldOut),
    [items],
  );

  const grouped = useMemo(() => {
    const m = groupItems(availableItems);
    return [...m.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, row]) => [
        label,
        row.slice(0, HOME_CATEGORY_SAMPLE_COUNT),
      ] as const);
  }, [availableItems]);

  async function ensureCart() {
    if (cartId) return cartId;
    const { cartId: id } = await createCart();
    localStorage.setItem("sf_cart_id", id);
    setCartId(id);
    return id;
  }

  const addToCart = useCallback(
    async (item: CatalogListItem) => {
      try {
        setAdding(item.productId);
        const id = await ensureCart();
        await addCartItem(id, { productId: item.productId, quantity: 1 });
        await refreshCart();
        showToast(zhHant.addToCartSuccess, TOAST_DURATION_SHORT_MS);
      } catch (e) {
        if (!tryToastBadRequest(e, showToast)) {
          showToast(e instanceof Error ? e.message : zhHant.errAddToCart);
        }
      } finally {
        setAdding(null);
      }
    },
    [cartId, refreshCart, showToast],
  );

  if (loading) return <PageLoadingSkeleton variant="home" />;
  if (err) return <p className="text-[var(--err)]">{err}</p>;

  return (
    <div className="-mt-1">
      <HomeBannerCarousel />

      {availableItems.length === 0 ? (
        <p className="text-[var(--muted)]">{zhHant.noProducts}</p>
      ) : (
        grouped.map(([label, row], gi) => (
          <section
            key={`${gi}-${label}`}
            className="mb-8 select-none [-webkit-user-select:none]"
            aria-labelledby={`home-grp-${gi}`}
          >
            <div className="mb-3 flex cursor-default items-baseline justify-between gap-4 caret-transparent">
              <h2
                className="m-0 select-text text-[1.15rem] font-bold [-webkit-user-select:text]"
                id={`home-grp-${gi}`}
              >
                {label}
              </h2>
              <Link
                href="/catalog"
                className="shrink-0 cursor-pointer select-none text-sm font-semibold text-[var(--accent)] no-underline caret-transparent hover:underline"
              >
                {zhHant.homeViewAll}
              </Link>
            </div>
            <div
              className="-mx-6 cursor-default select-none overflow-x-auto overflow-y-hidden px-6 pb-1 caret-transparent outline-none [-webkit-overflow-scrolling:touch] [-webkit-user-select:none] [scrollbar-width:thin] [scroll-snap-type:x_mandatory] focus-visible:rounded-[10px] focus-visible:shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--accent)_42%,transparent)]"
              tabIndex={0}
              aria-label={homeRailAriaLabel(label)}
            >
              <ul className="m-0 flex w-max list-none select-none gap-[0.85rem] p-0 pb-[0.35rem] caret-transparent [-webkit-user-select:none]">
                {row.map((item) => (
                  <li
                    key={item.productId}
                    className="flex max-w-[11rem] min-w-0 shrink-0 basis-[min(42vw,11rem)] select-none flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] caret-transparent [scroll-snap-align:start] [-webkit-user-select:none]"
                  >
                    <Link
                      href={`/item/${item.productId}`}
                      className="flex min-h-0 flex-1 cursor-pointer select-none flex-col text-inherit no-underline caret-transparent [-webkit-user-select:none]"
                    >
                      <div className="relative aspect-square shrink-0 bg-[var(--media-bg)]">
                        {item.soldOut && (
                          <span
                            className="absolute right-[0.35rem] top-[0.35rem] z-[1] rounded-[5px] bg-[color-mix(in_srgb,var(--err)_88%,transparent)] px-[0.35rem] py-[0.15rem] text-[0.6875rem] font-bold leading-snug text-[var(--card)]"
                            aria-hidden
                          >
                            {zhHant.soldOutBadge}
                          </span>
                        )}
                        {primaryImage(item) ? (
                          <img
                            className={cn(
                              "block h-full w-full object-cover",
                              item.soldOut && "opacity-72 grayscale-[25%]",
                            )}
                            src={primaryImage(item) || ""}
                            alt=""
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 px-3 pb-[0.35rem] pt-[0.65rem]">
                        <h3 className="mb-1 line-clamp-2 select-text text-[0.8125rem] font-semibold leading-snug [-webkit-user-select:text]">
                          {displayTitle(item)}
                        </h3>
                        <p className="m-0 select-text text-[0.9rem] font-bold text-[var(--accent)] [-webkit-user-select:text]">
                          {formatPriceUsd(item.listPrice)}
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className="mx-[0.65rem] mb-[0.65rem] mt-0 cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.55rem] py-[0.4rem] text-[0.8125rem] font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>
          </section>
        ))
      )}
    </div>
  );
}
