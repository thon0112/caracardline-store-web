import { useState } from "react";
import { Link } from "wouter";
import {
  deleteCartLine,
  patchCartLineQuantity,
  type CartCatalogItem,
  type CartLine,
} from "../api.js";
import { useCart } from "../cart-context.js";

function primaryImage(item: CartCatalogItem): string | null {
  const fromProduct = item.imageUrls?.[0];
  if (fromProduct) return fromProduct;
  const c = item.card;
  if (!c) return null;
  return c.largeImage || c.image;
}

function displayTitle(item: CartCatalogItem): string {
  return item.title || item.card?.name || "Product";
}

function maxLineQty(catalog: CartCatalogItem): number {
  const stockCap = catalog.hideQuantity
    ? 99
    : Math.min(99, catalog.availableQuantity ?? 99);
  return Math.max(1, stockCap);
}

export function CartPage() {
  const { cartId, lines, subtotal, loading, error, refreshCart } = useCart();
  const [busyLineId, setBusyLineId] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);

  async function setQuantity(line: CartLine, next: number) {
    if (!cartId) return;
    const max = maxLineQty(line.catalog);
    const q = Math.min(max, Math.max(1, next));
    if (q === line.quantity) return;
    setActionErr(null);
    setBusyLineId(line.lineId);
    try {
      await patchCartLineQuantity(cartId, line.lineId, q);
      await refreshCart();
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "update failed");
    } finally {
      setBusyLineId(null);
    }
  }

  async function removeLine(lineId: string) {
    if (!cartId) return;
    setActionErr(null);
    setBusyLineId(lineId);
    try {
      await deleteCartLine(cartId, lineId);
      await refreshCart();
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "remove failed");
    } finally {
      setBusyLineId(null);
    }
  }

  if (error) {
    return (
      <div>
        <h1 className="title">Cart</h1>
        <p className="error">{error}</p>
        <button type="button" className="btn secondary" onClick={() => void refreshCart()}>
          Retry
        </button>
        <p className="muted small" style={{ marginTop: "1rem" }}>
          <Link href="/">← Continue shopping</Link>
        </p>
      </div>
    );
  }

  if (loading) {
    return <p className="muted">Loading cart…</p>;
  }

  if (!cartId || lines.length === 0) {
    return (
      <div>
        <h1 className="title">Cart</h1>
        <p className="lede muted">Your cart is empty.</p>
        <Link href="/" className="btn secondary" style={{ display: "inline-block" }}>
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title">Cart</h1>
      <p className="lede muted">
        {lines.length} {lines.length === 1 ? "item" : "items"}
      </p>
      {actionErr && <p className="error">{actionErr}</p>}
      <ul className="cart-lines">
        {lines.map((line) => {
          const img = primaryImage(line.catalog);
          const max = maxLineQty(line.catalog);
          const busy = busyLineId === line.lineId;
          const lineTotal = line.quantity * line.catalog.listPrice;
          return (
            <li key={line.lineId} className="cart-line">
              <Link
                href={`/item/${line.catalog.productId}`}
                className="cart-line-thumb"
              >
                {img ? (
                  <img src={img} alt="" />
                ) : (
                  <span className="cart-line-thumb-ph" />
                )}
              </Link>
              <div className="cart-line-body">
                <Link
                  href={`/item/${line.catalog.productId}`}
                  className="cart-line-title"
                >
                  {displayTitle(line.catalog)}
                </Link>
                <p className="muted small cart-line-meta">
                  ${line.catalog.listPrice.toFixed(2)} each
                  {!line.catalog.hideQuantity &&
                    line.catalog.availableQuantity != null && (
                      <>
                        {" · "}
                        {line.catalog.availableQuantity} available
                      </>
                    )}
                </p>
                <div className="cart-line-qty">
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={busy || line.quantity <= 1}
                    aria-label="Decrease quantity"
                    onClick={() => void setQuantity(line, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="qty-value">{line.quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={busy || line.quantity >= max}
                    aria-label="Increase quantity"
                    onClick={() => void setQuantity(line, line.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="cart-remove"
                    disabled={busy}
                    onClick={() => void removeLine(line.lineId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="cart-line-price">${lineTotal.toFixed(2)}</div>
            </li>
          );
        })}
      </ul>
      <div className="cart-summary">
        <span className="cart-subtotal-label">Subtotal</span>
        <span className="cart-subtotal-value">${subtotal.toFixed(2)}</span>
      </div>
      <p className="muted small" style={{ marginTop: "1.25rem" }}>
        Checkout is not wired yet—this total is for reference only.
      </p>
      <Link href="/" className="back muted" style={{ marginTop: "0.75rem" }}>
        ← Continue shopping
      </Link>
    </div>
  );
}
