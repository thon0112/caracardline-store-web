import { Link, Route, Switch } from "wouter";
import { CartProvider, useCart } from "./cart-context.js";
import { CatalogPage } from "./pages/CatalogPage.js";
import { ProductPage } from "./pages/ProductPage.js";
import { CartPage } from "./pages/CartPage.js";

function AppShell() {
  const { totalQty } = useCart();

  return (
    <div className="shell">
      <header className="header">
        <div className="header-row">
          <Link href="/" className="brand">
            storefront
          </Link>
          <nav className="header-nav" aria-label="Site">
            <Link href="/cart" className="header-link">
              Cart
              {totalQty > 0 ? (
                <span className="cart-badge">{totalQty}</span>
              ) : null}
            </Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <Switch>
          <Route path="/" component={CatalogPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/item/:id" component={ProductPage} />
          <Route>
            <p className="muted">Not found.</p>
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export function App() {
  return (
    <CartProvider>
      <AppShell />
    </CartProvider>
  );
}
