import { Route, Switch } from "wouter";
import { SiteFooter } from "./components/SiteFooter.js";
import { SiteHeader } from "./components/SiteHeader.js";
import { CartProvider } from "./cart-context.js";
import { zhHant } from "./locale/zh-Hant.js";
import { ToastProvider } from "./toast-context.js";
import { CatalogPage } from "./pages/CatalogPage.js";
import { HomePage } from "./pages/HomePage.js";
import { ProductPage } from "./pages/ProductPage.js";
import { CartPage } from "./pages/CartPage.js";
import { CheckoutPage } from "./pages/CheckoutPage.js";
import { OrderPage } from "./pages/OrderPage.js";
import { TrackOrderPage } from "./pages/TrackOrderPage.js";
import { AboutPage } from "./pages/AboutPage.js";
import { DisclaimerPage } from "./pages/DisclaimerPage.js";
import { OtherServicesPage } from "./pages/OtherServicesPage.js";

function AppShell() {
  return (
    <div className="shell">
      <SiteHeader />
      <main className="main">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/catalog" component={CatalogPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/track" component={TrackOrderPage} />
          <Route path="/order/:orderId" component={OrderPage} />
          <Route path="/item/:id" component={ProductPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/services" component={OtherServicesPage} />
          <Route path="/disclaimer" component={DisclaimerPage} />
          <Route>
            <p className="muted">{zhHant.notFound}</p>
          </Route>
        </Switch>
      </main>
      <SiteFooter />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </ToastProvider>
  );
}
