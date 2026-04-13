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
  formatInStock,
  formatPriceUsd,
  homeRailAriaLabel,
  zhHant,
} from "../locale/zh-Hant.js";
import { homeBannerSlides } from "../home-banner-slides.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { TOAST_DURATION_SHORT_MS, useToast } from "../toast-context.js";

const BANNER_INTERVAL_MS = 6500;
const CATALOG_HOME_LIMIT = 96;
/** Max products shown per category on the home page rails */
const HOME_CATEGORY_SAMPLE_COUNT = 5;

function groupLabel(type: string): string {
  const t = type.trim();
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

  const [slide, setSlide] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const bannerCount = homeBannerSlides.length;

  useEffect(() => {
    if (reducedMotion || bannerCount <= 1) return;
    const t = window.setInterval(() => {
      setSlide((i) => (i + 1) % bannerCount);
    }, BANNER_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [bannerCount, reducedMotion]);

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

  function goBanner(delta: number) {
    setSlide((i) => (i + delta + bannerCount) % bannerCount);
  }

  if (loading) return <p className="muted">{zhHant.loadingPage}</p>;
  if (err) return <p className="error">{err}</p>;

  return (
    <div className="home">
      <section
        className="home-hero-bleed"
        aria-roledescription="carousel"
        aria-label={zhHant.homeBannerAria}
      >
        <div className="home-hero">
          <div
            className="home-hero-slides"
            style={{
              transform: `translateX(-${slide * 100}%)`,
            }}
          >
            {homeBannerSlides.map((b, i) => (
              <div
                key={b.id}
                className="home-hero-slide"
                aria-hidden={i !== slide}
              >
                <Link href={b.href} className="home-hero-slide-link">
                  <img
                    className="home-hero-slide-img"
                    src={b.src}
                    alt={b.alt}
                    width={1200}
                    height={600}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={i === 0 ? "high" : "low"}
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Link>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="home-hero-nav home-hero-nav--prev"
            aria-label={zhHant.homeBannerPrev}
            onClick={() => goBanner(-1)}
          />
          <button
            type="button"
            className="home-hero-nav home-hero-nav--next"
            aria-label={zhHant.homeBannerNext}
            onClick={() => goBanner(1)}
          />
          <div className="home-hero-dots" role="tablist" aria-label={zhHant.homeBannerDots}>
            {homeBannerSlides.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === slide}
                className={`home-hero-dot${i === slide ? " is-active" : ""}`}
                aria-label={`${zhHant.homeBannerSlide} ${i + 1}：${b.alt}`}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </div>
      </section>

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
                  <li key={item.productId} className="home-rail-card">
                    <Link href={`/item/${item.productId}`} className="home-rail-link">
                      <div className="home-rail-media">
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
                        <p className="muted small home-rail-stock">
                          {item.hideQuantity
                            ? zhHant.catalogStockHidden
                            : formatInStock(item.availableQuantity ?? 0)}
                        </p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className="btn home-rail-btn"
                      disabled={adding === item.productId}
                      onClick={() => addToCart(item)}
                    >
                      {adding === item.productId ? zhHant.adding : zhHant.addToCart}
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
