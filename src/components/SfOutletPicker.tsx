import { useEffect, useMemo, useState } from "react";
import { zhHant } from "../locale/zh-Hant.js";
import {
  type SfOutlet,
  outletSearchHaystack,
} from "../sf-outlet.js";

const RESULT_CAP = 45;
const MIN_QUERY_CHARS = 2;

type Props = {
  value: SfOutlet | null;
  onChange: (outlet: SfOutlet | null) => void;
};

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
    <div className="sf-outlet-picker">
      {!value && (
        <>
          <div className="form-field">
            <label htmlFor="sf-outlet-search">{zhHant.checkoutSfSearchLabel}</label>
            <input
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
            <p className="error small sf-outlet-load-err">{loadErr}</p>
          ) : (
            <div className="sf-outlet-slot">
              {loading ? (
                <p className="muted small sf-outlet-slot-msg">{zhHant.checkoutSfLoading}</p>
              ) : !queryReady ? (
                <p className="muted small sf-outlet-slot-msg">{zhHant.checkoutSfEmptyQuery}</p>
              ) : matches.length === 0 ? (
                <p className="muted small sf-outlet-slot-msg">{zhHant.checkoutSfNoResults}</p>
              ) : (
                <div className="sf-outlet-results" role="listbox" aria-label={zhHant.checkoutSfSearchLabel}>
                  <ul className="sf-outlet-result-list">
                    {matches.map((o) => (
                        <li key={o.code}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={false}
                            className="sf-outlet-row"
                            onClick={() => onChange(o)}
                          >
                            <span className="sf-outlet-row-code">{o.code}</span>
                            <span className="sf-outlet-row-meta">
                              {o.district} · {o.section} · {o.kind}
                            </span>
                            <span className="sf-outlet-row-addr muted small">{o.address}</span>
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
        <div className="sf-outlet-selected card">
          <div className="sf-outlet-selected-head">
            <p className="sf-outlet-selected-title">{zhHant.checkoutSfSelectedLabel}</p>
            <button type="button" className="linkish-btn" onClick={() => onChange(null)}>
              {zhHant.checkoutSfClear}
            </button>
          </div>
          <p className="sf-outlet-selected-code">{value.code}</p>
          <p className="muted small sf-outlet-selected-lines">
            {value.district} · {value.section} · {value.kind}
          </p>
          <p className="sf-outlet-selected-addr">{value.address}</p>
          <p className="muted small sf-outlet-selected-hours">
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
