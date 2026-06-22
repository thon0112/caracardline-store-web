import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBriefcase,
  faCartShopping,
  faHouse,
  faScrewdriverWrench,
  faTableCells,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  faThreads,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Link, useLocation } from "wouter";
import { cn } from "../cn.js";
import { useAuth } from "../auth-context.js";
import { useCart } from "../cart-context.js";
import {
  CATALOG_PRODUCT_TYPE_CODES,
  displayProductType,
  zhHant,
} from "../locale/zh-Hant.js";
import { BRAND_NAME } from "../site-seo.js";
import { WHATSAPP_CHAT_URL } from "./WhatsAppFloat.js";
import {
  HeaderSearchDesktop,
  HeaderSearchMobile,
  HeaderSearchProvider,
} from "./HeaderSearch.js";

const THREADS_URL = "https://www.threads.com/@cara.cardline";

function HeaderIcon({
  icon,
  size = 22,
  className,
}: {
  icon: IconDefinition;
  size?: number;
  className?: string;
}) {
  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      style={{ fontSize: size, width: "1em", height: "1em", display: "block" }}
      aria-hidden
    />
  );
}

const borderHover =
  "hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]";

export function SiteHeader() {
  const { user, loading: authLoading, startGoogleLogin } = useAuth();
  const { cartItemCount } = useCart();
  const [loc] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerId = useId();
  const catalogNavRef = useRef<HTMLDivElement>(null);
  const [catalogSubmenuDismissed, setCatalogSubmenuDismissed] = useState(false);
  const servicesNavRef = useRef<HTMLDivElement>(null);
  const [servicesSubmenuDismissed, setServicesSubmenuDismissed] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);

  const clearCatalogSubmenuDismissed = useCallback(() => {
    setCatalogSubmenuDismissed(false);
  }, []);

  const dismissCatalogSubmenu = useCallback(() => {
    setCatalogSubmenuDismissed(true);
    const root = catalogNavRef.current;
    const ae = document.activeElement;
    if (root && ae instanceof HTMLElement && root.contains(ae)) {
      ae.blur();
    }
  }, []);

  const clearServicesSubmenuDismissed = useCallback(() => {
    setServicesSubmenuDismissed(false);
  }, []);

  const dismissServicesSubmenu = useCallback(() => {
    setServicesSubmenuDismissed(true);
    const root = servicesNavRef.current;
    const ae = document.activeElement;
    if (root && ae instanceof HTMLElement && root.contains(ae)) {
      ae.blur();
    }
  }, []);

  useEffect(() => {
    closeMenu();
  }, [loc, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const closeIfDesktop = () => {
      if (mq.matches) setMenuOpen(false);
    };
    closeIfDesktop();
    mq.addEventListener("change", closeIfDesktop);
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, []);

  const showGoogleLogin = !authLoading && !user;
  const profileActionLabel = showGoogleLogin
    ? zhHant.navLoginGoogle
    : zhHant.navAccount;

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50 mb-4 select-none border-b border-[var(--border)] bg-[var(--bg)] pb-2 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]",
      )}
    >
      <HeaderSearchProvider>
      <div className="relative z-[2] flex min-h-10 w-full cursor-default items-center gap-3 max-[767px]:justify-start md:gap-4">
        <button
          type="button"
          className={cn(
            "hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-0 font-inherit text-[var(--fg)] max-[767px]:inline-flex",
            borderHover,
            "hover:text-[var(--accent)]",
          )}
          aria-expanded={menuOpen}
          aria-controls={drawerId}
          aria-label={menuOpen ? zhHant.navMenuClose : zhHant.navMenuOpen}
          onClick={toggleMenu}
        >
          <HeaderIcon icon={faBars} size={22} />
        </button>
        <div className="flex min-w-0 cursor-default items-center max-[767px]:flex-1 max-[767px]:justify-center">
          <Link
            href="/"
            className={cn(
              "inline-flex min-w-0 cursor-pointer items-center gap-[0.65rem] select-none font-bold tracking-[0.04em] text-[var(--fg)] no-underline caret-transparent",
            )}
          >
            <img
              className="block h-auto w-[145px] md:w-[170px] shrink object-contain"
              src="https://cdn.caracardline.com/assets/logo-with-text.webp"
              alt={BRAND_NAME}
              width={1200}
              height={360}
              decoding="async"
            />
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <HeaderSearchMobile />
          <Link
            href="/cart"
            className={cn(
              "relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-0 leading-none text-[var(--fg)] no-underline select-none caret-transparent",
              borderHover,
              "hover:text-[var(--accent)]",
            )}
          aria-label={
            cartItemCount > 0
              ? `${zhHant.navCart}，${
                  cartItemCount === 1
                    ? zhHant.cartItemOne
                    : zhHant.cartItemsMany(cartItemCount)
                }`
              : zhHant.navCart
          }
          title={zhHant.navCart}
        >
          <span className="inline-flex items-center justify-center" aria-hidden>
            <HeaderIcon icon={faCartShopping} size={22} />
          </span>
          {cartItemCount > 0 ? (
            <span className="absolute right-[0.1rem] top-[0.1rem] min-w-[1.05rem] translate-x-[35%] translate-y-[-35%] rounded-full bg-[var(--accent-fill)] px-[0.28rem] text-center text-[0.65rem] font-bold leading-[1.05rem] text-[var(--on-accent-fill)] shadow-[0_0_0_2px_var(--card)]">
              {cartItemCount}
            </span>
          ) : null}
          </Link>
        </div>
        <div className="ml-auto hidden min-h-10 items-center gap-3 md:flex">
          <HeaderSearchDesktop />
          <nav
            className="flex min-h-10 items-center gap-3"
            aria-label={zhHant.navSiteAria}
          >
          <div
            ref={catalogNavRef}
            data-dismissed={catalogSubmenuDismissed ? "true" : undefined}
            className="group/catalog relative inline-flex items-stretch self-stretch"
            onMouseLeave={clearCatalogSubmenuDismissed}
          >
            <Link
              href="/catalog"
              className="inline-flex h-full select-none items-center self-center gap-1 whitespace-nowrap font-semibold leading-tight text-[var(--fg)] no-underline caret-transparent hover:text-[var(--accent)]"
              aria-haspopup="true"
              onMouseEnter={clearCatalogSubmenuDismissed}
              onFocus={clearCatalogSubmenuDismissed}
            >
              {zhHant.navCatalog}
            </Link>
            <div
              className={cn(
                "pointer-events-none invisible absolute left-1/2 top-[100%] z-[60] min-w-[11.5rem] -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--card)] py-[0.35rem] opacity-0 shadow-[0_10px_28px_rgba(28,24,21,0.12)] transition-[opacity,visibility] duration-150 ease-out before:pointer-events-none before:absolute before:bottom-full before:left-0 before:right-0 before:h-[0.45rem] before:content-['']",
                "group-hover/catalog:pointer-events-auto group-hover/catalog:visible group-hover/catalog:opacity-100",
                "group-focus-within/catalog:pointer-events-auto group-focus-within/catalog:visible group-focus-within/catalog:opacity-100",
                "group-data-[dismissed=true]/catalog:pointer-events-none group-data-[dismissed=true]/catalog:invisible group-data-[dismissed=true]/catalog:opacity-0",
                "motion-reduce:transition-none",
              )}
              role="group"
              aria-label={zhHant.navCatalogSubAria}
            >
              <ul className="m-0 list-none p-0">
                {CATALOG_PRODUCT_TYPE_CODES.map((code) => (
                  <li key={code} className="m-0 p-0">
                    <Link
                      href={`/catalog/${encodeURIComponent(code)}`}
                      className="flex whitespace-nowrap px-4 py-[0.55rem] text-[0.9375rem] font-semibold leading-snug text-[var(--muted)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
                      onClick={dismissCatalogSubmenu}
                    >
                      {displayProductType(code)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link
            href="/card-repair"
            className="inline-flex select-none items-center gap-1 whitespace-nowrap font-semibold leading-tight text-[var(--fg)] no-underline caret-transparent hover:text-[var(--accent)]"
          >
            {zhHant.navCardRepair}
          </Link>
          <div
            ref={servicesNavRef}
            data-dismissed={servicesSubmenuDismissed ? "true" : undefined}
            className="group/services relative inline-flex items-stretch self-stretch"
            onMouseLeave={clearServicesSubmenuDismissed}
          >
            <Link
              href="/services"
              className="inline-flex h-full select-none items-center self-center gap-1 whitespace-nowrap font-semibold leading-tight text-[var(--fg)] no-underline caret-transparent hover:text-[var(--accent)]"
              aria-haspopup="true"
              onMouseEnter={clearServicesSubmenuDismissed}
              onFocus={clearServicesSubmenuDismissed}
            >
              {zhHant.navOtherServices}
            </Link>
            <div
              className={cn(
                "pointer-events-none invisible absolute left-1/2 top-[100%] z-[60] min-w-[11.5rem] -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--card)] py-[0.35rem] opacity-0 shadow-[0_10px_28px_rgba(28,24,21,0.12)] transition-[opacity,visibility] duration-150 ease-out before:pointer-events-none before:absolute before:bottom-full before:left-0 before:right-0 before:h-[0.45rem] before:content-['']",
                "group-hover/services:pointer-events-auto group-hover/services:visible group-hover/services:opacity-100",
                "group-focus-within/services:pointer-events-auto group-focus-within/services:visible group-focus-within/services:opacity-100",
                "group-data-[dismissed=true]/services:pointer-events-none group-data-[dismissed=true]/services:invisible group-data-[dismissed=true]/services:opacity-0",
                "motion-reduce:transition-none",
              )}
              role="group"
              aria-label={zhHant.navServicesSubAria}
            >
              <ul className="m-0 list-none p-0">
                <li className="m-0 p-0">
                  <Link
                    href="/track"
                    className="flex whitespace-nowrap px-4 py-[0.55rem] text-[0.9375rem] font-semibold leading-snug text-[var(--muted)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
                    onClick={dismissServicesSubmenu}
                  >
                    {zhHant.navTrackOrder}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {showGoogleLogin ? (
            <button
              type="button"
              className={cn(
                "inline-flex cursor-pointer select-none items-center justify-center rounded-[10px] p-[0.35rem] text-[var(--fg)]",
                "hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]",
              )}
              onClick={() => startGoogleLogin("/account")}
              aria-label={profileActionLabel}
              title={profileActionLabel}
            >
              <span
                className="inline-flex items-center justify-center"
                aria-hidden
              >
                <HeaderIcon icon={faUser} size={22} />
              </span>
            </button>
          ) : (
            <Link
              href="/account"
              className={cn(
                "inline-flex select-none items-center justify-center rounded-[10px] p-[0.35rem] text-[var(--fg)] no-underline caret-transparent",
                "hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]",
              )}
              aria-label={profileActionLabel}
              title={profileActionLabel}
            >
              <span
                className="inline-flex items-center justify-center"
                aria-hidden
              >
                <HeaderIcon icon={faUser} size={20} />
              </span>
            </Link>
          )}
          <Link
            href="/cart"
            className={cn(
              "relative inline-flex select-none items-center justify-center rounded-[10px] p-[0.35rem] text-[var(--fg)] no-underline caret-transparent",
              "hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]",
            )}
            aria-label={
              cartItemCount > 0
                ? `${zhHant.navCart}，${
                    cartItemCount === 1
                      ? zhHant.cartItemOne
                      : zhHant.cartItemsMany(cartItemCount)
                  }`
                : zhHant.navCart
            }
            title={zhHant.navCart}
          >
            <span
              className="inline-flex items-center justify-center"
              aria-hidden
            >
              <HeaderIcon icon={faCartShopping} size={22} />
            </span>
            {cartItemCount > 0 ? (
              <span className="absolute right-[0.1rem] top-[0.1rem] min-w-[1.05rem] translate-x-[35%] translate-y-[-35%] rounded-full bg-[var(--accent-fill)] px-[0.28rem] text-center text-[0.65rem] font-bold leading-[1.05rem] text-[var(--on-accent-fill)] shadow-[0_0_0_2px_var(--card)]">
                {cartItemCount}
              </span>
            ) : null}
          </Link>
          </nav>
        </div>
      </div>

      <button
        type="button"
        className={cn(
          "fixed inset-0 z-[1] m-0 cursor-pointer appearance-none border-none bg-[rgba(28,24,21,0.35)] p-0 text-[length:0] text-transparent opacity-0 transition-opacity duration-[220ms] ease-out motion-reduce:transition-none md:hidden",
          menuOpen
            ? "pointer-events-auto z-[100] opacity-100"
            : "pointer-events-none",
        )}
        aria-label={zhHant.navDrawerClose}
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
      />

      <div
        id={drawerId}
        className={cn(
          "fixed bottom-0 left-0 top-0 z-[1] flex w-[min(17.5rem,86vw)] max-w-full -translate-x-[102%] flex-col border-r border-[var(--border)] bg-[var(--card)] py-[0.85rem] pl-[max(0.85rem,env(safe-area-inset-left,0px))] pr-0 pt-[max(0.85rem,env(safe-area-inset-top,0px))] shadow-[8px_0_32px_rgba(28,24,21,0.12)] transition-transform duration-[260ms] motion-reduce:transition-none md:hidden",
          menuOpen ? "z-[101] translate-x-0" : "",
        )}
        role="dialog"
        aria-modal={menuOpen}
        aria-label={zhHant.navDrawerAria}
        inert={!menuOpen ? "" : undefined}
      >
        <div className="mb-1 flex w-full items-center gap-3 border-b border-[var(--border)] px-[0.65rem] pb-[0.85rem]">
          <span className="min-w-0 flex-1 text-[0.8125rem] font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
            {zhHant.navDrawerAria}
          </span>
          <button
            type="button"
            className="ml-auto inline-flex h-[2.35rem] w-[2.35rem] shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent p-0 font-inherit leading-none text-[var(--muted)] hover:bg-[rgba(28,24,21,0.06)] hover:text-[var(--fg)]"
            aria-label={zhHant.navDrawerClose}
            onClick={closeMenu}
          >
            <HeaderIcon icon={faXmark} size={22} />
          </button>
        </div>
        <nav
          className="flex min-h-0 flex-1 flex-col gap-[0.15rem] overflow-y-auto px-[0.35rem] py-[0.35rem] pb-2"
          aria-label={zhHant.navSiteAria}
        >
          <Link
            href="/"
            className="group/drawer flex cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-base font-semibold text-[var(--fg)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
            onClick={closeMenu}
          >
            <span
              className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
              aria-hidden
            >
              <HeaderIcon icon={faHouse} size={20} />
            </span>
            <span className="min-w-0 flex-1">{zhHant.navHome}</span>
          </Link>
          <div className="flex flex-col gap-[0.05rem]">
            <Link
              href="/catalog"
              className="group/drawer flex cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-base font-semibold text-[var(--fg)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
              onClick={closeMenu}
            >
              <span
                className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
                aria-hidden
              >
                <HeaderIcon icon={faTableCells} size={20} />
              </span>
              <span className="min-w-0 flex-1">{zhHant.navCatalog}</span>
            </Link>
            <ul
              className="m-0 mb-[0.1rem] list-none p-0"
              aria-label={zhHant.navCatalogSubAria}
            >
              {CATALOG_PRODUCT_TYPE_CODES.map((code) => (
                <li key={code} className="m-0 p-0">
                  <Link
                    href={`/catalog/${encodeURIComponent(code)}`}
                    className="flex cursor-pointer items-center rounded-[10px] py-[0.55rem] pl-[2.55rem] pr-[0.85rem] text-[0.9375rem] font-semibold leading-snug text-[var(--muted)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
                    onClick={closeMenu}
                  >
                    {displayProductType(code)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/card-repair"
            className="group/drawer flex cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-base font-semibold text-[var(--fg)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
            onClick={closeMenu}
          >
            <span
              className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
              aria-hidden
            >
              <HeaderIcon icon={faScrewdriverWrench} size={20} />
            </span>
            <span className="min-w-0 flex-1">{zhHant.navCardRepair}</span>
          </Link>
          <div className="flex flex-col gap-[0.05rem]">
            <Link
              href="/services"
              className="group/drawer flex cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-base font-semibold text-[var(--fg)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
              onClick={closeMenu}
            >
              <span
                className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
                aria-hidden
              >
                <HeaderIcon icon={faBriefcase} size={20} />
              </span>
              <span className="min-w-0 flex-1">{zhHant.navOtherServices}</span>
            </Link>
            <ul
              className="m-0 mb-[0.1rem] list-none p-0"
              aria-label={zhHant.navServicesSubAria}
            >
              <li className="m-0 p-0">
                <Link
                  href="/track"
                  className="flex cursor-pointer items-center rounded-[10px] py-[0.55rem] pl-[2.55rem] pr-[0.85rem] text-[0.9375rem] font-semibold leading-snug text-[var(--muted)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
                  onClick={closeMenu}
                >
                  {zhHant.navTrackOrder}
                </Link>
              </li>
            </ul>
          </div>
          {showGoogleLogin ? (
            <button
              type="button"
              className="group/drawer flex w-full cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-left text-base font-semibold text-[var(--fg)] hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
              onClick={() => {
                closeMenu();
                startGoogleLogin("/account");
              }}
              aria-label={profileActionLabel}
            >
              <span
                className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
                aria-hidden
              >
                <HeaderIcon icon={faUser} size={20} />
              </span>
              <span className="min-w-0 flex-1">{profileActionLabel}</span>
            </button>
          ) : (
            <Link
              href="/account"
              className="group/drawer flex cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-base font-semibold text-[var(--fg)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
              onClick={closeMenu}
              aria-label={profileActionLabel}
            >
              <span
                className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
                aria-hidden
              >
                <HeaderIcon icon={faUser} size={20} />
              </span>
              <span className="min-w-0 flex-1">{profileActionLabel}</span>
            </Link>
          )}
          <Link
            href="/cart"
            className="group/drawer flex cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-base font-semibold text-[var(--fg)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
            onClick={closeMenu}
          >
            <span
              className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
              aria-hidden
            >
              <HeaderIcon icon={faCartShopping} size={20} />
            </span>
            <span className="min-w-0 flex-1">{zhHant.navCart}</span>
            {cartItemCount > 0 ? (
              <span className="ml-auto shrink-0 rounded-full bg-[var(--accent-fill)] px-[0.35rem] text-center text-xs font-bold leading-5 text-[var(--on-accent-fill)]">
                {cartItemCount}
              </span>
            ) : null}
          </Link>
        </nav>
        <div
          className="mt-auto border-t border-[var(--border)] px-[0.65rem] pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-[0.85rem]"
          role="region"
          aria-label={zhHant.footerContact}
        >
          <p className="m-0 mb-[0.65rem] text-[0.8125rem] font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
            {zhHant.footerContact}
          </p>
          <div className="flex flex-wrap items-center gap-[0.35rem]">
<a
              href={WHATSAPP_CHAT_URL}
              className="inline-flex cursor-pointer items-center justify-center rounded-[10px] p-[0.65rem] leading-none text-[var(--muted)] no-underline select-none caret-transparent hover:bg-[rgba(28,24,21,0.05)] hover:text-[#25d366]"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={zhHant.floatWhatsAppAria}
              title={zhHant.floatWhatsAppTitle}
              onClick={closeMenu}
            >
              <span
                className="inline-flex items-center justify-center"
                aria-hidden
              >
                <HeaderIcon icon={faWhatsapp} size={22} />
              </span>
            </a>
            <a
              href={THREADS_URL}
              className="inline-flex cursor-pointer items-center justify-center rounded-[10px] p-[0.65rem] leading-none text-[var(--muted)] no-underline select-none caret-transparent hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={zhHant.navThreadsAria}
              title={zhHant.navThreads}
              onClick={closeMenu}
            >
              <span
                className="inline-flex items-center justify-center"
                aria-hidden
              >
                <HeaderIcon icon={faThreads} size={22} />
              </span>
            </a>
          </div>
        </div>
      </div>
      </HeaderSearchProvider>
    </header>
  );
}
