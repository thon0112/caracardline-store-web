import { useState } from "react";
import { Link } from "wouter";
import {
  deleteCartLine,
  patchCartLineQuantity,
  type CartCatalogItem,
  type CartLine,
} from "../api.js";
import { useCart } from "../cart-context.js";
import {
  formatPriceUsd,
  zhHant,
} from "../locale/zh-Hant.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { useToast } from "../toast-context.js";

function primaryImage(item: CartCatalogItem): string | null {
  const fromProduct = item.imageUrls?.[0];
  if (fromProduct) return fromProduct;
  const c = item.card;
  if (!c) return null;
  return c.largeImage || c.image;
}

function displayTitle(item: CartCatalogItem): string {
  return item.title || item.card?.name || zhHant.productFallback;
}

function maxLineQty(catalog: CartCatalogItem, lineQuantity: number): number {
  if (catalog.soldOut) return Math.max(1, lineQuantity);
  const stockCap = catalog.hideQuantity
    ? 99
    : Math.min(99, catalog.availableQuantity ?? 99);
  return Math.max(1, stockCap);
}

export function CartPage() {
  const { showToast } = useToast();
  const { cartId, lines, subtotal, loading, error, refreshCart } = useCart();
  const [busyLineId, setBusyLineId] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);

  async function setQuantity(line: CartLine, next: number) {
    if (!cartId) return;
    const max = maxLineQty(line.catalog, line.quantity);
    const q = Math.min(max, Math.max(1, next));
    if (q === line.quantity) return;
    setActionErr(null);
    setBusyLineId(line.lineId);
    try {
      await patchCartLineQuantity(cartId, line.lineId, q);
      await refreshCart();
    } catch (e) {
      if (!tryToastBadRequest(e, showToast)) {
        setActionErr(e instanceof Error ? e.message : zhHant.errUpdateFailed);
      }
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
      if (!tryToastBadRequest(e, showToast)) {
        setActionErr(e instanceof Error ? e.message : zhHant.errRemoveFailed);
      }
    } finally {
      setBusyLineId(null);
    }
  }

  if (error) {
    return (
      <div className="cart-page">
        <h1 className="title">{zhHant.cartTitle}</h1>
        <p className="error">{error}</p>
        <button type="button" className="btn secondary" onClick={() => void refreshCart()}>
          {zhHant.cartRetry}
        </button>
        <p className="muted small cart-page-footnote">
          <Link href="/" className="cart-page-text-link">
            ← {zhHant.continueShopping}
          </Link>
        </p>
      </div>
    );
  }

  if (loading) {
    return <PageLoadingSkeleton variant="cart" />;
  }

  if (!cartId || lines.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="title">{zhHant.cartTitle}</h1>
        <p className="lede muted">{zhHant.cartEmpty}</p>
        <Link href="/catalog" className="btn secondary" style={{ display: "inline-block" }}>
          {zhHant.browseCatalog}
        </Link>
      </div>
    );
  }

  const hasSoldOut = lines.some((l) => l.catalog.soldOut);

  return (
    <div className="cart-page">
      <h1 className="title">{zhHant.cartTitle}</h1>
      <p className="lede muted">
        {lines.length === 1
          ? zhHant.cartItemOne
          : zhHant.cartItemsMany(lines.length)}
      </p>
      {hasSoldOut && (
        <p className="cart-sold-out-banner" role="status">
          {zhHant.cartSoldOutNotice}
        </p>
      )}
      {actionErr && <p className="error">{actionErr}</p>}
      <ul className="cart-lines">
        {lines.map((line) => {
          const img = primaryImage(line.catalog);
          const max = maxLineQty(line.catalog, line.quantity);
          const busy = busyLineId === line.lineId;
          const lineTotal = line.quantity * line.catalog.listPrice;
          const soldOut = line.catalog.soldOut;
          return (
            <li
              key={line.lineId}
              className={`cart-line${soldOut ? " cart-line--sold-out" : ""}`}
            >
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
                  {formatPriceUsd(line.catalog.listPrice)} {zhHant.cartEach}
                </p>
                {soldOut && (
                  <p className="cart-line-sold-out-note">{zhHant.cartSoldOutLineNote}</p>
                )}
                <div className="cart-line-qty">
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={busy || soldOut || line.quantity <= 1}
                    aria-label={zhHant.cartDecreaseAria}
                    onClick={() => void setQuantity(line, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="qty-value">{line.quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={busy || soldOut || line.quantity >= max}
                    aria-label={zhHant.cartIncreaseAria}
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
                    {zhHant.cartRemove}
                  </button>
                </div>
              </div>
              <div className="cart-line-price">{formatPriceUsd(lineTotal)}</div>
            </li>
          );
        })}
      </ul>
      <div className="cart-summary">
        <span className="cart-subtotal-label">{zhHant.cartSubtotal}</span>
        <span className="cart-subtotal-value">{formatPriceUsd(subtotal)}</span>
      </div>
      <div className="cart-actions">
        <Link href="/" className="btn secondary cart-actions-shop">
          ← {zhHant.continueShopping}
        </Link>
        {hasSoldOut ? (
          <span
            className="btn cart-actions-checkout cart-actions-checkout--blocked"
            role="button"
            aria-disabled="true"
            aria-label={zhHant.cartSoldOutNotice}
            title={zhHant.cartSoldOutNotice}
          >
            {zhHant.cartGoCheckout}
          </span>
        ) : (
          <Link href="/checkout" className="btn cart-actions-checkout">
            {zhHant.cartGoCheckout}
          </Link>
        )}
      </div>
    </div>
  );
}
