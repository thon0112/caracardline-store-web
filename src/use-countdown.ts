import { useEffect, useMemo, useState } from "react";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True when target is unset/invalid or time has elapsed. */
  done: boolean;
  totalMs: number;
};

function partsFromRemaining(totalMs: number): Omit<CountdownParts, "done"> {
  const clamped = Math.max(0, totalMs);
  const totalSec = Math.floor(clamped / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalMs: clamped,
  };
}

/** Live countdown to an ISO datetime; ticks every second until done. */
export function useCountdown(
  targetIso: string | null | undefined,
): CountdownParts {
  const targetMs = useMemo(() => {
    if (targetIso == null || targetIso === "") return null;
    const t = Date.parse(targetIso);
    return Number.isNaN(t) ? null : t;
  }, [targetIso]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs == null) return;
    if (Date.now() >= targetMs) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (targetMs == null) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true, totalMs: 0 };
  }
  const remaining = targetMs - now;
  if (remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true, totalMs: 0 };
  }
  return { ...partsFromRemaining(remaining), done: false };
}

export function formatCountdown(parts: CountdownParts): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (parts.days > 0) {
    return `${pad(parts.days)}:${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
  }
  return `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
}
