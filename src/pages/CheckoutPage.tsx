import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "../cn.js";
import { isApiError, placeOrder, type PlaceOrderBody } from "../api.js";
import { useCart } from "../cart-context.js";
import {
  formatPriceUsd,
  toastTextForBadRequest,
  zhHant,
} from "../locale/zh-Hant.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { SfOutletPicker } from "../components/SfOutletPicker.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { sfOutletToShipAddress, type SfOutlet } from "../sf-outlet.js";
import { useToast } from "../toast-context.js";

/** Checkout only ships to Hong Kong; locality fields fixed until multi-region shipping. */
const SHIP_COUNTRY_HK = "HK" as const;
const SHIP_LOCALITY_HK = "香港";

type ShipMode = "sf" | "manual";

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
  const [shipMode, setShipMode] = useState<ShipMode>("sf");
  const [sfOutlet, setSfOutlet] = useState<SfOutlet | null>(null);

  useEffect(() => {
    if (loading || error) return;
    if (!cartId || lines.length === 0) {
      setLocation("/cart");
    }
  }, [loading, error, cartId, lines.length, setLocation]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cartId || lines.length === 0) return;
    if (lines.some((l) => l.catalog.soldOut)) {
      setFormErr(zhHant.checkoutSoldOutBlocked);
      return;
    }
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
    let shipLine1: string;
    let shipLine2: string | undefined;
    if (shipMode === "sf") {
      if (!sfOutlet) {
        setFormErr(zhHant.checkoutSfOutletRequired);
        return;
      }
      const mapped = sfOutletToShipAddress(sfOutlet);
      shipLine1 = mapped.shipAddressLine1;
      shipLine2 = mapped.shipAddressLine2;
    } else {
      const trimmedLine1 = shipAddressLine1.trim();
      if (!trimmedLine1) {
        setFormErr(zhHant.checkoutAddressRequired);
        return;
      }
      shipLine1 = trimmedLine1;
      shipLine2 = shipAddressLine2.trim() || undefined;
    }
    setSubmitting(true);
    try {
      const body: PlaceOrderBody = {
        cartId,
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
        shipRecipientName: trimmedName,
        shipPhone: trimmedPhone,
        shipAddressLine1: shipLine1,
        shipAddressLine2: shipLine2,
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
      <div className="cursor-default select-none caret-transparent [-webkit-user-select:none] [&_.error]:select-text [&_a]:cursor-pointer [&_button]:cursor-pointer">
        <h1 className="m-0 mb-2 select-text text-[1.75rem] font-bold [-webkit-user-select:text]">
          {zhHant.checkoutTitle}
        </h1>
        <p className="error select-text text-[var(--err)] [-webkit-user-select:text]">{error}</p>
        <Link
          href="/cart"
          className="mb-4 mt-0 inline-block cursor-pointer select-text text-[var(--muted)] no-underline [-webkit-user-select:text]"
        >
          ← {zhHant.navCart}
        </Link>
      </div>
    );
  }

  if (loading || !cartId || lines.length === 0) {
    return <PageLoadingSkeleton variant="checkout" />;
  }

  const hasSoldOut = lines.some((l) => l.catalog.soldOut);

  const fieldLabel = "mb-[0.35rem] block cursor-pointer text-sm font-semibold";
  const fieldInput =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-2 font-inherit text-base text-[var(--fg)] placeholder:text-[var(--muted)] read-only:cursor-default read-only:text-[var(--muted)]";

  return (
    <div className="cursor-default select-none caret-transparent [-webkit-user-select:none] [&_.error]:select-text [&_a]:cursor-pointer [&_button]:cursor-pointer [&_input]:cursor-text [&_input]:select-text [&_input]:caret-auto [&_label]:cursor-pointer [&_textarea]:cursor-text [&_textarea]:select-text [&_textarea]:caret-auto">
      <h1 className="m-0 mb-2 select-text text-[1.75rem] font-bold [-webkit-user-select:text]">
        {zhHant.checkoutTitle}
      </h1>
      <p className="m-0 mb-6 max-w-[42rem] select-text text-[var(--muted)] [-webkit-user-select:text]">
        {zhHant.checkoutLede}
      </p>

      <div className="grid items-start gap-x-8 gap-y-6 min-[880px]:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
        <div className="min-w-0">
          {hasSoldOut && (
            <p className="mb-3 select-text text-[var(--err)] [-webkit-user-select:text]" role="alert">
              {zhHant.checkoutSoldOutBlocked}{" "}
              <Link href="/cart" className="font-semibold text-inherit underline">
                {zhHant.navCart}
              </Link>
            </p>
          )}
          {formErr && (
            <p className="select-text text-[var(--err)] [-webkit-user-select:text]">{formErr}</p>
          )}

          <form
            id="checkout-form"
            className="grid max-w-[28rem] gap-4"
            onSubmit={(e) => void onSubmit(e)}
          >
            <div className="min-w-0">
              <label className={fieldLabel} htmlFor="co-name">
                {zhHant.checkoutShipName}
              </label>
              <input
                className={fieldInput}
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
            <div className="min-w-0">
              <label className={fieldLabel} htmlFor="co-phone">
                {zhHant.checkoutShipPhone}
              </label>
              <input
                className={fieldInput}
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
            <div className="min-w-0">
              <label className={fieldLabel} htmlFor="co-email">
                {zhHant.checkoutEmail}
              </label>
              <input
                className={fieldInput}
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

            <fieldset className="m-0 min-w-0 border-none p-0">
              <legend className="mb-[0.45rem] block p-0 text-sm font-semibold">
                {zhHant.checkoutShipMethod}
              </legend>
              <div className="flex flex-wrap gap-2" role="group" aria-label={zhHant.checkoutShipMethod}>
                <button
                  type="button"
                  className={cn(
                    "min-w-[12rem] flex-1 cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-[0.55rem] font-inherit text-[0.9375rem] font-semibold leading-snug text-[var(--fg)] transition-colors duration-150 hover:border-[color-mix(in_srgb,var(--accent)_38%,var(--border))] hover:text-[var(--accent)]",
                    shipMode === "sf" &&
                      "border-[color-mix(in_srgb,var(--accent)_55%,var(--border))] bg-[rgba(181,111,69,0.1)] text-[var(--accent)]",
                  )}
                  aria-pressed={shipMode === "sf"}
                  onClick={() => {
                    setShipMode("sf");
                    setShipAddressLine1("");
                    setShipAddressLine2("");
                  }}
                >
                  {zhHant.checkoutShipModeSf}
                </button>
                <button
                  type="button"
                  className={cn(
                    "min-w-[12rem] flex-1 cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-[0.55rem] font-inherit text-[0.9375rem] font-semibold leading-snug text-[var(--fg)] transition-colors duration-150 hover:border-[color-mix(in_srgb,var(--accent)_38%,var(--border))] hover:text-[var(--accent)]",
                    shipMode === "manual" &&
                      "border-[color-mix(in_srgb,var(--accent)_55%,var(--border))] bg-[rgba(181,111,69,0.1)] text-[var(--accent)]",
                  )}
                  aria-pressed={shipMode === "manual"}
                  onClick={() => {
                    setShipMode("manual");
                    setSfOutlet(null);
                  }}
                >
                  {zhHant.checkoutShipModeManual}
                </button>
              </div>
              <p className="mt-[0.55rem] select-text text-sm leading-normal text-[var(--muted)] [-webkit-user-select:text]">
                {zhHant.checkoutShipModeHint}
              </p>
            </fieldset>

            {shipMode === "manual" && (
              <div className="min-w-0">
                <label className={fieldLabel} htmlFor="co-country">
                  {zhHant.checkoutShipCountry}
                </label>
                <input
                  className={fieldInput}
                  id="co-country"
                  name="shipCountry"
                  type="text"
                  readOnly
                  required
                  aria-readonly="true"
                  value={zhHant.checkoutShipCountryHongKongDisplay}
                />
              </div>
            )}

            {shipMode === "sf" ? (
              <SfOutletPicker value={sfOutlet} onChange={setSfOutlet} />
            ) : (
              <>
                <div className="min-w-0">
                  <label className={fieldLabel} htmlFor="co-line1">
                    {zhHant.checkoutShipLine1}
                  </label>
                  <input
                    className={fieldInput}
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
                <div className="min-w-0">
                  <label className={fieldLabel} htmlFor="co-line2">
                    {zhHant.checkoutShipLine2}
                  </label>
                  <input
                    className={fieldInput}
                    id="co-line2"
                    name="shipAddressLine2"
                    type="text"
                    autoComplete="address-line2"
                    value={shipAddressLine2}
                    onChange={(e) => setShipAddressLine2(e.target.value)}
                    maxLength={255}
                  />
                </div>
              </>
            )}

            <p className="select-text text-sm text-[var(--muted)] [-webkit-user-select:text]">
              {zhHant.checkoutFpsNote}
            </p>
          </form>

          <Link
            href="/cart"
            className="mb-4 mt-5 inline-block cursor-pointer select-text text-[var(--muted)] no-underline [-webkit-user-select:text]"
          >
            ← {zhHant.backToCart}
          </Link>
        </div>

        <aside className="min-w-0" aria-label={zhHant.checkoutOrderPreview}>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] px-[1.15rem] py-4">
            <p className="m-0 mb-2 select-text text-sm text-[var(--muted)] [-webkit-user-select:text]">
              {zhHant.checkoutOrderPreview}
            </p>
            <ul className="m-0 mt-2 list-none p-0 text-[0.9375rem]">
              {lines.map((l) => (
                <li
                  key={l.lineId}
                  className="flex justify-between gap-3 border-b border-[var(--border)] py-[0.35rem] last:border-b-0"
                >
                  <span className="select-text [-webkit-user-select:text]">
                    {l.catalog.title || l.catalog.card?.name || zhHant.productFallback}
                  </span>
                  <span className="select-text text-[var(--muted)] [-webkit-user-select:text]">
                    ×{l.quantity} · {formatPriceUsd(l.quantity * l.catalog.listPrice)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mb-0 mt-[0.85rem] flex items-baseline justify-between border-t border-[var(--border)] pt-3 font-semibold">
              <span className="select-text [-webkit-user-select:text]">{zhHant.cartSubtotal}</span>
              <strong className="select-text [-webkit-user-select:text]">{formatPriceUsd(subtotal)}</strong>
            </p>
            <button
              type="submit"
              form="checkout-form"
              className="mx-4 mb-4 mt-4 w-full cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting || hasSoldOut}
              title={hasSoldOut ? zhHant.checkoutSoldOutBlocked : undefined}
            >
              {submitting ? zhHant.checkoutSubmitting : zhHant.checkoutSubmit}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
