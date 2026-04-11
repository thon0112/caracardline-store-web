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
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_MS = 5200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const idRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    const text = message.trim() || "—";
    const id = ++idRef.current;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ id, message: text });
    timeoutRef.current = setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
      timeoutRef.current = null;
    }, TOAST_MS);
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
        <div className="toast-host" aria-live="polite">
          <div role="alert" className="toast">
            <p className="toast-message">{toast.message}</p>
            <button
              type="button"
              className="toast-dismiss"
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
