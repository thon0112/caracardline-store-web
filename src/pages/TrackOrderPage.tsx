import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useSearchParams } from "wouter";
import { isApiError, lookupOrdersByEmail } from "../api.js";
import { toastTextForBadRequest, zhHant } from "../locale/zh-Hant.js";
import { useToast } from "../toast-context.js";

function orderIdFromSearchParams(searchParams: URLSearchParams): string {
  const raw =
    searchParams.get("id") ??
    searchParams.get("order") ??
    searchParams.get("orderId");
  return raw?.trim() ?? "";
}

export function TrackOrderPage() {
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [formErr, setFormErr] = useState<string | null>(null);

  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupErr, setLookupErr] = useState<string | null>(null);
  const { showToast } = useToast();
  const [lookupBusy, setLookupBusy] = useState(false);

  useEffect(() => {
    const fromQs = orderIdFromSearchParams(searchParams);
    if (fromQs) setOrderId(fromQs);
  }, [searchParams]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const id = orderId.trim();
    if (!id) {
      setFormErr(zhHant.trackOrderIdRequired);
      return;
    }
    setLocation(`/order/${encodeURIComponent(id)}`);
  }

  async function onLookupByEmail(e: FormEvent) {
    e.preventDefault();
    setLookupErr(null);
    const email = lookupEmail.trim();
    if (!email) {
      setLookupErr(zhHant.trackOrderLookupEmailRequired);
      return;
    }
    setLookupBusy(true);
    try {
      await lookupOrdersByEmail(email);
      setLookupEmail("");
      showToast(zhHant.trackOrderLookupSuccess);
    } catch (err) {
      if (isApiError(err) && err.status === 400) {
        setLookupErr(toastTextForBadRequest(err.message));
      } else if (isApiError(err) && err.status === 503) {
        setLookupErr(zhHant.trackOrderLookupEmailUnavailable);
      } else {
        setLookupErr(
          err instanceof Error ? err.message : zhHant.trackOrderLookupFailed,
        );
      }
    } finally {
      setLookupBusy(false);
    }
  }

  return (
    <div className="cursor-default select-none caret-transparent [-webkit-user-select:none] [&_.error]:select-text [&_a]:cursor-pointer [&_button]:cursor-pointer [&_input]:cursor-text [&_input]:select-text [&_input]:caret-auto [&_label]:cursor-pointer">
      <h1 className="m-0 mb-2 select-text text-[1.75rem] font-bold [-webkit-user-select:text]">
        {zhHant.trackOrderTitle}
      </h1>
      <p className="m-0 mb-6 max-w-[42rem] select-text text-[var(--muted)] [-webkit-user-select:text]">
        {zhHant.trackOrderLede}
      </p>

      <form className="grid max-w-[28rem] gap-4" onSubmit={onSubmit}>
        <div className="min-w-0">
          <label
            className="mb-[0.35rem] block cursor-pointer text-sm font-semibold"
            htmlFor="track-order-id"
          >
            {zhHant.trackOrderIdLabel}
          </label>
          <input
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-2 font-inherit text-base text-[var(--fg)]"
            id="track-order-id"
            name="orderId"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={orderId}
            onChange={(ev) => setOrderId(ev.target.value)}
            maxLength={128}
            aria-invalid={Boolean(formErr)}
            aria-describedby={formErr ? "track-order-err" : undefined}
          />
        </div>
        {formErr ? (
          <p
            className="select-text text-[var(--err)] [-webkit-user-select:text]"
            id="track-order-err"
            role="alert"
          >
            {formErr}
          </p>
        ) : null}
        <button
          type="submit"
          className="mt-2 w-full min-w-0 cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 text-center font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {zhHant.trackOrderSubmit}
        </button>
      </form>

      <div
        className="my-8 flex items-center gap-3 text-sm text-[var(--muted)]"
        role="separator"
        aria-label={zhHant.trackOrderLookupDivider}
      >
        <span className="h-px min-w-0 flex-1 bg-[var(--border)] md:hidden" />
        <span className="shrink-0 select-text [-webkit-user-select:text] md:hidden">
          {zhHant.trackOrderLookupDivider}
        </span>
        <span className="h-px min-w-0 flex-1 bg-[var(--border)] md:hidden" />
      </div>

      <h2 className="m-0 mb-2 select-text text-lg font-bold [-webkit-user-select:text]">
        {zhHant.trackOrderLookupSectionTitle}
      </h2>
      <p className="m-0 mb-4 max-w-[42rem] select-text text-[var(--muted)] [-webkit-user-select:text]">
        {zhHant.trackOrderLookupSectionLede}
      </p>

      <form className="grid max-w-[28rem] gap-4" onSubmit={onLookupByEmail}>
        <div className="min-w-0">
          <label
            className="mb-[0.35rem] block cursor-pointer text-sm font-semibold"
            htmlFor="track-order-email"
          >
            {zhHant.trackOrderLookupEmailLabel}
          </label>
          <input
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-2 font-inherit text-base text-[var(--fg)]"
            id="track-order-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            value={lookupEmail}
            onChange={(ev) => {
              setLookupEmail(ev.target.value);
            }}
            maxLength={320}
            aria-invalid={Boolean(lookupErr)}
            aria-describedby={lookupErr ? "track-order-lookup-err" : undefined}
            disabled={lookupBusy}
          />
        </div>
        {lookupErr ? (
          <p
            className="select-text text-[var(--err)] [-webkit-user-select:text]"
            id="track-order-lookup-err"
            role="alert"
          >
            {lookupErr}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={lookupBusy}
          className="mb-4 mt-2 w-full min-w-0 cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 text-center font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {lookupBusy
            ? zhHant.trackOrderLookupBusy
            : zhHant.trackOrderLookupSubmit}
        </button>
      </form>
    </div>
  );
}
