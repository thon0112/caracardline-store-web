import { zhHant } from "../locale/zh-Hant.js";

export type PageLoadingSkeletonVariant =
  | "home"
  | "catalog"
  | "product"
  | "order"
  | "cart"
  | "checkout";

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton-line skeleton-pulse", className)}
      aria-hidden
    />
  );
}

function HomeSkeleton() {
  return (
    <div className="home">
      <div
        className="home-hero-bleed"
        aria-hidden
      >
        <div className="home-skel-hero skeleton-pulse" />
      </div>
      {[0, 1].map((i) => (
        <section key={i} className="home-group" aria-hidden>
          <div className="home-group-head">
            <SkeletonLine className="home-skel-group-title" />
            <SkeletonLine className="home-skel-group-all" />
          </div>
          <div className="home-rail">
            <ul className="home-rail-track">
              {Array.from({ length: 5 }, (_, j) => (
                <li key={j} className="home-rail-card home-skel-rail-card">
                  <div className="home-rail-media home-skel-rail-media skeleton-pulse" />
                  <div className="home-rail-body">
                    <SkeletonLine className="home-skel-rail-title" />
                    <SkeletonLine className="home-skel-rail-price" />
                  </div>
                  <span className="home-skel-rail-btn skeleton-pulse" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <ul className="grid catalog-skel-grid" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} className="catalog-skel-card">
          <div className="catalog-skel-media skeleton-pulse" />
          <div className="catalog-skel-body">
            <SkeletonLine className="catalog-skel-title" />
            <SkeletonLine className="catalog-skel-meta" />
            <SkeletonLine className="catalog-skel-price" />
          </div>
          <span className="catalog-skel-btn skeleton-pulse" />
        </li>
      ))}
    </ul>
  );
}

function ProductSkeleton() {
  return (
    <article className="detail" aria-hidden>
      <SkeletonLine className="product-skel-back" />
      <div className="detail-grid">
        <div className="detail-media">
          <div className="product-skel-image skeleton-pulse" />
        </div>
        <div className="product-skel-aside">
          <SkeletonLine className="product-skel-h1" />
          <SkeletonLine className="product-skel-sub" />
          <SkeletonLine className="product-skel-sub product-skel-sub--short" />
          <SkeletonLine className="product-skel-price" />
          <span className="product-skel-cta skeleton-pulse" />
        </div>
      </div>
    </article>
  );
}

function OrderSkeleton() {
  return (
    <div className="order-page" aria-hidden>
      <SkeletonLine className="order-skel-title" />
      <SkeletonLine className="order-skel-ref" />
      <SkeletonLine className="order-skel-section-h" />
      <ul className="order-lines order-skel-lines">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="order-line order-skel-line">
            <div className="order-skel-line-main">
              <SkeletonLine className="order-skel-line-title" />
              <SkeletonLine className="order-skel-line-meta" />
            </div>
            <SkeletonLine className="order-skel-line-total" />
          </li>
        ))}
      </ul>
      <div className="order-skel-total-row">
        <SkeletonLine className="order-skel-total-label" />
        <SkeletonLine className="order-skel-total-value" />
      </div>
      <div className="order-skel-meta skeleton-pulse" />
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="checkout-page" aria-hidden>
      <SkeletonLine className="checkout-skel-title" />
      <SkeletonLine className="checkout-skel-lede" />
      <div className="checkout-layout">
        <div className="checkout-layout-main">
          <div className="checkout-skel-fields">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="checkout-skel-field">
                <SkeletonLine className="checkout-skel-label" />
                <span className="checkout-skel-input skeleton-pulse" />
              </div>
            ))}
          </div>
          <SkeletonLine className="checkout-skel-note" />
        </div>
        <aside className="checkout-layout-aside">
          <div className="checkout-summary card checkout-skel-aside-card">
            <SkeletonLine className="checkout-skel-aside-h" />
            <ul className="checkout-preview-lines checkout-skel-preview-lines">
              {Array.from({ length: 2 }, (_, i) => (
                <li key={i} className="checkout-skel-preview-line">
                  <SkeletonLine className="checkout-skel-preview-name" />
                  <SkeletonLine className="checkout-skel-preview-qty" />
                </li>
              ))}
            </ul>
            <div className="checkout-preview-total checkout-skel-total">
              <SkeletonLine className="checkout-skel-total-l" />
              <SkeletonLine className="checkout-skel-total-v" />
            </div>
            <span className="checkout-skel-submit skeleton-pulse" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="cart-page" aria-hidden>
      <SkeletonLine className="cart-skel-title" />
      <SkeletonLine className="cart-skel-lede" />
      <ul className="cart-lines">
        {Array.from({ length: 2 }, (_, i) => (
          <li key={i} className="cart-line cart-skel-line">
            <span className="cart-line-thumb cart-skel-thumb skeleton-pulse" />
            <div className="cart-line-body">
              <SkeletonLine className="cart-skel-line-title" />
              <SkeletonLine className="cart-skel-line-meta" />
              <div className="cart-skel-qty-row">
                <span className="cart-skel-qty-bit skeleton-pulse" />
                <span className="cart-skel-qty-bit skeleton-pulse" />
                <span className="cart-skel-qty-bit skeleton-pulse" />
              </div>
            </div>
            <SkeletonLine className="cart-skel-line-price" />
          </li>
        ))}
      </ul>
      <div className="cart-summary cart-skel-summary">
        <SkeletonLine className="cart-skel-summary-label" />
        <SkeletonLine className="cart-skel-summary-value" />
      </div>
    </div>
  );
}

export function PageLoadingSkeleton({
  variant,
  className,
}: {
  variant: PageLoadingSkeletonVariant;
  className?: string;
}) {
  return (
    <div
      className={cn("page-loading-skeleton", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="visually-hidden">{zhHant.loadingPage}</span>
      {variant === "home" && <HomeSkeleton />}
      {variant === "catalog" && <CatalogSkeleton />}
      {variant === "product" && <ProductSkeleton />}
      {variant === "order" && <OrderSkeleton />}
      {variant === "cart" && <CartSkeleton />}
      {variant === "checkout" && <CheckoutSkeleton />}
    </div>
  );
}
