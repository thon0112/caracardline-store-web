import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  applyCartCoupon,
  deleteCartLine,
  patchCartLineQuantity,
  removeCartCoupon,
  type CartCatalogItem,
  type CartLine,
} from "../api.js";
import { useCart } from "../cart-context.js";
import { cn } from "../cn.js";
import { formatPriceUsd, zhHant } from "../locale/zh-Hant.js";
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

const cartPageRoot =
  "cursor-default select-none caret-transparent [-webkit-user-select:none]";

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

function CartLineQtyField({
  line,
  max,
  disabled,
  onCommit,
}: {
  line: CartLine;
  max: number;
  disabled: boolean;
  onCommit: (line: CartLine, next: number) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState(() => String(line.quantity));
  const [focused, setFocused] = useState(false);
  const commitInFlightRef = useRef(false);

  useEffect(() => {
    if (!focused && !commitInFlightRef.current) {
      setDraft(String(line.quantity));
    }
  }, [line.quantity, focused]);

  async function commitDraft(raw: string) {
    try {
      const digits = digitsOnly(raw);
      if (digits === "") {
        setDraft(String(line.quantity));
        return;
      }
      const parsed = Number.parseInt(digits, 10);
      if (!Number.isFinite(parsed)) {
        setDraft(String(line.quantity));
        return;
      }
      const q = Math.min(max, Math.max(1, parsed));
      if (q === line.quantity) {
        setDraft(String(line.quantity));
        return;
      }
      const ok = await onCommit(line, q);
      if (!ok) setDraft(String(line.quantity));
      else setDraft(String(q));
    } finally {
      commitInFlightRef.current = false;
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={zhHant.cartQtyAria}
      disabled={disabled}
      value={draft}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        commitInFlightRef.current = true;
        setFocused(false);
        void commitDraft(e.currentTarget.value);
      }}
      onChange={(e) => {
        let next = digitsOnly(e.target.value);
        if (next.length > 2) next = next.slice(0, 2);
        setDraft(next);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
      }}
      className="qty-input h-8 w-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-0.5 text-center text-base font-semibold tabular-nums text-[var(--fg)] outline-none select-text [-webkit-user-select:text] caret-auto focus:border-[var(--accent)] focus:ring-1 focus:ring-[color-mix(in_srgb,var(--accent)_45%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
}

export function CartPage() {
  const { showToast } = useToast();
  const {
    cartId,
    lines,
    subtotal,
    discountTotal,
    totalDue,
    couponCode,
    couponCapExhausted,
    loading,
    error,
    refreshCart,
  } = useCart();
  const [busyLineId, setBusyLineId] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [couponDraft, setCouponDraft] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);

  async function setQuantity(line: CartLine, next: number): Promise<boolean> {
    if (!cartId) return false;
    const max = maxLineQty(line.catalog, line.quantity);
    const q = Math.min(max, Math.max(1, next));
    if (q === line.quantity) return true;
    setActionErr(null);
    setBusyLineId(line.lineId);
    try {
      await patchCartLineQuantity(cartId, line.lineId, q);
      await refreshCart({ silent: true });
      return true;
    } catch (e) {
      if (!tryToastBadRequest(e, showToast)) {
        setActionErr(e instanceof Error ? e.message : zhHant.errUpdateFailed);
      }
      return false;
    } finally {
      setBusyLineId(null);
    }
  }

  async function onApplyCoupon(e: FormEvent) {
    e.preventDefault();
    if (!cartId || couponBusy) return;
    const raw = couponDraft.trim();
    if (!raw) return;
    setCouponBusy(true);
    try {
      await applyCartCoupon(cartId, { code: raw });
      setCouponDraft("");
      await refreshCart({ silent: true });
    } catch (err) {
      if (!tryToastBadRequest(err, showToast)) {
        showToast(err instanceof Error ? err.message : zhHant.cartCouponNotApplicableGeneric);
      }
    } finally {
      setCouponBusy(false);
    }
  }

  async function onRemoveCoupon() {
    if (!cartId || couponBusy) return;
    setCouponBusy(true);
    try {
      await removeCartCoupon(cartId);
      await refreshCart({ silent: true });
    } catch (err) {
      if (!tryToastBadRequest(err, showToast)) {
        showToast(err instanceof Error ? err.message : zhHant.cartCouponNotApplicableGeneric);
      }
    } finally {
      setCouponBusy(false);
    }
  }

  async function removeLine(lineId: string) {
    if (!cartId) return;
    setActionErr(null);
    setBusyLineId(lineId);
    try {
      await deleteCartLine(cartId, lineId);
      await refreshCart({ silent: true });
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
      <div className={cartPageRoot}>
        <h1 className="m-0 mb-2 select-text text-[1.75rem] font-bold [-webkit-user-select:text]">
          {zhHant.cartTitle}
        </h1>
        <p className="select-text text-[var(--err)] [-webkit-user-select:text]">{error}</p>
        <button
          type="button"
          className="mx-0 mb-0 mt-6 inline-block cursor-pointer rounded-lg border border-[var(--border)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void refreshCart()}
        >
          {zhHant.cartRetry}
        </button>
        <p className="mt-4 select-text text-sm text-[var(--muted)] [-webkit-user-select:text]">
          <Link
            href="/"
            className="cursor-pointer text-inherit no-underline hover:text-[var(--accent)] hover:underline"
          >
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
      <div className={cartPageRoot}>
        <h1 className="m-0 mb-2 select-text text-[1.75rem] font-bold [-webkit-user-select:text]">
          {zhHant.cartTitle}
        </h1>
        <p className="m-0 mb-6 max-w-[42rem] select-text text-[var(--muted)] [-webkit-user-select:text]">
          {zhHant.cartEmpty}
        </p>
        <Link
          href="/catalog"
          className="mx-0 mb-0 mt-6 inline-block cursor-pointer rounded-lg border border-[var(--border)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--fg)] no-underline hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
        >
          {zhHant.browseCatalog}
        </Link>
      </div>
    );
  }

  const hasSoldOut = lines.some((l) => l.catalog.soldOut);

  return (
    <div className={cartPageRoot}>
      <h1 className="m-0 mb-2 select-text text-[1.75rem] font-bold [-webkit-user-select:text]">
        {zhHant.cartTitle}
      </h1>
      <p className="m-0 mb-6 max-w-[42rem] select-text text-[var(--muted)] [-webkit-user-select:text]">
        {lines.length === 1
          ? zhHant.cartItemOne
          : zhHant.cartItemsMany(lines.length)}
      </p>
      {hasSoldOut && (
        <p
          className="my-3 rounded-lg border border-[color-mix(in_srgb,var(--err)_35%,var(--border))] bg-[color-mix(in_srgb,var(--err)_10%,var(--card))] px-[0.85rem] py-[0.65rem] text-[0.9rem] leading-snug text-[var(--fg)]"
          role="status"
        >
          {zhHant.cartSoldOutNotice}
        </p>
      )}
      {actionErr && (
        <p className="select-text text-[var(--err)] [-webkit-user-select:text]">{actionErr}</p>
      )}
      <ul className="m-0 mt-4 list-none p-0">
        {lines.map((line) => {
          const img = primaryImage(line.catalog);
          const max = maxLineQty(line.catalog, line.quantity);
          const busy = busyLineId === line.lineId;
          const lineTotal = line.quantity * line.catalog.listPrice;
          const soldOut = line.catalog.soldOut;
          return (
            <li
              key={line.lineId}
              className={cn(
                "flex flex-wrap items-start gap-4 border-b border-[var(--border)] py-4",
                soldOut && "[&_img]:opacity-72 [&_img]:grayscale-[25%]",
              )}
            >
              <Link
                href={`/item/${encodeURIComponent(line.catalog.slug)}`}
                className="block h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--media-bg)]"
              >
                {img ? (
                  <img className="block h-full w-full object-cover" src={img} alt="" />
                ) : (
                  <span className="block h-full w-full bg-[var(--card)]" />
                )}
              </Link>
              <div className="min-w-[min(100%,12rem)] flex-1">
                <Link
                  href={`/item/${encodeURIComponent(line.catalog.slug)}`}
                  className="select-text font-semibold text-[var(--fg)] no-underline leading-snug [-webkit-user-select:text] hover:text-[var(--accent)]"
                >
                  {displayTitle(line.catalog)}
                </Link>
                <p className="mt-[0.35rem] select-text text-sm text-[var(--muted)] [-webkit-user-select:text]">
                  {formatPriceUsd(line.catalog.listPrice)} {zhHant.cartEach}
                </p>
                {soldOut && (
                  <p className="mt-[0.35rem] select-text text-[0.8125rem] font-semibold text-[var(--err)] [-webkit-user-select:text]">
                    {zhHant.cartSoldOutLineNote}
                  </p>
                )}
                <div className="mt-[0.65rem] flex flex-wrap items-center gap-x-3 gap-y-2 select-none [-webkit-user-select:none] caret-transparent">
                  <button
                    type="button"
                    className="h-8 w-8 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--card)] p-0 text-base font-semibold leading-none text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={busy || soldOut || line.quantity <= 1}
                    aria-label={zhHant.cartDecreaseAria}
                    onClick={() => void setQuantity(line, line.quantity - 1)}
                  >
                    −
                  </button>
                  <CartLineQtyField
                    line={line}
                    max={max}
                    disabled={busy || soldOut}
                    onCommit={setQuantity}
                  />
                  <button
                    type="button"
                    className="h-8 w-8 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--card)] p-0 text-base font-semibold leading-none text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={busy || soldOut || line.quantity >= max}
                    aria-label={zhHant.cartIncreaseAria}
                    onClick={() => void setQuantity(line, line.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="border-none bg-transparent p-0 font-inherit text-sm text-[var(--muted)] underline hover:text-[var(--err)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={busy}
                    onClick={() => void removeLine(line.lineId)}
                  >
                    {zhHant.cartRemove}
                  </button>
                </div>
              </div>
              <div className="select-text self-center text-right text-[1.05rem] font-bold text-[var(--accent)] [-webkit-user-select:text] max-[520px]:ml-0 max-[520px]:w-full">
                {formatPriceUsd(lineTotal)}
              </div>
            </li>
          );
        })}
      </ul>
      <form
        className="mt-8 flex max-w-[26rem] flex-col gap-[0.45rem]"
        onSubmit={(e) => void onApplyCoupon(e)}
      >
        <label className="select-text text-sm font-semibold [-webkit-user-select:text]" htmlFor="cart-coupon-code">
          {zhHant.cartCouponCodeLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="cart-coupon-code"
            type="text"
            name="couponCode"
            autoComplete="off"
            spellCheck={false}
            disabled={couponBusy || hasSoldOut}
            value={couponDraft}
            onChange={(e) => setCouponDraft(e.target.value)}
            placeholder={zhHant.cartCouponPlaceholder}
            className="min-w-[12rem] flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-2 font-inherit text-base text-[var(--fg)] placeholder:text-[var(--muted)] disabled:opacity-50"
            maxLength={64}
          />
          <button
            type="submit"
            disabled={couponBusy || hasSoldOut || !couponDraft.trim()}
            className="cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {couponBusy ? zhHant.cartCouponApplying : zhHant.cartCouponApply}
          </button>
        </div>
        {couponCode && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="select-text text-sm text-[var(--muted)] [-webkit-user-select:text]">
              <span className="font-semibold text-[var(--fg)]">{couponCode}</span>
            </span>
            <button
              type="button"
              disabled={couponBusy || hasSoldOut}
              className="cursor-pointer border-none bg-transparent p-0 font-inherit text-sm text-[var(--muted)] underline hover:text-[var(--accent)] disabled:opacity-50"
              onClick={() => void onRemoveCoupon()}
            >
              {zhHant.cartCouponRemove}
            </button>
          </div>
        )}
        {couponCapExhausted && (
          <p className="m-0 select-text text-sm text-[var(--err)] [-webkit-user-select:text]" role="status">
            {zhHant.cartCouponCapExhausted}
          </p>
        )}
      </form>
      <div className="mt-6 space-y-[0.35rem] border-t border-[var(--border)] pt-5">
        <div className="flex items-baseline justify-end gap-4">
          <span className="select-text font-semibold text-[var(--muted)] [-webkit-user-select:text]">
            {zhHant.cartSubtotal}
          </span>
          <span className="select-text text-[1.15rem] font-bold tabular-nums text-[var(--accent)] [-webkit-user-select:text]">
            {formatPriceUsd(subtotal)}
          </span>
        </div>
        {discountTotal > 0 && (
          <div className="flex items-baseline justify-end gap-4">
            <span className="select-text font-semibold text-[var(--muted)] [-webkit-user-select:text]">
              {zhHant.cartDiscount}
            </span>
            <span className="select-text text-[1.05rem] font-semibold tabular-nums text-[var(--accent)] [-webkit-user-select:text]">
              −{formatPriceUsd(discountTotal)}
            </span>
          </div>
        )}
        <div className="flex items-baseline justify-end gap-4 border-t border-[var(--border)] pt-[0.45rem]">
          <span className="select-text font-semibold text-[var(--muted)] [-webkit-user-select:text]">
            {zhHant.cartTotalDue}
          </span>
          <span className="select-text text-[1.35rem] font-bold tabular-nums text-[var(--accent)] [-webkit-user-select:text]">
            {formatPriceUsd(totalDue)}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <Link
          href="/"
          className="mx-0 mb-0 mt-0 inline-block cursor-pointer rounded-lg border border-[var(--border)] bg-transparent px-[0.85rem] py-2 text-center font-semibold text-[var(--fg)] no-underline hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
        >
          ← {zhHant.continueShopping}
        </Link>
        {hasSoldOut ? (
          <span
            className="mx-4 mb-4 mt-3 inline-block cursor-not-allowed rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 text-center font-semibold text-[var(--accent)] opacity-50 pointer-events-none"
            role="button"
            aria-disabled="true"
            aria-label={zhHant.cartSoldOutNotice}
            title={zhHant.cartSoldOutNotice}
          >
            {zhHant.cartGoCheckout}
          </span>
        ) : (
          <Link
            href="/checkout"
            className="mx-4 mb-4 mt-3 inline-block cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 text-center font-semibold text-[var(--accent)] no-underline hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
          >
            {zhHant.cartGoCheckout}
          </Link>
        )}
      </div>
    </div>
  );
}
