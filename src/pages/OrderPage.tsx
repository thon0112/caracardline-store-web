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
import { tryToastBadRequest } from "../notify-bad-request.js";
import { useToast } from "../toast-context.js";

const fpsReceiverId = (import.meta.env.VITE_FPS_RECEIVER_ID ?? "").trim();
const fpsQrUrl = (import.meta.env.VITE_FPS_QR_IMAGE_URL ?? "").trim();

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
    return <p className="muted">{zhHant.loadingPage}</p>;
  }

  if (loadErr || !order) {
    return (
      <div>
        <h1 className="title">{zhHant.orderTitle}</h1>
        <p className="error">{loadErr ?? zhHant.orderNotFound}</p>
        <Link href="/" className="back muted">
          ← {zhHant.navHome}
        </Link>
      </div>
    );
  }

  const deadline = formatDeadline(order.reservationExpiresAt);
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
    <div>
      <h1 className="title">{zhHant.orderTitle}</h1>
      <p className="lede muted">
        {zhHant.orderRef}{" "}
        <code translate="no">{order.orderId}</code>
      </p>

      <div className="order-meta card" style={{ padding: "1rem 1.15rem", marginBottom: "1.25rem" }}>
        <p style={{ margin: "0 0 0.35rem" }}>
          <strong>{zhHant.orderStatus}</strong> {statusLabel}
        </p>
        {deadline && (order.status === "awaiting_payment" || order.status === "awaiting_confirmation") && (
          <p className="muted small" style={{ margin: 0 }}>
            {zhHant.orderHoldUntil} {deadline}
          </p>
        )}
        {order.status === "expired" && (
          <p className="muted small" style={{ margin: "0.5rem 0 0" }}>
            {zhHant.orderExpiredHint}
          </p>
        )}
      </div>

      <h2 className="order-section-title">{zhHant.orderItems}</h2>
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
        <span>{zhHant.orderAmountDue}</span>
        <strong>{formatPriceUsd(total)}</strong>
      </div>

      {(order.status === "awaiting_payment" || order.status === "awaiting_confirmation") && (
        <section className="fps-section card" style={{ padding: "1.15rem 1.25rem", marginTop: "1.75rem" }}>
          <h2 className="order-section-title" style={{ marginTop: 0 }}>
            {zhHant.fpsTitle}
          </h2>
          <p className="muted small">{zhHant.fpsInstructions}</p>
          <p className="fps-amount">
            {zhHant.fpsPayExact} <strong>{formatPriceUsd(total)}</strong>
          </p>
          <p className="muted small">
            {zhHant.fpsMemoHint}{" "}
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
          {fpsQrUrl ? (
            <div className="fps-qr-wrap">
              <img src={fpsQrUrl} alt="" className="fps-qr" width={200} height={200} />
            </div>
          ) : null}

          {order.status === "awaiting_payment" && (
            <button
              type="button"
              className="btn checkout-submit"
              style={{ marginTop: "1rem" }}
              disabled={paymentBusy}
              onClick={() => void onPaymentSubmitted()}
            >
              {paymentBusy
                ? zhHant.orderPaymentSubmitting
                : zhHant.orderMarkTransferred}
            </button>
          )}
          {order.status === "awaiting_confirmation" && (
            <p className="muted small" style={{ marginTop: "1rem", marginBottom: 0 }}>
              {zhHant.orderAwaitingConfirmationHint}
            </p>
          )}
        </section>
      )}

      <p className="muted small" style={{ marginTop: "1.5rem" }}>
        <Link href="/">{zhHant.continueShopping}</Link>
      </p>
    </div>
  );
}
