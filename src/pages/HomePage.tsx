import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  fetchCatalog,
  createCart,
  addCartItem,
  type CatalogListItem,
} from "../api.js";
import {
  displayTitle,
  isCatalogItemReleased,
  primaryImage,
  storefrontListingCategory,
} from "../catalog-helpers.js";
import { useCart } from "../cart-context.js";
import { cn } from "../cn.js";
import {
  displayProductType,
  homeRailAriaLabel,
  zhHant,
} from "../locale/zh-Hant.js";
import { HomeBannerCarousel } from "../components/HomeBannerCarousel.js";
import { AskForPriceWhatsAppButton } from "../components/AskForPriceWhatsAppButton.js";
import { ProductPrice } from "../components/ProductPrice.js";
import {
  ReleaseCountdown,
  ReleaseSoonBadge,
} from "../components/ReleaseCountdown.js";
import { useCountdown } from "../use-countdown.js";
import { useDocumentMeta } from "../document-meta.js";
import { HomeJsonLd } from "../home-schema.js";
import { PAGE_META } from "../page-meta.js";
import { SITE_TITLE } from "../site-seo.js";
import { HomeCatalogSkeleton } from "../components/PageLoadingSkeleton.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { TOAST_DURATION_SHORT_MS, useToast } from "../toast-context.js";

function homeGroupKeyFromItem(item: CatalogListItem): string {
  const effective = storefrontListingCategory(item);
  if (effective) return effective;
  const raw = item.productType.trim();
  if (raw) return `raw:${raw.toLowerCase()}`;
  return "__other__";
}

function homeGroupLabelFromItem(item: CatalogListItem): string {
  const effective = storefrontListingCategory(item);
  if (effective) {
    const t = displayProductType(effective).trim();
    return t.length > 0 ? t : zhHant.homeGroupOther;
  }
  const t = displayProductType(item.productType).trim();
  return t.length > 0 ? t : zhHant.homeGroupOther;
}

/** Hardcoded — first N 單卡 listings on the homepage show a 新品 badge. */
const HOME_NEW_BADGE_CARD_LIMIT = 5;

function groupItems(items: CatalogListItem[]): Map<string, CatalogListItem[]> {
  const m = new Map<string, CatalogListItem[]>();
  for (const item of items) {
    const key = homeGroupKeyFromItem(item);
    const list = m.get(key);
    if (list) list.push(item);
    else m.set(key, [item]);
  }
  return m;
}

