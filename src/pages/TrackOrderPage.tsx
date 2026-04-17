import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "wouter";
import { zhHant } from "../locale/zh-Hant.js";

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
          <p className="select-text text-[var(--err)] [-webkit-user-select:text]" id="track-order-err" role="alert">
            {formErr}
          </p>
        ) : null}
        <button
          type="submit"
          className="mx-4 mb-4 mt-2 w-full max-w-[28rem] cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {zhHant.trackOrderSubmit}
        </button>
      </form>

      <p className="mt-6 select-text text-sm text-[var(--muted)] [-webkit-user-select:text]">
        <Link href="/" className="text-[var(--muted)] no-underline hover:text-[var(--accent)]">
          ← {zhHant.navHome}
        </Link>
      </p>
    </div>
  );
}
