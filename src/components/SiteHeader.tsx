import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "../cn.js";
import { useCart } from "../cart-context.js";
import {
  CATALOG_PRODUCT_TYPE_CODES,
  displayProductType,
  zhHant,
} from "../locale/zh-Hant.js";

function IconHamburger() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={22}
      height={22}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4 7a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1zm0 5a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1zm0 5a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1z"
      />
    </svg>
  );
}

function IconInstagram({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm5.25-3.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z"
      />
    </svg>
  );
}

function IconHome({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"
      />
    </svg>
  );
}

function IconCatalog({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
      />
    </svg>
  );
}

function IconOrderLookup({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-8-7h6v2H10v-2zm0-4h6v2H10V9z"
      />
    </svg>
  );
}

function IconOtherServices({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm10 14H4V9h16v10z"
      />
    </svg>
  );
}

function IconCart({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>
  );
}

function IconClose({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 101.41 1.42L12 13.41l4.89 4.9a1 1 0 001.42-1.41L13.41 12l4.9-4.89a1 1 0 000-1.4z"
      />
    </svg>
  );
}

const borderHover =
  "hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]";

export function SiteHeader() {
  const { cartItemCount } = useCart();
  const [loc] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerId = useId();
  const catalogNavRef = useRef<HTMLDivElement>(null);
  const [catalogSubmenuDismissed, setCatalogSubmenuDismissed] = useState(false);

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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mb-8 select-none border-b border-[var(--border)] bg-[var(--bg)] pb-2 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]",
      )}
    >
      <div className="relative z-[2] flex min-h-10 cursor-default items-center justify-between gap-4 max-[767px]:justify-start">
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
          <IconHamburger />
        </button>
        <div className="flex min-w-0 cursor-default items-center max-[767px]:flex-1 max-[767px]:justify-center">
          <Link
            href="/"
            className={cn(
              "inline-flex min-w-0 cursor-pointer items-center gap-[0.65rem] select-none font-bold tracking-[0.04em] text-[var(--fg)] no-underline caret-transparent",
            )}
            aria-label={zhHant.navHome}
          >
            <img
              className="block h-[3.2rem] w-auto max-w-[min(16.5rem,69vw)] shrink object-contain"
              src="https://cdn.caracardline.com/assets/logo-with-text.webp"
              alt=""
              width={1200}
              height={360}
              decoding="async"
            />
          </Link>
        </div>
        <Link
          href="/cart"
          className={cn(
            "relative ml-auto hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-0 leading-none text-[var(--fg)] no-underline select-none caret-transparent max-[767px]:inline-flex",
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
            <IconCart size={22} />
          </span>
          {cartItemCount > 0 ? (
            <span className="absolute right-[0.1rem] top-[0.1rem] min-w-[1.05rem] translate-x-[35%] translate-y-[-35%] rounded-full bg-[var(--accent-fill)] px-[0.28rem] text-center text-[0.65rem] font-bold leading-[1.05rem] text-[var(--on-accent-fill)] shadow-[0_0_0_2px_var(--card)]">
              {cartItemCount}
            </span>
          ) : null}
        </Link>
        <nav
          className="hidden min-h-10 items-center gap-3 md:flex"
          aria-label={zhHant.navSiteAria}
        >
          <a
            href="https://www.instagram.com/cara.cardline/"
            className={cn(
              "inline-flex select-none items-center gap-1 rounded-[10px] p-[0.35rem] font-semibold leading-none text-[var(--fg)] no-underline caret-transparent hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]",
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={zhHant.navInstagramAria}
            title={zhHant.navInstagram}
          >
            <span className="inline-flex items-center justify-center" aria-hidden>
              <IconInstagram size={22} />
            </span>
          </a>
          <Link
            href="/"
            className="inline-flex select-none items-center gap-1 whitespace-nowrap font-semibold leading-tight text-[var(--fg)] no-underline caret-transparent hover:text-[var(--accent)]"
          >
            {zhHant.navHome}
          </Link>
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
                "pointer-events-none invisible absolute left-1/2 top-[calc(100%+0.2rem)] z-[60] min-w-[11.5rem] -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--card)] py-[0.35rem] opacity-0 shadow-[0_10px_28px_rgba(28,24,21,0.12)] transition-[opacity,visibility] duration-150 ease-out before:pointer-events-none before:absolute before:bottom-full before:left-0 before:right-0 before:h-[0.45rem] before:content-['']",
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
            href="/services"
            className="inline-flex select-none items-center gap-1 whitespace-nowrap font-semibold leading-tight text-[var(--fg)] no-underline caret-transparent hover:text-[var(--accent)]"
          >
            {zhHant.navOtherServices}
          </Link>
          <Link
            href="/track"
            className="inline-flex select-none items-center gap-1 whitespace-nowrap font-semibold leading-tight text-[var(--fg)] no-underline caret-transparent hover:text-[var(--accent)]"
          >
            {zhHant.navTrackOrder}
          </Link>
          <Link
            href="/cart"
            className="inline-flex select-none items-center gap-1 whitespace-nowrap font-semibold leading-tight text-[var(--fg)] no-underline caret-transparent hover:text-[var(--accent)]"
          >
            {zhHant.navCart}
            {cartItemCount > 0 ? (
              <span className="ml-1 min-h-5 min-w-5 rounded-full bg-[var(--accent-fill)] px-[0.35rem] text-center text-xs font-bold leading-5 text-[var(--on-accent-fill)]">
                {cartItemCount}
              </span>
            ) : null}
          </Link>
        </nav>
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
        aria-modal="true"
        aria-label={zhHant.navDrawerAria}
        aria-hidden={!menuOpen}
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
            <IconClose size={22} />
          </button>
        </div>
        <nav
          className="flex min-h-0 flex-1 flex-col gap-[0.15rem] px-[0.35rem] py-[0.35rem] pb-2 [&>a:last-child]:mt-auto"
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
              <IconHome size={20} />
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
                <IconCatalog size={20} />
              </span>
              <span className="min-w-0 flex-1">{zhHant.navCatalog}</span>
            </Link>
            <ul className="m-0 mb-[0.1rem] list-none p-0" aria-label={zhHant.navCatalogSubAria}>
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
            href="/services"
            className="group/drawer flex cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-base font-semibold text-[var(--fg)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
            onClick={closeMenu}
          >
            <span
              className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
              aria-hidden
            >
              <IconOtherServices size={20} />
            </span>
            <span className="min-w-0 flex-1">{zhHant.navOtherServices}</span>
          </Link>
          <Link
            href="/track"
            className="group/drawer flex cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-base font-semibold text-[var(--fg)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
            onClick={closeMenu}
          >
            <span
              className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
              aria-hidden
            >
              <IconOrderLookup size={20} />
            </span>
            <span className="min-w-0 flex-1">{zhHant.navTrackOrder}</span>
          </Link>
          <Link
            href="/cart"
            className="group/drawer flex cursor-pointer items-center gap-[0.65rem] rounded-[10px] px-[0.85rem] py-3 text-base font-semibold text-[var(--fg)] no-underline hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
            onClick={closeMenu}
          >
            <span
              className="inline-flex shrink-0 text-[var(--muted)] group-hover/drawer:text-[var(--accent)]"
              aria-hidden
            >
              <IconCart size={20} />
            </span>
            <span className="min-w-0 flex-1">{zhHant.navCart}</span>
            {cartItemCount > 0 ? (
              <span className="ml-auto shrink-0 rounded-full bg-[var(--accent-fill)] px-[0.35rem] text-center text-xs font-bold leading-5 text-[var(--on-accent-fill)]">
                {cartItemCount}
              </span>
            ) : null}
          </Link>
          <a
            href="https://www.instagram.com/cara.cardline/"
            className="mt-auto inline-flex cursor-pointer items-center justify-center self-start rounded-[10px] p-[0.75rem] leading-none text-[var(--muted)] no-underline select-none caret-transparent hover:bg-[rgba(28,24,21,0.05)] hover:text-[var(--accent)]"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={zhHant.navInstagramAria}
            title={zhHant.navInstagram}
            onClick={closeMenu}
          >
            <span className="inline-flex items-center justify-center" aria-hidden>
              <IconInstagram size={22} />
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}
