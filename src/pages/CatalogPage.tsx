import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  fetchCatalog,
  createCart,
  addCartItem,
  type CatalogListItem,
} from "../api.js";

export function CatalogPage() {
  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem("sf_cart_id"),
  );
  const [adding, setAdding] = useState<number | null>(null);

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
      setAdding(item.inventoryItemId);
      const id = await ensureCart();
      await addCartItem(id, { inventoryItemId: item.inventoryItemId, quantity: 1 });
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
      <h1 className="title">Available inventory</h1>
      <p className="lede muted">
        Prices and stock match your shared Neon inventory (status{" "}
        <code>available</code>).
      </p>
      <ul className="grid">
        {items.map((item) => (
          <li key={item.inventoryItemId} className="card">
            <Link href={`/item/${item.inventoryItemId}`} className="card-link">
              <div className="card-media">
                {(item.card.largeImage || item.card.image) && (
                  <img
                    src={item.card.largeImage || item.card.image || ""}
                    alt=""
                    loading="lazy"
                  />
                )}
              </div>
              <div className="card-body">
                <h2 className="card-title">{item.card.name}</h2>
                <p className="muted small">
                  {[item.card.collection, item.card.rare].filter(Boolean).join(" · ")}
                </p>
                <p className="price">${item.listPrice.toFixed(2)}</p>
                <p className="muted small">Qty {item.quantity}</p>
              </div>
            </Link>
            <button
              type="button"
              className="btn"
              disabled={adding === item.inventoryItemId}
              onClick={() => addToCart(item)}
            >
              {adding === item.inventoryItemId ? "Adding…" : "Add to cart"}
            </button>
          </li>
        ))}
      </ul>
      {nextCursor && (
        <button type="button" className="btn secondary" onClick={loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
