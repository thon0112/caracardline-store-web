import { zhHant } from "../locale/zh-Hant.js";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-row">
        <p className="footer-copy muted small">
          {zhHant.footerCopyright(year)}
        </p>
        <div className="footer-links">
          <span className="footer-link muted small">{zhHant.footerContact}</span>
          <span className="footer-sep muted small" aria-hidden>
            ·
          </span>
          <span className="footer-link muted small">{zhHant.footerPrivacy}</span>
        </div>
      </div>
    </footer>
  );
}
