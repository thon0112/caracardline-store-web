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
import { formatZhHantDeadline } from "../format-zh-hant-deadline.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { useToast } from "../toast-context.js";

/** Env overrides; otherwise bundled poster under `public/fps-payment-qr.png`. */
const fpsQrSrc =
  (import.meta.env.VITE_FPS_QR_IMAGE_URL ?? "").trim() || "/fps-payment-qr.png";

/** Shown as 訂單編號 in UI; full id remains in URL and copy-to-clipboard. */
function orderRefDisplayLastFour(orderId: string): string {
  const t = orderId.trim();
  if (!t) return "—";
  return t.length <= 4 ? t : t.slice(-4);
}

const orderRoot =
  "box-border w-full min-w-0 max-w-[48rem] cursor-default select-none caret-transparent [-webkit-user-select:none] [&_.error]:select-text [&_a]:cursor-pointer [&_button]:cursor-pointer [&_code]:select-text [&_code]:[-webkit-user-select:text] [&_strong]:select-text";

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

  async function copyFullOrderRef() {
    const full = orderRefDisplayLastFour(order?.orderId ?? "");
    if (!full) return;
    try {
      await navigator.clipboard.writeText(full);
      showToast(zhHant.orderRefCopiedToast);
    } catch {
      showToast(zhHant.orderRefCopyFailedToast);
    }
  }

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
      <div className={orderRoot}>
        <h1 className="m-0 mb-2 select-text text-[1.75rem] font-bold [-webkit-user-select:text]">
          {zhHant.orderTitle}
        </h1>
        <p className="error select-text text-[var(--err)] [-webkit-user-select:text]">
          {loadErr ?? zhHant.orderNotFound}
        </p>
        <Link
          href="/"
          className="mb-4 inline-block cursor-pointer select-text text-[var(--muted)] no-underline [-webkit-user-select:text]"
        >
          ← {zhHant.navHome}
        </Link>
      </div>
    );
  }

  const deadline = formatZhHantDeadline(order.reservationExpiresAt);
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
    <div className={orderRoot}>
      <h1 className="m-0 mb-[0.4rem] select-text text-[1.75rem] font-bold [-webkit-user-select:text]">
        {zhHant.orderTitle}
      </h1>
      <p className="m-0 mb-[1.2rem] max-w-[42rem] select-text leading-[1.55] text-[var(--muted)] [-webkit-user-select:text]">
        {zhHant.orderRef}{" "}
        <code
          className="text-[0.92em] leading-snug [word-break:break-all]"
          translate="no"
        >
          {order.orderId}
        </code>
      </p>

      <h2 className="mb-[0.45rem] mt-[0.1rem] select-text text-[1.1rem] font-semibold [-webkit-user-select:text]">
        {zhHant.orderItems}
      </h2>
      <ul className="m-0 list-none border-t border-[var(--border)] p-0">
        {order.items.map((item, idx) => (
          <li
            key={`${item.productId}-${idx}`}
            className="flex items-start justify-between gap-x-5 gap-y-4 border-b border-[var(--border)] py-[0.8rem] last:border-b-0 last:pb-[0.2rem]"
          >
            <div className="min-w-0">
              <span className="block select-text font-semibold leading-snug [-webkit-user-select:text]">
                {item.title}
              </span>
              <span className="inline select-text text-sm leading-normal text-[var(--muted)] [-webkit-user-select:text]">
                {" "}
                ×{item.quantity} · {formatPriceUsd(item.unitPrice)} {zhHant.cartEach}
              </span>
            </div>
            <div className="shrink-0 select-text text-right text-[1.05rem] font-bold tabular-nums leading-snug text-[var(--accent)] [-webkit-user-select:text]">
              {formatPriceUsd(item.quantity * item.unitPrice)}
            </div>
          </li>
        ))}
      </ul>
      <div className="mb-5 mt-[0.35rem] flex items-baseline justify-between gap-4 border-t-2 border-[color-mix(in_srgb,var(--border)_70%,var(--fg))] pt-4 text-[1.05rem]">
        <span className="select-text font-semibold text-[var(--muted)] [-webkit-user-select:text]">
          {zhHant.orderAmountDue}
        </span>
        <strong className="select-text text-[1.3rem] font-bold tabular-nums tracking-[0.01em] text-[var(--accent)] [-webkit-user-select:text]">
          {formatPriceUsd(total)}
        </strong>
      </div>

      <div className="mb-[1.35rem] block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] px-[1.05rem] py-[1.05rem] md:px-[1.45rem] md:py-5">
        <p className="m-0 mb-[0.4rem] select-text leading-snug [-webkit-user-select:text]">
          <strong>{zhHant.orderStatus}</strong> {statusLabel}
        </p>
        {deadline && showFpsBlock && order.reservationExpiresAt && (
          <div
            role="status"
            className="mb-[0.75rem] max-w-full select-text overflow-hidden rounded-lg border border-[#b6effb] bg-[#cff4fc] px-[1rem] py-[0.85rem] text-[#055160] shadow-[0_0.125rem_0.25rem_rgba(5,81,96,0.075)] [-webkit-user-select:text] md:px-[1.15rem] md:py-[0.95rem]"
          >
            <p className="m-0 text-center text-[1.05rem] font-bold leading-snug tracking-[0.01em] text-[#055160] min-[520px]:text-left min-[520px]:text-[1.15rem] md:text-[1.2rem]">
              {zhHant.orderPaymentDeadlineLabel}
              <time
                dateTime={order.reservationExpiresAt}
                className="font-bold tabular-nums text-[#055160] [overflow-wrap:anywhere]"
              >
                {deadline}
              </time>
            </p>
          </div>
        )}
        {order.status === "expired" && (
          <p className="mb-0 mt-[0.55rem] select-text text-sm leading-normal text-[var(--muted)] [-webkit-user-select:text]">
            {zhHant.orderExpiredHint}
          </p>
        )}
        {showFpsBlock && (
          <section className="m-0 min-w-0" aria-labelledby="fps-section-title">
            <div className="mt-[0.85rem] flex flex-col flex-wrap items-start justify-between gap-x-5 gap-y-4 border-t border-[var(--border)] pt-[0.9rem] md:table md:w-full md:table-fixed md:border-separate md:[border-spacing:min(1.25rem,3vw)_0]">
              <div className="box-border min-w-0 max-w-full flex-[1_1_14rem] md:table-cell md:w-auto md:align-top md:vertical-align-top">
                <h2
                  id="fps-section-title"
                  className="m-0 mb-[0.55rem] border-none p-0 select-text text-[1.1rem] font-semibold leading-snug [-webkit-user-select:text]"
                >
                  {zhHant.fpsTitle}
                </h2>
                <div className="box-border w-full min-w-0 max-w-full flex-[0_1_auto] [overflow-wrap:normal] [word-break:normal]">
                  <p className="mb-0 mt-0 block w-full max-w-full select-text text-sm leading-[1.55] [-webkit-user-select:text]">
                    {zhHant.fpsInstructions}
                  </p>
                  <p className="mb-0 mt-[0.65rem] box-border max-w-full rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--media-bg)_88%,var(--card))] px-[0.9rem] py-[0.65rem] text-[1.06rem] leading-snug [overflow-wrap:normal] [word-break:normal]">
                    {zhHant.fpsPayExact}{" "}
                    <strong className="tabular-nums">{formatPriceUsd(total)}</strong>
                  </p>
                  <p className="mb-0 mt-[0.65rem] block w-full max-w-full select-text text-sm leading-[1.55] [-webkit-user-select:text]">
                    {zhHant.fpsMemoHint}
                  </p>
                  <p className="mb-0 mt-[0.35rem] flex flex-wrap items-center gap-x-2 gap-y-2 select-text text-sm leading-snug [-webkit-user-select:text]">
                    <span className="text-[var(--muted)]">{zhHant.orderRef}</span>
                    <code
                      className="text-[0.95em] font-semibold text-[var(--fg)] [word-break:break-all]"
                      translate="no"
                    >
                      {orderRefDisplayLastFour(order.orderId)}
                    </code>
                    <button
                      type="button"
                      className="cursor-pointer rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--media-bg)_70%,var(--card))] px-[0.5rem] py-[0.2rem] text-[0.8125rem] font-semibold text-[var(--fg)] hover:border-[color-mix(in_srgb,var(--accent)_38%,var(--border))] hover:text-[var(--accent)]"
                      onClick={() => void copyFullOrderRef()}
                      aria-label={zhHant.orderRefCopyAria}
                    >
                      {zhHant.orderRefCopy}
                    </button>
                  </p>
                  {order.status === "awaiting_payment" && (
                    <button
                      type="button"
                      className="mx-0 mb-0 mt-[0.85rem] w-full max-w-none cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={paymentBusy}
                      onClick={() => void onPaymentSubmitted()}
                    >
                      {paymentBusy
                        ? zhHant.orderPaymentSubmitting
                        : zhHant.orderMarkTransferred}
                    </button>
                  )}
                  {order.status === "awaiting_confirmation" && (
                    <p className="mb-0 mt-[0.65rem] select-text text-sm text-[var(--muted)] [-webkit-user-select:text]">
                      {zhHant.orderAwaitingConfirmationHint}
                    </p>
                  )}
                </div>
              </div>
              <div className="box-border flex w-full max-w-full flex-[0_0_auto] shrink-0 items-center justify-center self-center px-0 py-[0.35rem] md:table-cell md:w-[248px] md:max-w-[248px] md:justify-end md:self-start md:px-0 md:pb-0 md:pl-[0.35rem] md:pt-0 md:text-right md:align-top md:vertical-align-top">
                <img
                  src={fpsQrSrc}
                  alt={zhHant.fpsQrAlt}
                  className="block h-auto max-w-[min(100%,232px)] rounded-[10px] border border-[var(--border)] md:inline-block md:align-top"
                  decoding="async"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
