import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDice, faXmark } from "@fortawesome/free-solid-svg-icons";
import { cn } from "../cn.js";
import { zhHant } from "../locale/zh-Hant.js";
import { pokedexOfficialArtworkUrl } from "../pokedex-sprite.js";

const SPIN_DURATION_MS = 1400;
const SPIN_TICK_MS = 70;

export function availablePoolNumbers(
  poolSize: number,
  soldNumbers: ReadonlySet<number>,
  inCartNumbers: ReadonlySet<number>,
): number[] {
  const out: number[] = [];
  for (let n = 1; n <= poolSize; n++) {
    if (soldNumbers.has(n) || inCartNumbers.has(n)) continue;
    out.push(n);
  }
  return out;
}

function pickRandom(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums[Math.floor(Math.random() * nums.length)] ?? null;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Phase = "spinning" | "revealed" | "empty";

export function PoolRandomPickDialog({
  open,
  poolSize,
  soldNumbers,
  inCartNumbers,
  adding,
  onClose,
  onAddToCart,
}: {
  open: boolean;
  poolSize: number;
  soldNumbers: ReadonlySet<number>;
  inCartNumbers: ReadonlySet<number>;
  adding: boolean;
  onClose: () => void;
  onAddToCart: (poolNumber: number) => void | Promise<void>;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const spinTimerRef = useRef<number | null>(null);
  const spinEndRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>("spinning");
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [pickedNumber, setPickedNumber] = useState<number | null>(null);
  const [spinKey, setSpinKey] = useState(0);
  const [spriteFailed, setSpriteFailed] = useState(false);

  const available = availablePoolNumbers(
    poolSize,
    soldNumbers,
    inCartNumbers,
  );
  const spriteUrl =
    displayNumber != null ? pokedexOfficialArtworkUrl(displayNumber) : null;

  useEffect(() => {
    setSpriteFailed(false);
  }, [displayNumber, spinKey]);

  function clearSpinTimers() {
    if (spinTimerRef.current != null) {
      window.clearInterval(spinTimerRef.current);
      spinTimerRef.current = null;
    }
    if (spinEndRef.current != null) {
      window.clearTimeout(spinEndRef.current);
      spinEndRef.current = null;
    }
  }

  function runSpin() {
    clearSpinTimers();
    const pool = availablePoolNumbers(poolSize, soldNumbers, inCartNumbers);
    const final = pickRandom(pool);
    if (final == null) {
      setPhase("empty");
      setDisplayNumber(null);
      setPickedNumber(null);
      return;
    }

    setPickedNumber(final);
    setSpinKey((k) => k + 1);
    setSpriteFailed(false);

    if (prefersReducedMotion() || pool.length === 1) {
      setDisplayNumber(final);
      setPhase("revealed");
      return;
    }

    setPhase("spinning");
    setDisplayNumber(pickRandom(pool));

    spinTimerRef.current = window.setInterval(() => {
      setDisplayNumber(pickRandom(pool));
    }, SPIN_TICK_MS);

    spinEndRef.current = window.setTimeout(() => {
      clearSpinTimers();
      setDisplayNumber(final);
      setPhase("revealed");
    }, SPIN_DURATION_MS);
  }

  useEffect(() => {
    if (!open) {
      clearSpinTimers();
      return;
    }
    runSpin();
    return () => clearSpinTimers();
    // Spin only on open; "再隨機" calls runSpin from the button.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- open-only
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !adding) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adding, onClose, open]);

  if (!open || typeof document === "undefined") return null;

  const busy = phase === "spinning" || adding;
  const canAdd = phase === "revealed" && pickedNumber != null && !adding;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => {
        if (!adding) onClose();
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 animate-[pool-random-backdrop_0.28s_ease-out] bg-[color-mix(in_srgb,var(--fg)_42%,transparent)] backdrop-blur-[2px] motion-reduce:animate-none"
      />

      <div
        className="relative w-full max-w-[22rem] animate-[pool-random-sheet_0.38s_cubic-bezier(0.22,1,0.36,1)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[0_24px_48px_rgba(28,24,21,0.22)] motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(120%_80%_at_50%_-10%,color-mix(in_srgb,var(--accent-fill)_28%,transparent)_0%,transparent_70%)]"
        />

        <button
          ref={closeRef}
          type="button"
          disabled={adding}
          className="absolute right-3 top-3 z-[1] flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={zhHant.productPoolRandomClose}
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
        </button>

        <div className="relative px-5 pb-5 pt-6 text-center">
          <p className="m-0 text-xs font-semibold tracking-[0.14em] text-[var(--accent)]">
            {zhHant.productPoolRandomEyebrow}
          </p>
          <h2
            id={titleId}
            className="m-0 mt-1 text-xl font-bold text-[var(--fg)]"
          >
            {zhHant.productPoolRandomTitle}
          </h2>
          <p className="m-0 mt-2 text-sm text-[var(--muted)]">
            {phase === "empty"
              ? zhHant.productPoolRandomEmpty
              : zhHant.productPoolRandomHint}
          </p>

          <div className="relative mx-auto mt-5 flex h-48 w-44 items-center justify-center">
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 rounded-[1.75rem] border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--media-bg)_70%,var(--card))]",
                phase === "revealed" &&
                  "animate-[pool-pick-ring_0.55s_ease-out] motion-reduce:animate-none",
              )}
            />
            <div
              key={spinKey}
              className={cn(
                "relative flex h-[11.5rem] w-[10.25rem] flex-col items-center justify-center gap-1 rounded-[1.5rem] border-2 border-[var(--accent)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--accent-fill)_18%,var(--card))_0%,var(--card)_55%)] px-2 pb-2 pt-3 shadow-[0_14px_28px_rgba(154,85,48,0.18)]",
                phase === "spinning" &&
                  "animate-[pool-random-pulse_0.7s_ease-in-out_infinite] motion-reduce:animate-none",
                phase === "revealed" &&
                  "animate-[pool-pick-pop_0.4s_cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:animate-none",
              )}
            >
              {phase === "empty" ? (
                <span className="text-lg font-bold text-[var(--muted)]">—</span>
              ) : (
                <>
                  <div className="relative flex h-[6.5rem] w-full items-center justify-center">
                    {spriteUrl && !spriteFailed ? (
                      <img
                        key={`${spinKey}-sprite-${displayNumber}`}
                        src={spriteUrl}
                        alt={
                          displayNumber != null
                            ? zhHant.productPoolRandomPokemonAlt(displayNumber)
                            : ""
                        }
                        draggable={false}
                        loading="eager"
                        decoding="async"
                        onError={() => setSpriteFailed(true)}
                        className={cn(
                          "max-h-full max-w-full object-contain drop-shadow-[0_6px_12px_rgba(28,24,21,0.18)]",
                          phase === "spinning" &&
                            "opacity-75 blur-[0.6px] motion-reduce:blur-0",
                          phase === "revealed" &&
                            "animate-[pool-pick-pop_0.45s_cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:animate-none",
                        )}
                      />
                    ) : null}
                  </div>
                  <span
                    key={`${spinKey}-num-${displayNumber}`}
                    className={cn(
                      "font-bold tabular-nums text-[var(--accent)]",
                      phase === "spinning"
                        ? "text-2xl opacity-80"
                        : "text-3xl",
                    )}
                    aria-live="polite"
                  >
                    {displayNumber != null
                      ? String(displayNumber).padStart(2, "0")
                      : "·"}
                  </span>
                </>
              )}
            </div>
          </div>

          {phase === "revealed" && pickedNumber != null ? (
            <p className="m-0 mt-4 text-sm font-semibold text-[var(--accent)]">
              {zhHant.productPoolRandomResult(pickedNumber)}
            </p>
          ) : phase === "spinning" ? (
            <p className="m-0 mt-4 text-sm text-[var(--muted)]">
              {zhHant.productPoolRandomSpinning}
            </p>
          ) : (
            <div className="mt-4 h-5" aria-hidden />
          )}

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              disabled={!canAdd}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 py-3.5 text-base font-semibold tracking-[0.14em] text-[#222222] hover:bg-[#d4b57d] disabled:cursor-not-allowed disabled:opacity-45"
              onClick={() => {
                if (pickedNumber == null) return;
                void onAddToCart(pickedNumber);
              }}
            >
              {adding ? zhHant.adding : zhHant.addToCart}
            </button>
            <button
              type="button"
              disabled={busy || available.length === 0}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
              onClick={runSpin}
            >
              <FontAwesomeIcon icon={faDice} className="h-3.5 w-3.5" />
              {zhHant.productPoolRandomAgain}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
