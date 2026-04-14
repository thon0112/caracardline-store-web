import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import {
  fetchOrder,
  isApiError,
  submitPaymentSubmitted,
  type OrderDetailResponse,
} from "../api.js";
import {
  formatPriceUsd,
  toastTextForBadRequest,
  zhHant,
} from "../locale/zh-Hant.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { useToast } from "../toast-context.js";

const fpsReceiverId = (import.meta.env.VITE_FPS_RECEIVER_ID ?? "").trim();
/** Env overrides; otherwise bundled poster under `public/fps-payment-qr.png`. */
const fpsQrSrc =
  (import.meta.env.VITE_FPS_QR_IMAGE_URL ?? "").trim() || "/fps-payment-qr.png";

function formatDeadline(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("zh-Hant", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderPage() {
  const { showToast } = useToast();
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId ?? "";

  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentBusy, setPaymentBusy] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) {
      setLoadErr(zhHant.orderInvalidId);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadErr(null);
    try {
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch (e) {
      if (isApiError(e) && e.status === 404) {
        setLoadErr(zhHant.orderNotFound);
      } else if (isApiError(e) && e.status === 400) {
        setLoadErr(toastTextForBadRequest(e.message));
      } else {
        setLoadErr(e instanceof Error ? e.message : zhHant.orderLoadFailed);
      }
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  }, [order]);

  async function onPaymentSubmitted() {
    if (!orderId) return;
    setPaymentBusy(true);
    try {
      await submitPaymentSubmitted(orderId);
      showToast(zhHant.orderPaymentSubmittedToast);
      await load();
    } catch (e) {
      if (tryToastBadRequest(e, showToast)) {
        /* handled */
      } else if (isApiError(e) && e.status === 404) {
        showToast(zhHant.orderNotFound);
      } else {
        showToast(
          e instanceof Error ? e.message : zhHant.orderPaymentSubmitFailed,
        );
      }
    } finally {
      setPaymentBusy(false);
    }
  }

  if (loading) {
    return <PageLoadingSkeleton variant="order" />;
  }

  if (loadErr || !order) {
    return (
      <div className="order-page">
        <h1 className="title">{zhHant.orderTitle}</h1>
        <p className="error">{loadErr ?? zhHant.orderNotFound}</p>
        <Link href="/" className="back muted">
          ← {zhHant.navHome}
        </Link>
      </div>
    );
  }

  const deadline = formatDeadline(order.reservationExpiresAt);
  const showFpsBlock =
    order.status === "awaiting_payment" || order.status === "awaiting_confirmation";
  const statusLabel =
    order.status === "awaiting_payment"
      ? zhHant.orderStatusAwaitingPayment
      : order.status === "awaiting_confirmation"
        ? zhHant.orderStatusAwaitingConfirmation
        : order.status === "expired"
          ? zhHant.orderStatusExpired
          : order.status === "paid"
            ? zhHant.orderStatusPaid
            : order.status;

  return (
    <div className="order-page">
      <h1 className="title">{zhHant.orderTitle}</h1>
      <p className="lede muted order-page-ref">
        {zhHant.orderRef}{" "}
        <code className="order-page-id" translate="no">
          {order.orderId}
        </code>
      </p>

      <h2 className="order-section-title order-items-heading">{zhHant.orderItems}</h2>
      <ul className="order-lines">
        {order.items.map((item, idx) => (
          <li key={`${item.productId}-${idx}`} className="order-line">
            <div>
              <span className="order-line-title">{item.title}</span>
              <span className="muted small">
                {" "}
                ×{item.quantity} · {formatPriceUsd(item.unitPrice)} {zhHant.cartEach}
              </span>
            </div>
            <div className="order-line-total">
              {formatPriceUsd(item.quantity * item.unitPrice)}
            </div>
          </li>
        ))}
      </ul>
      <div className="order-total-row">
        <span className="order-total-label">{zhHant.orderAmountDue}</span>
        <strong className="order-total-value">{formatPriceUsd(total)}</strong>
      </div>

      <div className="order-meta card order-meta-card">
        <p className="order-meta-status">
          <strong>{zhHant.orderStatus}</strong> {statusLabel}
        </p>
        {deadline && showFpsBlock && (
          <p className="muted small order-meta-deadline">
            {zhHant.orderHoldUntil} {deadline}
          </p>
        )}
        {order.status === "expired" && (
          <p className="muted small order-meta-hint">
            {zhHant.orderExpiredHint}
          </p>
        )}
        {showFpsBlock && (
          <section className="fps-in-meta" aria-labelledby="fps-section-title">
            <div className="fps-section-body fps-section-body--qr-layout">
              <div className="fps-text-col">
                <h2
                  id="fps-section-title"
                  className="order-section-title fps-section-heading-in-meta"
                >
                  {zhHant.fpsTitle}
                </h2>
                <div className="fps-section-main">
                  <p className="muted small">{zhHant.fpsInstructions}</p>
                  <p className="fps-amount">
                    {zhHant.fpsPayExact} <strong>{formatPriceUsd(total)}</strong>
                  </p>
                  <p className="muted small fps-memo-intro">{zhHant.fpsMemoHint}</p>
                  <p className="fps-memo-id-row">
                    <code className="fps-memo" translate="no">
                      {order.orderId}
                    </code>
                  </p>
                  {fpsReceiverId ? (
                    <p className="fps-receiver">
                      <span className="muted small">{zhHant.fpsReceiverLabel}</span>{" "}
                      <code translate="no">{fpsReceiverId}</code>
                    </p>
                  ) : (
                    <p className="muted small">{zhHant.fpsReceiverUnset}</p>
                  )}

                  {order.status === "awaiting_payment" && (
                    <button
                      type="button"
                      className="btn checkout-submit fps-section-submit"
                      disabled={paymentBusy}
                      onClick={() => void onPaymentSubmitted()}
                    >
                      {paymentBusy
                        ? zhHant.orderPaymentSubmitting
                        : zhHant.orderMarkTransferred}
                    </button>
                  )}
                  {order.status === "awaiting_confirmation" && (
                    <p className="muted small fps-section-awaiting">
                      {zhHant.orderAwaitingConfirmationHint}
                    </p>
                  )}
                </div>
              </div>
              <div className="fps-qr-wrap fps-qr-wrap--aside">
                <img
                  src={fpsQrSrc}
                  alt={zhHant.fpsQrAlt}
                  className="fps-qr"
                  decoding="async"
                />
              </div>
            </div>
          </section>
        )}
      </div>

      <p className="muted small order-page-footer">
        <Link href="/">{zhHant.continueShopping}</Link>
        <span className="order-page-footer-sep muted small" aria-hidden>
          {" "}
          ·{" "}
        </span>
        <Link href="/track">{zhHant.orderPageTrackAnother}</Link>
      </p>
    </div>
  );
}
