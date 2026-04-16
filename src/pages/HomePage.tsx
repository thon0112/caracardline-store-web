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

  const grouped = useMemo(() => {
    const m = groupItems(items);
    return [...m.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, row]) => [
        label,
        row.slice(0, HOME_CATEGORY_SAMPLE_COUNT),
      ] as const);
  }, [items]);

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
  if (err) return <p className="error">{err}</p>;

  return (
    <div className="home">
      <HomeBannerCarousel />

      {items.length === 0 ? (
        <p className="muted">{zhHant.noProducts}</p>
      ) : (
        grouped.map(([label, row], gi) => (
          <section
            key={`${gi}-${label}`}
            className="home-group"
            aria-labelledby={`home-grp-${gi}`}
          >
            <div className="home-group-head">
              <h2 className="home-group-title" id={`home-grp-${gi}`}>
                {label}
              </h2>
              <Link href="/catalog" className="home-group-all">
                {zhHant.homeViewAll}
              </Link>
            </div>
            <div
              className="home-rail"
              tabIndex={0}
              aria-label={homeRailAriaLabel(label)}
            >
              <ul className="home-rail-track">
                {row.map((item) => (
                  <li
                    key={item.productId}
                    className={`home-rail-card${item.soldOut ? " home-rail-card--sold-out" : ""}`}
                  >
                    <Link href={`/item/${item.productId}`} className="home-rail-link">
                      <div className="home-rail-media">
                        {item.soldOut && (
                          <span className="home-rail-sold-out-badge" aria-hidden>
                            {zhHant.soldOutBadge}
                          </span>
                        )}
                        {primaryImage(item) ? (
                          <img
                            src={primaryImage(item) || ""}
                            alt=""
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div className="home-rail-body">
                        <h3 className="home-rail-title">{displayTitle(item)}</h3>
                        <p className="home-rail-price">{formatPriceUsd(item.listPrice)}</p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className="btn home-rail-btn"
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
