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
    <div className="track-order-page">
      <h1 className="title">{zhHant.trackOrderTitle}</h1>
      <p className="lede muted">{zhHant.trackOrderLede}</p>

      <form className="form-stack" onSubmit={onSubmit}>
        <div className="form-field">
          <label htmlFor="track-order-id">{zhHant.trackOrderIdLabel}</label>
          <input
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
          <p className="error" id="track-order-err" role="alert">
            {formErr}
          </p>
        ) : null}
        <button type="submit" className="btn checkout-submit">
          {zhHant.trackOrderSubmit}
        </button>
      </form>

      <p className="muted small track-order-back">
        <Link href="/" className="muted">
          ← {zhHant.navHome}
        </Link>
      </p>
    </div>
  );
}
