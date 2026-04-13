import { useEffect, useState } from "react";
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
  zhHant,
} from "../locale/zh-Hant.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { TOAST_DURATION_SHORT_MS, useToast } from "../toast-context.js";

export function CatalogPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
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
        const data = await fetchCatalog({ limit: 24 });
        if (!cancelled) {
          setItems(data.items);
          setNextCursor(data.nextCursor);
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

  async function loadMore() {
    if (!nextCursor) return;
    try {
      const data = await fetchCatalog({ limit: 24, cursor: nextCursor });
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (e) {
      if (!tryToastBadRequest(e, showToast)) {
        setErr(e instanceof Error ? e.message : zhHant.errLoadMore);
      }
    }
  }

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

  if (loading) return <p className="muted">{zhHant.loadingCatalog}</p>;
  if (err) return <p className="error">{err}</p>;

  return (
    <div>
      <h1 className="title">{zhHant.catalogTitle}</h1>
      <ul className="grid">
        {items.map((item) => (
          <li key={item.productId} className="card">
            <Link href={`/item/${item.productId}`} className="card-link">
              <div className="card-media">
                {primaryImage(item) && (
                  <img
                    src={primaryImage(item) || ""}
                    alt=""
                    loading="lazy"
                  />
                )}
              </div>
              <div className="card-body">
                <h2 className="card-title">{displayTitle(item)}</h2>
                <p className="muted small">
                  {[
                    item.card?.collection,
                    item.card?.rare,
                    item.productType,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="price">{formatPriceUsd(item.listPrice)}</p>
                <p className="muted small">
                  {item.hideQuantity
                    ? zhHant.catalogStockHidden
                    : formatInStock(item.availableQuantity ?? 0)}
                </p>
              </div>
            </Link>
            <button
              type="button"
              className="btn"
              disabled={adding === item.productId}
              onClick={() => addToCart(item)}
            >
              {adding === item.productId ? zhHant.adding : zhHant.addToCart}
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 && !loading && (
        <p className="muted">{zhHant.noProducts}</p>
      )}
      {nextCursor && (
        <button type="button" className="btn secondary" onClick={loadMore}>
          {zhHant.loadMore}
        </button>
      )}
    </div>
  );
}
