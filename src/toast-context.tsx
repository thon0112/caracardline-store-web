import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const toastDismissAria = "關閉提示";

type ToastItem = { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Default auto-dismiss for general toasts (errors, API messages). */
export const TOAST_DURATION_DEFAULT_MS = 5200;
/** Brief confirmation toasts (e.g. add to cart). */
export const TOAST_DURATION_SHORT_MS = 1000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const idRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, durationMs = TOAST_DURATION_DEFAULT_MS) => {
    const text = message.trim() || "—";
    const id = ++idRef.current;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ id, message: text });
    timeoutRef.current = setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
      timeoutRef.current = null;
    }, durationMs);
  }, []);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          className="pointer-events-none fixed left-1/2 top-[max(1rem,calc(env(safe-area-inset-top,0px)+0.65rem))] z-[9999] max-w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2"
          aria-live="polite"
        >
          <div
            role="alert"
            className="pointer-events-auto flex animate-[toast-in_0.22s_ease-out] items-start gap-3 rounded-xl border-none bg-[var(--accent-fill)] p-4 pr-[1.15rem] shadow-[0_10px_32px_rgba(28,24,21,0.2)] motion-reduce:animate-none"
          >
            <p className="m-0 flex-1 text-[1.0625rem] font-semibold leading-snug tracking-[0.01em] text-[var(--on-accent-fill)]">
              {toast.message}
            </p>
            <button
              type="button"
              className="-my-[0.15rem] -mr-1 ml-0 h-8 w-8 shrink-0 cursor-pointer rounded-lg border-none bg-transparent p-0 font-inherit text-[1.45rem] leading-none text-[color-mix(in_srgb,var(--on-accent-fill)_72%,transparent)] hover:bg-[rgba(255,253,251,0.18)] hover:text-[var(--on-accent-fill)]"
              onClick={dismiss}
              aria-label={toastDismissAria}
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
