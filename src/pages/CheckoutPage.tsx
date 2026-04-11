import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { isApiError, placeOrder, type PlaceOrderBody } from "../api.js";
import { useCart } from "../cart-context.js";
import {
  formatPriceUsd,
  toastTextForBadRequest,
  zhHant,
} from "../locale/zh-Hant.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { useToast } from "../toast-context.js";

export function CheckoutPage() {
  const { showToast } = useToast();
  const [, setLocation] = useLocation();
  const { cartId, lines, subtotal, loading, error, refreshCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [shipRecipientName, setShipRecipientName] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipAddressLine1, setShipAddressLine1] = useState("");
  const [shipAddressLine2, setShipAddressLine2] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipRegion, setShipRegion] = useState("");
  const [shipPostalCode, setShipPostalCode] = useState("");
  const [shipCountry, setShipCountry] = useState("");

  useEffect(() => {
    if (loading || error) return;
    if (!cartId || lines.length === 0) {
      setLocation("/cart");
    }
  }, [loading, error, cartId, lines.length, setLocation]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cartId || lines.length === 0) return;
    setFormErr(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setFormErr(zhHant.checkoutEmailRequired);
      return;
    }
    setSubmitting(true);
    try {
      const body: PlaceOrderBody = {
        cartId,
        email: trimmed,
        shipRecipientName: shipRecipientName.trim() || undefined,
        shipPhone: shipPhone.trim() || undefined,
        shipAddressLine1: shipAddressLine1.trim() || undefined,
        shipAddressLine2: shipAddressLine2.trim() || undefined,
        shipCity: shipCity.trim() || undefined,
        shipRegion: shipRegion.trim() || undefined,
        shipPostalCode: shipPostalCode.trim() || undefined,
        shipCountry: shipCountry.trim() || undefined,
      };
      const res = await placeOrder(body);
      await refreshCart();
      setLocation(`/order/${res.orderId}`);
    } catch (err) {
      if (tryToastBadRequest(err, showToast)) {
        /* toast shown */
      } else if (
        isApiError(err) &&
        err.status === 404 &&
        err.message === "cart not found"
      ) {
        setFormErr(zhHant.apiErrorCartNotFound);
      } else if (isApiError(err) && err.status === 400) {
        setFormErr(toastTextForBadRequest(err.message));
      } else {
        setFormErr(
          err instanceof Error ? err.message : zhHant.checkoutPlaceFailed,
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <div>
        <h1 className="title">{zhHant.checkoutTitle}</h1>
        <p className="error">{error}</p>
        <Link href="/cart" className="back muted">
          ← {zhHant.navCart}
        </Link>
      </div>
    );
  }

  if (loading || !cartId || lines.length === 0) {
    return <p className="muted">{zhHant.checkoutLoading}</p>;
  }

  return (
    <div>
      <h1 className="title">{zhHant.checkoutTitle}</h1>
      <p className="lede muted">{zhHant.checkoutLede}</p>

      <div className="checkout-summary card" style={{ padding: "1rem 1.15rem", marginBottom: "1.5rem" }}>
        <p className="muted small" style={{ margin: "0 0 0.5rem" }}>
          {zhHant.checkoutOrderPreview}
        </p>
        <ul className="checkout-preview-lines">
          {lines.map((l) => (
            <li key={l.lineId}>
              <span>{l.catalog.title || l.catalog.card?.name || zhHant.productFallback}</span>
              <span className="muted">
                ×{l.quantity} · {formatPriceUsd(l.quantity * l.catalog.listPrice)}
              </span>
            </li>
          ))}
        </ul>
        <p className="checkout-preview-total">
          <span>{zhHant.cartSubtotal}</span>
          <strong>{formatPriceUsd(subtotal)}</strong>
        </p>
      </div>

      {formErr && <p className="error">{formErr}</p>}

      <form className="form-stack" onSubmit={(e) => void onSubmit(e)}>
        <div className="form-field">
          <label htmlFor="co-email">{zhHant.checkoutEmail}</label>
          <input
            id="co-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={320}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-name">{zhHant.checkoutShipName}</label>
          <input
            id="co-name"
            name="shipRecipientName"
            type="text"
            autoComplete="name"
            value={shipRecipientName}
            onChange={(e) => setShipRecipientName(e.target.value)}
            maxLength={255}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-phone">{zhHant.checkoutShipPhone}</label>
          <input
            id="co-phone"
            name="shipPhone"
            type="tel"
            autoComplete="tel"
            value={shipPhone}
            onChange={(e) => setShipPhone(e.target.value)}
            maxLength={32}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-line1">{zhHant.checkoutShipLine1}</label>
          <input
            id="co-line1"
            name="shipAddressLine1"
            type="text"
            autoComplete="address-line1"
            value={shipAddressLine1}
            onChange={(e) => setShipAddressLine1(e.target.value)}
            maxLength={255}
          />
        </div>
        <div className="form-field">
          <label htmlFor="co-line2">{zhHant.checkoutShipLine2}</label>
          <input
            id="co-line2"
            name="shipAddressLine2"
            type="text"
            autoComplete="address-line2"
            value={shipAddressLine2}
            onChange={(e) => setShipAddressLine2(e.target.value)}
            maxLength={255}
          />
        </div>
        <div className="form-field-row">
          <div className="form-field">
            <label htmlFor="co-city">{zhHant.checkoutShipCity}</label>
            <input
              id="co-city"
              name="shipCity"
              type="text"
              autoComplete="address-level2"
              value={shipCity}
              onChange={(e) => setShipCity(e.target.value)}
              maxLength={128}
            />
          </div>
          <div className="form-field">
            <label htmlFor="co-region">{zhHant.checkoutShipRegion}</label>
            <input
              id="co-region"
              name="shipRegion"
              type="text"
              autoComplete="address-level1"
              value={shipRegion}
              onChange={(e) => setShipRegion(e.target.value)}
              maxLength={128}
            />
          </div>
        </div>
        <div className="form-field-row">
          <div className="form-field">
            <label htmlFor="co-postal">{zhHant.checkoutShipPostal}</label>
            <input
              id="co-postal"
              name="shipPostalCode"
              type="text"
              autoComplete="postal-code"
              value={shipPostalCode}
              onChange={(e) => setShipPostalCode(e.target.value)}
              maxLength={32}
            />
          </div>
          <div className="form-field">
            <label htmlFor="co-country">{zhHant.checkoutShipCountry}</label>
            <input
              id="co-country"
              name="shipCountry"
              type="text"
              autoComplete="country"
              placeholder="HK"
              value={shipCountry}
              onChange={(e) => setShipCountry(e.target.value.toUpperCase())}
              maxLength={2}
            />
          </div>
        </div>

        <p className="muted small">{zhHant.checkoutFpsNote}</p>

        <button type="submit" className="btn checkout-submit" disabled={submitting}>
          {submitting ? zhHant.checkoutSubmitting : zhHant.checkoutSubmit}
        </button>
      </form>

      <Link href="/cart" className="back muted" style={{ marginTop: "1.25rem" }}>
        ← {zhHant.backToCart}
      </Link>
    </div>
  );
}
