import { Link, Route, Switch } from "wouter";
import { CatalogPage } from "./pages/CatalogPage.js";
import { ProductPage } from "./pages/ProductPage.js";

export function App() {
  return (
    <div className="shell">
      <header className="header">
        <Link href="/" className="brand">
          storefront
        </Link>
      </header>
      <main className="main">
        <Switch>
          <Route path="/" component={CatalogPage} />
          <Route path="/item/:id" component={ProductPage} />
          <Route>
            <p className="muted">Not found.</p>
          </Route>
        </Switch>
      </main>
    </div>
  );
}
