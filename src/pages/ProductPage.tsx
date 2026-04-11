import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { fetchCatalogItem, createCart, addCartItem } from "../api.js";
import { useCart } from "../cart-context.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isProductIdParam(raw: string | undefined): raw is string {
  return typeof raw === "string" && raw.length > 0 && UUID_RE.test(raw);
}

function primaryImage(item: Awaited<ReturnType<typeof fetchCatalogItem>>) {
  const fromProduct = item.imageUrls?.[0];
  if (fromProduct) return fromProduct;
  const c = item.card;
  if (!c) return null;
  return c.largeImage || c.image;
}

export function ProductPage() {
  const params = useParams();
  const id = params.id;
  const [data, setData] = useState<
    Awaited<ReturnType<typeof fetchCatalogItem>> | null
  >(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { refreshCart } = useCart();
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem("sf_cart_id"),
  );

  useEffect(() => {
    if (!isProductIdParam(id)) {
      setErr("invalid item");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const row = await fetchCatalogItem(id);
        if (!cancelled) {
          setData(row);
          setErr(null);
        }
      } catch {
        if (!cancelled) setErr("not found or unavailable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function ensureCart() {
    if (cartId) return cartId;
    const { cartId: newId } = await createCart();
    localStorage.setItem("sf_cart_id", newId);
    setCartId(newId);
    return newId;
  }

  async function addToCart() {
    if (!data) return;
    try {
      setAdding(true);
      const cid = await ensureCart();
      await addCartItem(cid, { productId: data.productId, quantity: 1 });
      await refreshCart();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "add failed");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;
  if (err || !data) {
    return (
      <div>
        <p className="error">{err ?? "Not found"}</p>
        <Link href="/">← Back</Link>
      </div>
    );
  }

  const img = primaryImage(data);
  const subtitle = [
    data.card?.collection,
    data.card?.rare,
    data.condition && `NM ${data.condition}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="detail">
      <Link href="/" className="back muted">
        ← Catalog
      </Link>
      <div className="detail-grid">
        <div className="detail-media">
          {img ? <img src={img} alt="" /> : <div className="ph" />}
        </div>
        <div>
          <h1 className="title">{data.title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
          {data.description && (
            <p className="lede" style={{ marginTop: "0.75rem" }}>
              {data.description}
            </p>
          )}
          {data.psaId && (
            <p className="muted small">
              PSA ID: <code>{data.psaId}</code>
            </p>
          )}
          <p className="price big">${data.listPrice.toFixed(2)}</p>
          <p className="muted">In stock: {data.availableQuantity}</p>
          <button
            type="button"
            className="btn"
            disabled={adding}
            onClick={addToCart}
          >
            {adding ? "Adding…" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
