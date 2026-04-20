import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchCart, isNotFoundError, type CartLine } from "./api.js";
import { zhHant } from "./locale/zh-Hant.js";
import { tryToastBadRequest } from "./notify-bad-request.js";
import { useToast } from "./toast-context.js";

const CART_STORAGE_KEY = "sf_cart_id";

export type CartContextValue = {
  cartId: string | null;
  lines: CartLine[];
  /** Total units in cart (sum of line quantities); used for nav badge. */
  cartItemCount: number;
  subtotal: number;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem(CART_STORAGE_KEY),
  );
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem(CART_STORAGE_KEY)),
  );
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    const id = localStorage.getItem(CART_STORAGE_KEY);
    setCartId(id);
    if (!id) {
      setLines([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCart(id);
      setLines(data.items);
    } catch (e) {
      if (isNotFoundError(e)) {
        localStorage.removeItem(CART_STORAGE_KEY);
        setCartId(null);
        setLines([]);
        setError(null);
      } else if (tryToastBadRequest(e, showToast)) {
        setError(null);
      } else {
        setError(
          e instanceof Error ? e.message : zhHant.errCartLoadFailed,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    function onStorage(ev: StorageEvent) {
      if (ev.key === CART_STORAGE_KEY) void refreshCart();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshCart]);

  const cartItemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  );
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity * l.catalog.listPrice, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      cartId,
      lines,
      cartItemCount,
      subtotal,
      loading,
      error,
      refreshCart,
    }),
    [cartId, lines, cartItemCount, subtotal, loading, error, refreshCart],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
