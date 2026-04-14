import { useCallback, useEffect, useId, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "../cart-context.js";
import {
  CATALOG_PRODUCT_TYPE_CODES,
  displayProductType,
  zhHant,
} from "../locale/zh-Hant.js";

function IconHamburger() {
  return (
    <svg
      className="header-menu-icon"
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

export function SiteHeader() {
  const { cartLineCount } = useCart();
  const [loc] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);

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
    <header className="header">
      <div className="header-row">
        <button
          type="button"
          className="header-menu-btn"
          aria-expanded={menuOpen}
          aria-controls={drawerId}
          aria-label={menuOpen ? zhHant.navMenuClose : zhHant.navMenuOpen}
          onClick={toggleMenu}
        >
          <IconHamburger />
        </button>
        <div className="header-brand-wrap">
          <Link href="/" className="brand brand-lockup">
            <img
              className="brand-logo"
              src="/brand-logo.png"
              alt=""
              width={48}
              height={48}
              decoding="async"
            />
            <span>{zhHant.brand}</span>
          </Link>
        </div>
        <Link
          href="/cart"
          className="header-cart-mobile"
          aria-label={
            cartLineCount > 0
              ? `${zhHant.navCart}，${
                  cartLineCount === 1
                    ? zhHant.cartItemOne
                    : zhHant.cartItemsMany(cartLineCount)
                }`
              : zhHant.navCart
          }
          title={zhHant.navCart}
        >
          <span className="header-cart-mobile-icon" aria-hidden>
            <IconCart size={22} />
          </span>
          {cartLineCount > 0 ? (
            <span className="cart-badge header-cart-mobile-badge">{cartLineCount}</span>
          ) : null}
        </Link>
        <nav className="header-nav header-nav--desktop" aria-label={zhHant.navSiteAria}>
          <a
            href="https://www.instagram.com/cara.cardline/"
            className="header-link header-link--icon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={zhHant.navInstagramAria}
            title={zhHant.navInstagram}
          >
            <span className="header-link-icon" aria-hidden>
              <IconInstagram size={22} />
            </span>
          </a>
          <Link href="/" className="header-link">
            {zhHant.navHome}
          </Link>
          <Link href="/catalog" className="header-link">
            {zhHant.navCatalog}
          </Link>
          <Link href="/services" className="header-link">
            {zhHant.navOtherServices}
          </Link>
          <Link href="/track" className="header-link">
            {zhHant.navTrackOrder}
          </Link>
          <Link href="/cart" className="header-link">
            {zhHant.navCart}
            {cartLineCount > 0 ? (
              <span className="cart-badge">{cartLineCount}</span>
            ) : null}
          </Link>
        </nav>
      </div>

      <button
        type="button"
        className={`header-scrim${menuOpen ? " is-visible" : ""}`}
        aria-label={zhHant.navDrawerClose}
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
      />

      <div
        id={drawerId}
        className={`header-drawer${menuOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={zhHant.navDrawerAria}
        aria-hidden={!menuOpen}
      >
        <div className="header-drawer-head">
          <span className="header-drawer-title">{zhHant.navDrawerAria}</span>
          <button
            type="button"
            className="header-drawer-close"
            aria-label={zhHant.navDrawerClose}
            onClick={closeMenu}
          >
            <IconClose size={22} />
          </button>
        </div>
        <nav className="header-drawer-nav" aria-label={zhHant.navSiteAria}>
          <Link href="/" className="header-drawer-link" onClick={closeMenu}>
            <span className="header-drawer-link-icon" aria-hidden>
              <IconHome size={20} />
            </span>
            <span className="header-drawer-link-text">{zhHant.navHome}</span>
          </Link>
          <div className="header-drawer-catalog">
            <Link href="/catalog" className="header-drawer-link" onClick={closeMenu}>
              <span className="header-drawer-link-icon" aria-hidden>
                <IconCatalog size={20} />
              </span>
              <span className="header-drawer-link-text">{zhHant.navCatalog}</span>
            </Link>
            <ul
              className="header-drawer-sublinks"
              aria-label={zhHant.navCatalogSubAria}
            >
              {CATALOG_PRODUCT_TYPE_CODES.map((code) => (
                <li key={code}>
                  <Link
                    href={`/catalog?type=${encodeURIComponent(code)}`}
                    className="header-drawer-sublink-anchor"
                    onClick={closeMenu}
                  >
                    {displayProductType(code)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/services" className="header-drawer-link" onClick={closeMenu}>
            <span className="header-drawer-link-icon" aria-hidden>
              <IconOtherServices size={20} />
            </span>
            <span className="header-drawer-link-text">{zhHant.navOtherServices}</span>
          </Link>
          <Link href="/track" className="header-drawer-link" onClick={closeMenu}>
            <span className="header-drawer-link-icon" aria-hidden>
              <IconOrderLookup size={20} />
            </span>
            <span className="header-drawer-link-text">{zhHant.navTrackOrder}</span>
          </Link>
          <Link href="/cart" className="header-drawer-link" onClick={closeMenu}>
            <span className="header-drawer-link-icon" aria-hidden>
              <IconCart size={20} />
            </span>
            <span className="header-drawer-link-text">{zhHant.navCart}</span>
            {cartLineCount > 0 ? (
              <span className="cart-badge header-drawer-badge">{cartLineCount}</span>
            ) : null}
          </Link>
          <a
            href="https://www.instagram.com/cara.cardline/"
            className="header-drawer-instagram-low"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={zhHant.navInstagramAria}
            title={zhHant.navInstagram}
            onClick={closeMenu}
          >
            <span className="header-drawer-instagram-low-icon" aria-hidden>
              <IconInstagram size={22} />
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}
