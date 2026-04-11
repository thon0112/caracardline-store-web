import { Link } from "wouter";
import { useCart } from "../cart-context.js";
import { zhHant } from "../locale/zh-Hant.js";

export function SiteHeader() {
  const { totalQty } = useCart();

  return (
    <header className="header">
      <div className="header-row">
        <Link href="/" className="brand">
          {zhHant.brand}
        </Link>
        <nav className="header-nav" aria-label={zhHant.navSiteAria}>
          <Link href="/" className="header-link">
            {zhHant.navHome}
          </Link>
          <Link href="/cart" className="header-link">
            {zhHant.navCart}
            {totalQty > 0 ? (
              <span className="cart-badge">{totalQty}</span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
