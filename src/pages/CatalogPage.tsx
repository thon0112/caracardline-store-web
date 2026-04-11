import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  fetchCatalog,
  createCart,
  addCartItem,
  type CatalogListItem,
} from "../api.js";

function primaryImage(item: CatalogListItem): string | null {
  const fromProduct = item.imageUrls?.[0];
  if (fromProduct) return fromProduct;
  const c = item.card;
  if (!c) return null;
  return c.largeImage || c.image;
}

function displayTitle(item: CatalogListItem): string {
  return item.title || item.card?.name || "Product";
}

export function CatalogPage() {
  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
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
        if (!cancelled) setErr(e instanceof Error ? e.message : "failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMore() {
    if (!nextCursor) return;
    try {
      const data = await fetchCatalog({ limit: 24, cursor: nextCursor });
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed to load more");
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
    } catch (e) {
      setErr(e instanceof Error ? e.message : "add to cart failed");
    } finally {
      setAdding(null);
    }
  }

  if (loading) return <p className="muted">Loading catalog…</p>;
  if (err) return <p className="error">{err}</p>;

  return (
    <div>
      <h1 className="title">Catalog</h1>
      <p className="lede muted">
        Published products with available stock (linked via{" "}
        <code>product_stock_links</code>).
      </p>
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
                <p className="price">${item.listPrice.toFixed(2)}</p>
                <p className="muted small">In stock: {item.availableQuantity}</p>
              </div>
            </Link>
            <button
              type="button"
              className="btn"
              disabled={adding === item.productId}
              onClick={() => addToCart(item)}
            >
              {adding === item.productId ? "Adding…" : "Add to cart"}
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 && !loading && (
        <p className="muted">No products yet. Publish a product and link stock.</p>
      )}
      {nextCursor && (
        <button type="button" className="btn secondary" onClick={loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
