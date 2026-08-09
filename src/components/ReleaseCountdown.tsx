import { useEffect, useRef } from "react";
import { cn } from "../cn.js";
import { zhHant } from "../locale/zh-Hant.js";
import { formatCountdown, useCountdown } from "../use-countdown.js";

type ReleaseCountdownProps = {
  releaseAt: string;
  /** Compact for catalog/home cards; prominent for PDP. */
  variant?: "compact" | "prominent";
  className?: string;
  /** Called once when countdown reaches zero (client clock). */
  onReleased?: () => void;
};

export function ReleaseCountdown({
  releaseAt,
  variant = "compact",
  className,
  onReleased,
}: ReleaseCountdownProps) {
  const parts = useCountdown(releaseAt);
  const fired = useRef(false);

  useEffect(() => {
    if (!parts.done || !onReleased || fired.current) return;
    fired.current = true;
    onReleased();
  }, [parts.done, onReleased]);

  if (parts.done) return null;

  const clock = formatCountdown(parts);

  if (variant === "prominent") {
    return (
      <div
        className={cn(
          "mb-4 rounded-xl border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,var(--card))] px-4 py-3",
          className,
        )}
        role="timer"
        aria-live="polite"
        aria-label={zhHant.releaseCountdownAria(clock)}
      >
        <p className="m-0 text-xs font-semibold tracking-wide text-[var(--accent)]">
          {zhHant.releaseCountdownLabel}
        </p>
        <p className="m-0 mt-1 font-mono text-2xl font-bold tabular-nums tracking-wider text-[var(--fg)]">
          {clock}
        </p>
        <p className="m-0 mt-2 text-sm text-[var(--muted)]">
          {zhHant.productNotYetReleased}
        </p>
      </div>
    );
  }

  return (
    <p
      className={cn(
        "m-0 mt-1.5 select-text text-[0.75rem] font-semibold tabular-nums text-[var(--accent)] [-webkit-user-select:text]",
        className,
      )}
      role="timer"
      aria-live="polite"
      aria-label={zhHant.releaseCountdownAria(clock)}
    >
      <span className="font-medium">{zhHant.releaseCountdownLabel}</span>{" "}
      <span className="font-mono tracking-wide">{clock}</span>
    </p>
  );
}

/** Corner badge on catalog/home media; hides itself when release time passes. */
export function ReleaseSoonBadge({
  releaseAt,
  className,
}: {
  releaseAt: string;
  className?: string;
}) {
  const parts = useCountdown(releaseAt);
  if (parts.done) return null;
  return (
    <span
      className={cn(
        "absolute left-2 top-2 z-[1] rounded-md bg-[color-mix(in_srgb,var(--accent)_92%,transparent)] px-[0.45rem] py-0.5 text-xs font-bold leading-snug text-[var(--card)]",
        className,
      )}
      aria-hidden
    >
      {zhHant.productNotYetReleasedShort}
    </span>
  );
}
