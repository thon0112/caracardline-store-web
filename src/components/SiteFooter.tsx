import { Link } from "wouter";
import { zhHant } from "../locale/zh-Hant.js";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-row">
        <p className="footer-copy muted small">
          {zhHant.footerCopyright(year)}
        </p>
        <nav className="footer-links" aria-label={zhHant.footerNavAria}>
          <Link href="/about" className="footer-link muted small">
            {zhHant.footerAbout}
          </Link>
          <span className="footer-sep muted small" aria-hidden>
            ·
          </span>
          <Link href="/disclaimer" className="footer-link muted small">
            {zhHant.footerDisclaimer}
          </Link>
          <span className="footer-sep muted small" aria-hidden>
            ·
          </span>
          <span className="footer-link muted small">{zhHant.footerContact}</span>
          <span className="footer-sep muted small" aria-hidden>
            ·
          </span>
          <span className="footer-link muted small">{zhHant.footerPrivacy}</span>
        </nav>
      </div>
    </footer>
  );
}