export function HomePage() {
  useDocumentMeta(PAGE_META.home);
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
        const data = await fetchCatalog({
          availability: "in_stock",
          highlight: true,
        });

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

  const newBadgeProductIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of availableItems) {
      if (storefrontListingCategory(item) !== "card") continue;
      ids.add(item.productId);
      if (ids.size >= HOME_NEW_BADGE_CARD_LIMIT) break;
    }
    return ids;
  }, [availableItems]);

  const grouped = useMemo(() => {
    const m = groupItems(availableItems);
    return [...m.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([groupKey, row]) => {
        const sample = row[0]!;
        const typeCode = storefrontListingCategory(sample);
        const label = homeGroupLabelFromItem(sample);
        const catalogHref = typeCode
          ? `/catalog/${encodeURIComponent(typeCode)}`
          : "/catalog";
        return {
          groupKey,
          label,
          catalogHref,
          row,
        };
      });
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
      if (item.askForPrice) return;
      if (!isCatalogItemReleased(item)) {
        showToast(zhHant.apiErrorItemNotYetReleased, TOAST_DURATION_SHORT_MS);
        return;
      }
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

  return (
    <div>
      <h1 className="sr-only">{SITE_TITLE}</h1>
      <HomeBannerCarousel />

      {loading ? (
        <HomeCatalogSkeleton />
      ) : err ? (
        <p className="text-[var(--err)]">{err}</p>
      ) : (
        <>
          <HomeJsonLd items={availableItems} />

          {availableItems.length === 0 ? (
            <p className="text-[var(--muted)]">{zhHant.noProducts}</p>
          ) : (
            grouped.map(({ groupKey, label, catalogHref, row }, gi) => (
              <section
                key={`${gi}-${groupKey}`}
                className="mb-8 select-none [-webkit-user-select:none]"
                aria-labelledby={`home-grp-${gi}`}
              >
                <div className="mb-4 flex cursor-default items-center justify-between gap-4 caret-transparent">
                  <h2
                    className="m-0 flex select-text items-center gap-3 text-[1.15rem] font-medium leading-none tracking-[0.28em] text-[var(--fg)] [-webkit-user-select:text] sm:text-[1.3rem]"
                    id={`home-grp-${gi}`}
                  >
                    <span
                      aria-hidden
                      className="inline-block h-px w-7 shrink-0 bg-[var(--accent)] sm:w-10"
                    />
                    {label}
                  </h2>
                  <Link
                    href={catalogHref}
                    className="inline-flex shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-md border border-[var(--accent)] bg-transparent px-3 py-1.5 text-[0.8125rem] font-medium tracking-[0.08em] text-[var(--accent)] no-underline caret-transparent transition-colors hover:bg-[var(--accent)] hover:text-[#222222]"
                  >
                    {zhHant.homeViewAll}
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                </div>
                <div
                  className="-mx-5 cursor-default select-none overflow-x-auto overflow-y-hidden px-5 pb-1 caret-transparent outline-none [-webkit-overflow-scrolling:touch] [-webkit-user-select:none] [scrollbar-width:thin] [scroll-snap-type:x_mandatory] focus-visible:rounded-md focus-visible:shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--accent)_42%,transparent)] md:-mx-6 md:px-6"
                  tabIndex={0}
                  aria-label={homeRailAriaLabel(label)}
                >
                  <ul className="m-0 flex w-max list-none select-none gap-[0.85rem] p-0 pb-[0.35rem] caret-transparent [-webkit-user-select:none] scroll-ml-0">
                    {row.slice(0, 6).map((item) => (
                      <HomeRailCard
                        key={item.productId}
                        item={item}
                        showNewBadge={newBadgeProductIds.has(item.productId)}
                        adding={adding === item.productId}
                        onAdd={() => addToCart(item)}
                      />
                    ))}
                  </ul>
                </div>
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}

function HomeRailCard({
  item,
  showNewBadge,
  adding,
  onAdd,
}: {
  item: CatalogListItem;
  showNewBadge: boolean;
  adding: boolean;
  onAdd: () => void;
}) {
  const releaseAt =
    item.productType === "card_pool" &&
    typeof item.releaseAt === "string" &&
    item.releaseAt.length > 0
      ? item.releaseAt
      : null;
  const releaseCountdown = useCountdown(releaseAt);
  const notYetReleased = releaseAt != null && !releaseCountdown.done;

  return (
    <li className="group flex max-w-[11rem] min-w-0 shrink-0 basis-[min(41vw,11rem)] select-none flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] caret-transparent transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[rgba(197,164,109,0.55)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 [-webkit-user-select:none]">
      <Link
        href={`/item/${encodeURIComponent(item.slug)}`}
        className="flex min-h-0 flex-1 cursor-pointer select-none flex-col text-inherit no-underline caret-transparent [-webkit-user-select:none]"
      >
        <div className="relative aspect-[3/5] shrink-0 overflow-hidden bg-[#F3EEE4]">
          {showNewBadge && !notYetReleased && (
            <span
              className="absolute left-[0.35rem] top-[0.35rem] z-[1] rounded-[5px] bg-[color-mix(in_srgb,var(--accent)_92%,transparent)] px-[0.35rem] py-[0.15rem] text-[1rem] font-bold leading-snug text-[var(--card)]"
              aria-hidden
            >
              {zhHant.newBadge}
            </span>
          )}
          {releaseAt && !item.soldOut ? (
            <ReleaseSoonBadge
              releaseAt={releaseAt}
              className="left-[0.35rem] top-[0.35rem] rounded-[5px] px-[0.35rem] py-[0.15rem] text-[0.6875rem]"
            />
          ) : null}
          {item.soldOut && (
            <span
              className="absolute right-[0.35rem] top-[0.35rem] z-[1] rounded-[5px] bg-[color-mix(in_srgb,var(--err)_88%,transparent)] px-[0.35rem] py-[0.15rem] text-[0.6875rem] font-bold leading-snug text-[#F5F1E9]"
              aria-hidden
            >
              {zhHant.soldOutBadge}
            </span>
          )}
          {primaryImage(item) ? (
            <img
              className={cn(
                "block h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                item.soldOut && "opacity-72 grayscale-[25%]",
              )}
              src={primaryImage(item) || ""}
              alt={displayTitle(item)}
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="flex-1 px-3 pb-[0.35rem] pt-[0.65rem]">
          <h3 className="mb-1 line-clamp-2 min-h-[36px] select-text font-sans text-[0.8125rem] font-semibold leading-snug tracking-normal [-webkit-user-select:text]">
            {displayTitle(item)}
          </h3>
          <ProductPrice
            listPrice={item.listPrice}
            compareAtPrice={item.compareAtPrice}
            askForPrice={item.askForPrice === true}
            size="sm"
          />
          {releaseAt ? <ReleaseCountdown releaseAt={releaseAt} /> : null}
        </div>
      </Link>
      {item.askForPrice ? (
        <AskForPriceWhatsAppButton
          title={displayTitle(item)}
          slug={item.slug}
          className="mx-[0.65rem] mb-[0.65rem] mt-0 px-[0.55rem] py-[0.4rem] text-[0.8125rem]"
        />
      ) : notYetReleased ? null : (
        <button
          type="button"
          className="mx-[0.65rem] mb-[0.65rem] mt-0 cursor-pointer rounded-md border border-[var(--accent)] bg-transparent px-[0.55rem] py-[0.45rem] text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={adding || item.soldOut}
          title={item.soldOut ? zhHant.soldOutAddDisabled : undefined}
          onClick={onAdd}
        >
          {adding
            ? zhHant.adding
            : item.soldOut
              ? zhHant.soldOutBadge
              : zhHant.addToCart}
        </button>
      )}
    </li>
  );
}
