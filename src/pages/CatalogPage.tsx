import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  fetchCatalog,
  createCart,
  addCartItem,
  type CatalogListItem,
} from "../api.js";
import { useCart } from "../cart-context.js";
import {
  formatInStock,
  formatPriceUsd,
  zhHant,
} from "../locale/zh-Hant.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { useToast } from "../toast-context.js";

function primaryImage(item: CatalogListItem): string | null {
  const fromProduct = item.imageUrls?.[0];
  if (fromProduct) return fromProduct;
  const c = item.card;
  if (!c) return null;
  return c.largeImage || c.image;
}

function displayTitle(item: CatalogListItem): string {
  return item.title || item.card?.name || zhHant.productFallback;
}

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
      <p className="lede muted">{zhHant.catalogLede}</p>
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
                  {formatInStock(item.availableQuantity)}
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
