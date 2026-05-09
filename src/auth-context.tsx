import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  claimCart,
  fetchSessionUser,
  getGoogleAuthStartUrl,
  logoutSession,
  type SessionUser,
} from "./api.js";

const CART_STORAGE_KEY = "sf_cart_id";

export type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  startGoogleLogin: (nextPath?: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const u = await fetchSessionUser();
      setUser(u);
      if (u) {
        const cartId = localStorage.getItem(CART_STORAGE_KEY);
        if (cartId) {
          try {
            const { cartId: nextId } = await claimCart(cartId);
            if (nextId !== cartId) {
              localStorage.setItem(CART_STORAGE_KEY, nextId);
            }
            window.dispatchEvent(new Event("sf-cart-storage"));
          } catch {
            /* claim is best-effort */
          }
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await logoutSession();
    setUser(null);
  }, []);

  const startGoogleLogin = useCallback((nextPath?: string) => {
    window.location.href = getGoogleAuthStartUrl(nextPath);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      logout,
      startGoogleLogin,
    }),
    [user, loading, refresh, logout, startGoogleLogin],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
