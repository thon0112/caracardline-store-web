import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useSearchParams } from "wouter";
import { trackSearch } from "../analytics.js";
import {
  buildCatalogSearchLocation,
  currentCatalogSearchLocation,
  isCatalogPath,
  normalizeCatalogSearchQ,
} from "../catalog-search.js";
import { cn } from "../cn.js";
import { zhHant } from "../locale/zh-Hant.js";
import { CatalogSearchField } from "./CatalogSearchField.js";

type HeaderSearchContextValue = {
  draft: string;
  setDraft: (value: string) => void;
  submit: () => void;
  clear: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  mobileInputRef: React.RefObject<HTMLInputElement | null>;
  desktopInputRef: React.RefObject<HTMLInputElement | null>;
  mobileFieldId: string;
  desktopFieldId: string;
};

const HeaderSearchContext = createContext<HeaderSearchContextValue | null>(
  null,
);

function useHeaderSearchContext(): HeaderSearchContextValue {
  const ctx = useContext(HeaderSearchContext);
  if (!ctx) {
    throw new Error("HeaderSearch components must be used within HeaderSearchProvider");
  }
  return ctx;
}

function HeaderIcon({
  icon,
  size = 20,
}: {
  icon: typeof faMagnifyingGlass;
  size?: number;
}) {
  return (
    <FontAwesomeIcon
      icon={icon}
      style={{ fontSize: size, width: "1em", height: "1em", display: "block" }}
      aria-hidden
    />
  );
}

function useHeaderSearchState(): HeaderSearchContextValue {
  const [pathname, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const onCatalog = isCatalogPath(pathname);
  const qFromUrl = onCatalog
    ? normalizeCatalogSearchQ(searchParams.get("q"))
    : "";

  const [draft, setDraft] = useState(qFromUrl);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileFieldId = useId();
  const desktopFieldId = useId();

  useEffect(() => {
    if (onCatalog) setDraft(qFromUrl);
  }, [onCatalog, qFromUrl]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const t = window.setTimeout(() => mobileInputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [mobileOpen]);

  const submit = useCallback(() => {
    const term = normalizeCatalogSearchQ(draft);
    const target = buildCatalogSearchLocation(
      term,
      pathname,
      onCatalog ? searchParams : undefined,
    );
    if (target === currentCatalogSearchLocation()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMobileOpen(false);
      return;
    }
    if (term) trackSearch(term);
    setLocation(target);
    setMobileOpen(false);
  }, [draft, pathname, onCatalog, searchParams, setLocation]);

  const clear = useCallback(() => {
    setDraft("");
    const target = buildCatalogSearchLocation(
      "",
      pathname,
      onCatalog ? searchParams : undefined,
    );
    if (target !== currentCatalogSearchLocation()) {
      setLocation(target);
    }
    setMobileOpen(false);
  }, [pathname, onCatalog, searchParams, setLocation]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target;
      if (
        el instanceof HTMLElement &&
        (el.isContentEditable ||
          el.closest("input, textarea, select, [contenteditable='true']"))
      ) {
        return;
      }
      e.preventDefault();
      if (window.matchMedia("(min-width: 768px)").matches) {
        desktopInputRef.current?.focus();
      } else {
        setMobileOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    draft,
    setDraft,
    submit,
    clear,
    mobileOpen,
    setMobileOpen,
    mobileInputRef,
    desktopInputRef,
    mobileFieldId,
    desktopFieldId,
  };
}

export function HeaderSearchProvider({ children }: { children: ReactNode }) {
  const value = useHeaderSearchState();
  return (
    <HeaderSearchContext.Provider value={value}>
      {children}
    </HeaderSearchContext.Provider>
  );
}

const borderHover =
  "hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]";

export function HeaderSearchMobile() {
  const {
    draft,
    setDraft,
    submit,
    clear,
    mobileOpen,
    setMobileOpen,
    mobileInputRef,
    mobileFieldId,
  } = useHeaderSearchContext();

  return (
    <>
      <button
        type="button"
        className={cn(
          "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-0 font-inherit text-[var(--fg)] md:hidden",
          borderHover,
          "hover:text-[var(--accent)]",
        )}
        aria-expanded={mobileOpen}
        aria-controls="header-search-mobile-panel"
        aria-label={mobileOpen ? zhHant.navSearchClose : zhHant.navSearchOpen}
        onClick={() => setMobileOpen((o) => !o)}
      >
        <HeaderIcon icon={mobileOpen ? faXmark : faMagnifyingGlass} size={20} />
      </button>

      {mobileOpen ? (
        <div
          id="header-search-mobile-panel"
          className="absolute left-0 right-0 top-full z-[55] border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 shadow-[0_8px_20px_rgba(28,24,21,0.08)] md:hidden"
        >
          <CatalogSearchField
            id={mobileFieldId}
            variant="compact"
            showLabel={false}
            value={draft}
            onChange={setDraft}
            onSubmit={submit}
            onClear={draft.trim() ? clear : undefined}
            inputRef={mobileInputRef}
            autoFocus
          />
        </div>
      ) : null}
    </>
  );
}

export function HeaderSearchDesktop() {
  const {
    draft,
    setDraft,
    submit,
    clear,
    desktopInputRef,
    desktopFieldId,
  } = useHeaderSearchContext();

  return (
    <div
      className="hidden w-[15rem] shrink-0 md:block xl:w-[20rem]"
 
      role="search"
      aria-label={zhHant.catalogSearchLabel}
    >
      <CatalogSearchField
        id={desktopFieldId}
        variant="compact"
        showLabel={false}
        value={draft}
        onChange={setDraft}
        onSubmit={submit}
        onClear={draft.trim() ? clear : undefined}
        inputRef={desktopInputRef}
      />
    </div>
  );
}

/** @deprecated Use HeaderSearchProvider + HeaderSearchMobile/Desktop in SiteHeader. */
export function HeaderSearch() {
  return (
    <HeaderSearchProvider>
      <HeaderSearchMobile />
      <HeaderSearchDesktop />
    </HeaderSearchProvider>
  );
}
