import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { isApiError, placeOrder, type PlaceOrderBody } from "../api.js";
import { useCart } from "../cart-context.js";
import {
  formatPriceUsd,
  toastTextForBadRequest,
  zhHant,
} from "../locale/zh-Hant.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { useToast } from "../toast-context.js";

/** Checkout only ships to Hong Kong; locality fields fixed until multi-region shipping. */
const SHIP_COUNTRY_HK = "HK" as const;
const SHIP_LOCALITY_HK = "香港";

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
    const trimmedName = shipRecipientName.trim();
    if (!trimmedName) {
      setFormErr(zhHant.checkoutNameRequired);
      return;
    }
    const trimmedPhone = shipPhone.trim();
    if (!trimmedPhone) {
      setFormErr(zhHant.checkoutPhoneRequired);
      return;
    }
    const trimmedEmail = email.trim();
    const trimmedLine1 = shipAddressLine1.trim();
    if (!trimmedLine1) {
      setFormErr(zhHant.checkoutAddressRequired);
      return;
    }
    setSubmitting(true);
    try {
      const body: PlaceOrderBody = {
        cartId,
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
        shipRecipientName: trimmedName,
        shipPhone: trimmedPhone,
        shipAddressLine1: trimmedLine1,
        shipAddressLine2: shipAddressLine2.trim() || undefined,
        shipCity: SHIP_LOCALITY_HK,
        shipRegion: SHIP_LOCALITY_HK,
        shipCountry: SHIP_COUNTRY_HK,
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
      <div className="checkout-page">
        <h1 className="title">{zhHant.checkoutTitle}</h1>
        <p className="error">{error}</p>
        <Link href="/cart" className="back muted">
          ← {zhHant.navCart}
        </Link>
      </div>
    );
  }

  if (loading || !cartId || lines.length === 0) {
    return <PageLoadingSkeleton variant="checkout" />;
  }

  return (
    <div className="checkout-page">
      <h1 className="title">{zhHant.checkoutTitle}</h1>
      <p className="lede muted">{zhHant.checkoutLede}</p>

      <div className="checkout-layout">
        <div className="checkout-layout-main">
          {formErr && <p className="error">{formErr}</p>}

          <form
            id="checkout-form"
            className="form-stack"
            onSubmit={(e) => void onSubmit(e)}
          >
            <div className="form-field">
              <label htmlFor="co-name">{zhHant.checkoutShipName}</label>
              <input
                id="co-name"
                name="shipRecipientName"
                type="text"
                autoComplete="name"
                value={shipRecipientName}
                onChange={(e) => setShipRecipientName(e.target.value)}
                required
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
                required
                maxLength={32}
              />
            </div>
            <div className="form-field">
              <label htmlFor="co-email">{zhHant.checkoutEmail}</label>
              <input
                id="co-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => setEmail(e.target.value.trim())}
                aria-required={false}
                maxLength={320}
              />
            </div>
            <div className="form-field">
              <label htmlFor="co-country">{zhHant.checkoutShipCountry}</label>
              <input
                id="co-country"
                name="shipCountry"
                type="text"
                readOnly
                required
                aria-readonly="true"
                value={zhHant.checkoutShipCountryHongKongDisplay}
              />
            </div>
            <div className="form-field">
              <label htmlFor="co-line1">{zhHant.checkoutShipLine1}</label>
              <input
                id="co-line1"
                name="shipAddressLine1"
                type="text"
                autoComplete="street-address"
                value={shipAddressLine1}
                onChange={(e) => setShipAddressLine1(e.target.value)}
                required
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

            <p className="muted small">{zhHant.checkoutFpsNote}</p>
          </form>

          <Link href="/cart" className="back muted" style={{ marginTop: "1.25rem" }}>
            ← {zhHant.backToCart}
          </Link>
        </div>

        <aside className="checkout-layout-aside" aria-label={zhHant.checkoutOrderPreview}>
          <div className="checkout-summary card" style={{ padding: "1rem 1.15rem" }}>
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
            <button
              type="submit"
              form="checkout-form"
              className="btn checkout-submit checkout-submit-in-preview"
              disabled={submitting}
            >
              {submitting ? zhHant.checkoutSubmitting : zhHant.checkoutSubmit}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
