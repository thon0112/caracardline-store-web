import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { cn } from "../cn.js";
import {
  fetchMyOrders,
  isApiError,
  patchDefaultShippingAddress,
  type DefaultShippingPatch,
  type MyOrderSummary,
} from "../api.js";
import { useAuth } from "../auth-context.js";
import { useDocumentMeta } from "../document-meta.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { PAGE_META } from "../page-meta.js";
import { SfOutletPicker } from "../components/SfOutletPicker.js";
import {
  displayOrderStatus,
  formatPriceUsd,
  zhHant,
} from "../locale/zh-Hant.js";
import { useToast } from "../toast-context.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { sfOutletToShipAddress, type SfOutlet } from "../sf-outlet.js";

type ShipMode = "sf" | "manual";

const SHIP_COUNTRY_HK = "HK" as const;
const SHIP_LOCALITY_HK = "香港";

function isSfAddressLine1(line1: string): boolean {
  return line1.trim().startsWith("順豐自提碼：");
}

function formatOrderWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("zh-Hant", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function AccountPage() {
  useDocumentMeta(PAGE_META.account);
  const { showToast } = useToast();
  const {
    user,
    loading: authLoading,
    logout,
    startGoogleLogin,
    refresh,
  } = useAuth();
  const [orders, setOrders] = useState<MyOrderSummary[] | null>(null);
  const [ordersErr, setOrdersErr] = useState<string | null>(null);

  const [defRecipient, setDefRecipient] = useState("");
  const [defPhone, setDefPhone] = useState("");
  const [defLine1, setDefLine1] = useState("");
  const [defLine2, setDefLine2] = useState("");
  const [shipMode, setShipMode] = useState<ShipMode>("sf");
  const [sfOutlet, setSfOutlet] = useState<SfOutlet | null>(null);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingFormErr, setShippingFormErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders(null);
      return;
    }
    let cancelled = false;
    setOrdersErr(null);
    void (async () => {
      try {
        const data = await fetchMyOrders();
        if (!cancelled) setOrders(data.orders);
      } catch (e) {
        if (!cancelled) {
          setOrdersErr(
            e instanceof Error ? e.message : zhHant.errCartLoadFailed,
          );
          setOrders([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setDefRecipient(user.defaultShipRecipientName?.trim() ?? "");
    setDefPhone(user.defaultShipPhone?.trim() ?? "");
    const nextLine1 = user.defaultShipAddressLine1?.trim() ?? "";
    setDefLine1(nextLine1);
    setDefLine2(user.defaultShipAddressLine2?.trim() ?? "");
    setShipMode(isSfAddressLine1(nextLine1) ? "sf" : "manual");
    setSfOutlet(null);
  }, [
    user?.id,
    user?.defaultShipRecipientName,
    user?.defaultShipPhone,
    user?.defaultShipAddressLine1,
    user?.defaultShipAddressLine2,
  ]);

  async function onSaveDefaultShipping(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setShippingFormErr(null);
    const trimmedName = defRecipient.trim();
    const trimmedPhone = defPhone.trim();
    let shipLine1: string;
    let shipLine2: string | null;
    if (shipMode === "sf") {
      if (sfOutlet) {
        const mapped = sfOutletToShipAddress(sfOutlet);
        shipLine1 = mapped.shipAddressLine1;
        shipLine2 = mapped.shipAddressLine2 ?? null;
      } else {
        const existingLine1 = defLine1.trim();
        if (!isSfAddressLine1(existingLine1)) {
          setShippingFormErr(zhHant.checkoutSfOutletRequired);
          return;
        }
        shipLine1 = existingLine1;
        shipLine2 = defLine2.trim() || null;
      }
    } else {
      const manualLine1 = defLine1.trim();
      if (!manualLine1) {
        setShippingFormErr(zhHant.checkoutAddressRequired);
        return;
      }
      shipLine1 = manualLine1;
      shipLine2 = defLine2.trim() || null;
    }
    const body: DefaultShippingPatch = {
      defaultShipRecipientName: trimmedName,
      defaultShipPhone: trimmedPhone,
      defaultShipAddressLine1: shipLine1,
      defaultShipAddressLine2: shipLine2,
      defaultShipCity: SHIP_LOCALITY_HK,
      defaultShipRegion: SHIP_LOCALITY_HK,
      defaultShipPostalCode: null,
      defaultShipCountry: SHIP_COUNTRY_HK,
    };
    if (!body.defaultShipRecipientName) {
      setShippingFormErr(zhHant.checkoutNameRequired);
      return;
    }
    if (!body.defaultShipPhone) {
      setShippingFormErr(zhHant.checkoutPhoneRequired);
      return;
    }
    setShippingSaving(true);
    try {
      await patchDefaultShippingAddress(body);
      await refresh();
      showToast(zhHant.accountDefaultShippingSavedToast);
    } catch (err) {
      if (tryToastBadRequest(err, showToast)) {
        /* mapped to toast */
      } else if (isApiError(err)) {
        setShippingFormErr(
          err.message || zhHant.accountDefaultShippingSaveError,
        );
      } else {
        setShippingFormErr(zhHant.accountDefaultShippingSaveError);
      }
    } finally {
      setShippingSaving(false);
    }
  }

  const fieldLabel = "mb-[0.35rem] block cursor-pointer text-sm font-semibold";
  const fieldInput =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-2 font-inherit text-base text-[var(--fg)] placeholder:text-[var(--muted)] read-only:cursor-default read-only:text-[var(--muted)]";

  if (authLoading) {
    return <PageLoadingSkeleton variant="checkout" />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <h1 className="mb-3 text-2xl font-bold text-[var(--fg)]">
          {zhHant.accountTitle}
        </h1>
        <p className="mb-6 text-[var(--muted)]">{zhHant.accountNeedLogin}</p>
        <button
          type="button"
          className="rounded-xl bg-[var(--accent-fill)] px-5 py-3 font-semibold text-[var(--on-accent-fill)]"
          onClick={() => startGoogleLogin("/account")}
        >
          {zhHant.navLoginGoogle}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[var(--fg)]">
            {zhHant.accountTitle}
          </h1>
          <p className="mt-1 truncate text-sm text-[var(--muted)]">
            {user.email}
          </p>
        </div>
      </div>
      <section
        aria-labelledby="acct-orders-heading"
        className="mb-10 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <h2
          id="acct-orders-heading"
          className="mb-4 text-lg font-semibold text-[var(--fg)]"
        >
          {zhHant.accountOrdersHeading}
        </h2>
        {orders === null ? (
          <p className="text-[var(--muted)]">{zhHant.accountLoading}</p>
        ) : ordersErr ? (
          <p className="text-[var(--muted)]">{ordersErr}</p>
        ) : orders.length === 0 ? (
          <p className="text-[var(--muted)]">{zhHant.accountNoOrders}</p>
        ) : (
          <ul className="m-0 list-none space-y-3 p-0">
            {orders.map((o) => (
              <li
                key={o.orderId}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 font-mono text-sm text-[var(--muted)]">
                      {o.orderId}
                    </p>
                    <p className="m-0 mt-1 text-sm text-[var(--fg)]">
                      {formatOrderWhen(o.createdAt)}
                    </p>
                    <p className="m-0 mt-1 text-xs text-[var(--muted)]">
                      {displayOrderStatus(o.status)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {o.totalDue != null ? (
                      <span className="font-semibold text-[var(--fg)]">
                        {formatPriceUsd(o.totalDue)}
                      </span>
                    ) : null}
                    <Link
                      href={`/order/${encodeURIComponent(o.orderId)}`}
                      className="text-sm font-semibold text-[var(--accent)] no-underline hover:underline"
                    >
                      {zhHant.accountOrderView}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section
        aria-labelledby="acct-shipping-heading"
        className="mb-10 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <h2
          id="acct-shipping-heading"
          className="m-0 mb-2 text-lg font-semibold text-[var(--fg)]"
        >
          {zhHant.accountDefaultShippingHeading}
        </h2>
        <p className="m-0 mb-4 text-sm text-[var(--muted)]">
          {zhHant.accountDefaultShippingIntro}
        </p>
        <form
          onSubmit={(e) => void onSaveDefaultShipping(e)}
          className="space-y-4"
        >
          {shippingFormErr ? (
            <p className="m-0 text-sm text-[var(--err)]">{shippingFormErr}</p>
          ) : null}
          <div>
            <label className={fieldLabel} htmlFor="acct-def-name">
              {zhHant.checkoutShipName}
            </label>
            <input
              id="acct-def-name"
              className={fieldInput}
              value={defRecipient}
              onChange={(e) => setDefRecipient(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="acct-def-phone">
              {zhHant.checkoutShipPhone}
            </label>
            <input
              id="acct-def-phone"
              className={fieldInput}
              value={defPhone}
              onChange={(e) => setDefPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>
          <fieldset className="m-0 min-w-0 border-none p-0">
            <legend className="mb-[0.45rem] block p-0 text-sm font-semibold">
              {zhHant.checkoutShipMethod}
            </legend>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={zhHant.checkoutShipMethod}
            >
              <button
                type="button"
                className={cn(
                  "min-w-[12rem] flex-1 cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-[0.55rem] font-inherit text-[0.9375rem] font-semibold leading-snug text-[var(--fg)] transition-colors duration-150 hover:border-[color-mix(in_srgb,var(--accent)_38%,var(--border))] hover:text-[var(--accent)]",
                  shipMode === "sf" &&
                    "bg-accent/90 text-white hover:text-white",
                )}
                aria-pressed={shipMode === "sf"}
                onClick={() => {
                  setShipMode("sf");
                  setDefLine1("");
                  setDefLine2("");
                }}
              >
                {zhHant.checkoutShipModeSf}
              </button>
              <button
                type="button"
                className={cn(
                  "min-w-[12rem] flex-1 cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-[0.55rem] font-inherit text-[0.9375rem] font-semibold leading-snug text-[var(--fg)] transition-colors duration-150 hover:border-[color-mix(in_srgb,var(--accent)_38%,var(--border))] hover:text-[var(--accent)]",
                  shipMode === "manual" &&
                    "bg-accent/90 text-white hover:text-white",
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
            <p className="mt-[0.55rem] text-sm leading-normal text-[var(--muted)]">
              {zhHant.checkoutShipModeHint}
            </p>
          </fieldset>

          {shipMode === "sf" ? (
            <SfOutletPicker value={sfOutlet} onChange={setSfOutlet} />
          ) : (
            <>
              <div>
                <label className={fieldLabel} htmlFor="acct-def-country">
                  {zhHant.checkoutShipCountry}
                </label>
                <input
                  id="acct-def-country"
                  className={fieldInput}
                  value={zhHant.checkoutShipCountryHongKongDisplay}
                  readOnly
                  aria-readonly="true"
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="acct-def-line1">
                  {zhHant.checkoutShipLine1}
                </label>
                <input
                  id="acct-def-line1"
                  className={fieldInput}
                  value={defLine1}
                  onChange={(e) => setDefLine1(e.target.value)}
                  autoComplete="address-line1"
                  required
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="acct-def-line2">
                  {zhHant.checkoutShipLine2}
                </label>
                <input
                  id="acct-def-line2"
                  className={fieldInput}
                  value={defLine2}
                  onChange={(e) => setDefLine2(e.target.value)}
                  autoComplete="address-line2"
                />
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={shippingSaving}
            className="rounded-xl bg-[var(--accent-fill)] px-5 py-2.5 font-semibold text-[var(--on-accent-fill)] disabled:opacity-60"
          >
            {shippingSaving
              ? zhHant.accountDefaultShippingSaving
              : zhHant.accountSaveDefaultShipping}
          </button>
        </form>
      </section>
      <button
        type="button"
        className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--fg)]"
        onClick={() => void logout()}
      >
        {zhHant.accountLogout}
      </button>
    </div>
  );
}
