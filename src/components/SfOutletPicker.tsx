import { useEffect, useMemo, useState } from "react";
import { zhHant } from "../locale/zh-Hant.js";
import { type SfOutlet, outletSearchHaystack } from "../sf-outlet.js";

const RESULT_CAP = 45;
const MIN_QUERY_CHARS = 0;

type Props = {
  value: SfOutlet | null;
  onChange: (outlet: SfOutlet | null) => void;
};

const fieldLabel = "mb-[0.35rem] block text-sm font-semibold";
const fieldInput =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-[0.65rem] py-2 font-inherit text-base text-[var(--fg)]";

export function SfOutletPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<SfOutlet[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadErr(null);
    void import("../../config/sf-outlets.json")
      .then((mod) => {
        if (cancelled) return;
        const rows = mod.default as SfOutlet[];
        setCatalog(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadErr(zhHant.checkoutSfLoadFailed);
          setCatalog([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmedQuery = query.trim();
  const queryReady = trimmedQuery.length >= MIN_QUERY_CHARS;
  const ready = catalog !== null;
  const loading = !ready && !loadErr;

  const matches = useMemo(() => {
    if (!catalog || !queryReady) return [];
    const needle = trimmedQuery.toLowerCase();
    const out: SfOutlet[] = [];
    for (const o of catalog) {
      const hay = outletSearchHaystack(o);
      if (hay.toLowerCase().includes(needle)) {
        out.push(o);
        if (out.length >= RESULT_CAP) break;
      }
    }
    return out;
  }, [catalog, trimmedQuery]);

  return (
    <div className="grid max-w-[28rem] gap-3">
      {!value && (
        <>
          <div className="min-w-0">
            <label className={fieldLabel} htmlFor="sf-outlet-search">
              {zhHant.checkoutSfSearchLabel}
            </label>
            <input
              className={fieldInput}
              id="sf-outlet-search"
              name="sfOutletSearch"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder={zhHant.checkoutSfSearchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={120}
              disabled={loading || Boolean(loadErr)}
              aria-busy={loading}
            />
          </div>

          {loadErr ? (
            <p className="m-0 text-sm leading-snug text-[var(--err)]">{loadErr}</p>
          ) : (
            <div className="box-border flex min-h-[12rem] flex-col">
              {loading ? (
                <p className="m-0 text-sm leading-snug text-[var(--muted)]">{zhHant.checkoutSfLoading}</p>
              ) : !queryReady ? (
                <p className="m-0 max-w-full text-sm leading-snug text-[var(--muted)]">
                  {zhHant.checkoutSfEmptyQuery}
                </p>
              ) : matches.length === 0 ? (
                <p className="m-0 max-w-full text-sm leading-snug text-[var(--muted)]">
                  {zhHant.checkoutSfNoResults}
                </p>
              ) : (
                <div
                  className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-[var(--border)]"
                  role="listbox"
                  aria-label={zhHant.checkoutSfSearchLabel}
                >
                  <ul className="m-0 max-h-[min(42vh,22rem)] list-none overflow-y-auto overscroll-contain p-0">
                    {matches.map((o) => (
                      <li key={o.code} className="m-0 border-b border-[var(--border)] p-0 last:border-b-0">
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          className="w-full cursor-pointer border-none bg-transparent px-3 py-2.5 text-left font-inherit hover:bg-[rgba(28,24,21,0.04)]"
                          onClick={() => onChange(o)}
                        >
                          <span className="block text-[0.8125rem] font-semibold text-[var(--accent)]">
                            {o.code}
                          </span>
                          <span className="mt-0.5 block text-[0.8125rem] text-[var(--muted)]">
                            {o.district}
                          </span>
                          {o.name ? (
                            <span className="mt-1 block text-sm font-semibold text-[var(--fg)]">{o.name}</span>
                          ) : null}
                          <span className="mt-1 block text-sm text-[var(--muted)]">{o.address}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {value && (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="m-0 text-sm font-semibold text-[var(--muted)]">{zhHant.checkoutSfSelectedLabel}</p>
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent p-0 font-inherit text-sm font-semibold text-[var(--accent)] underline"
              onClick={() => onChange(null)}
            >
              {zhHant.checkoutSfClear}
            </button>
          </div>
          <p className="m-0 text-lg font-bold text-[var(--accent)]">{value.code}</p>
          <p className="m-0 mt-1 text-sm text-[var(--muted)]">
            {value.district}
          </p>
          {value.name ? <p className="m-0 mt-2 font-semibold text-[var(--fg)]">{value.name}</p> : null}
          <p className="m-0 mt-1 text-[0.9375rem] leading-snug text-[var(--fg)]">{value.address}</p>
          <p className="m-0 mt-2 text-sm leading-snug text-[var(--muted)]">
            {zhHant.checkoutSfHoursWeekday}
            {value.hoursWeekday}
            <br />
            {zhHant.checkoutSfHoursSun}
            {value.hoursSunHoliday}
          </p>
        </div>
      )}
    </div>
  );
}
