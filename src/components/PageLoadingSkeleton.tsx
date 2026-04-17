import { zhHant } from "../locale/zh-Hant.js";
import { cn } from "../cn.js";

export type PageLoadingSkeletonVariant =
  | "home"
  | "catalog"
  | "product"
  | "order"
  | "cart"
  | "checkout";

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn("max-w-full animate-pulse rounded-md bg-[var(--media-bg)]", className)}
      aria-hidden
    />
  );
}

function HomeSkeleton() {
  return (
    <div className="-mt-1">
      <div className="mb-6 box-border w-screen max-w-[100vw] [margin-left:calc(50%-50vw)]" aria-hidden>
        <div className="aspect-video w-full animate-pulse rounded-none border border-[var(--border)] bg-[var(--media-bg)] md:h-[350px] md:rounded-[14px]" />
      </div>
      {[0, 1].map((i) => (
        <section key={i} className="mb-8" aria-hidden>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <SkeletonLine className="h-[1.1rem] w-28" />
            <SkeletonLine className="h-[0.85rem] w-16" />
          </div>
          <div className="-mx-6 overflow-hidden px-6">
            <ul className="m-0 flex w-max list-none gap-[0.85rem] p-0 pb-2">
              {Array.from({ length: 5 }, (_, j) => (
                <li
                  key={j}
                  className="flex w-[min(42vw,11rem)] max-w-[11rem] shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
                >
                  <div className="aspect-square animate-pulse bg-[var(--media-bg)]" />
                  <div className="px-3 pb-2 pt-[0.65rem]">
                    <SkeletonLine className="h-[0.65rem] w-[85%]" />
                    <SkeletonLine className="mt-[0.35rem] h-3 w-14" />
                  </div>
                  <span className="mx-[0.65rem] mb-[0.65rem] mt-0 h-[1.85rem] animate-pulse rounded-lg bg-[var(--media-bg)]" />
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
    <ul
      className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5 p-0"
      aria-hidden
    >
      {Array.from({ length: 8 }, (_, i) => (
        <li
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
        >
          <div className="aspect-[3/4] animate-pulse bg-[var(--media-bg)]" />
          <div className="px-4 pb-2 pt-[0.85rem]">
            <SkeletonLine className="h-4 w-[90%]" />
            <SkeletonLine className="mt-2 h-3 w-[70%]" />
            <SkeletonLine className="mt-2 h-4 w-16" />
          </div>
          <span className="mx-4 mb-4 mt-3 h-[2.35rem] animate-pulse rounded-lg bg-[var(--media-bg)]" />
        </li>
      ))}
    </ul>
  );
}

function ProductSkeleton() {
  return (
    <article className="select-none" aria-hidden>
      <SkeletonLine className="mb-4 h-[0.85rem] w-20" />
      <div className="grid gap-8 max-[720px]:grid-cols-1 md:grid-cols-2">
        <div>
          <div className="aspect-[3/4] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--media-bg)]" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonLine className="h-6 w-[min(100%,16rem)]" />
          <SkeletonLine className="h-3 w-[min(100%,14rem)]" />
          <SkeletonLine className="h-3 w-[min(100%,10rem)]" />
          <SkeletonLine className="mt-2 h-5 w-20" />
          <span className="mt-3 h-[2.35rem] w-32 animate-pulse rounded-lg bg-[var(--media-bg)]" />
        </div>
      </div>
    </article>
  );
}

function OrderSkeleton() {
  return (
    <div className="max-w-[48rem]" aria-hidden>
      <SkeletonLine className="mb-2 h-8 w-24" />
      <SkeletonLine className="mb-4 h-4 w-[min(100%,18rem)]" />
      <SkeletonLine className="mb-2 h-4 w-20" />
      <ul className="m-0 list-none border-t border-[var(--border)] p-0">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3">
            <div className="min-w-0 flex-1">
              <SkeletonLine className="h-4 w-[min(100%,14rem)]" />
              <SkeletonLine className="mt-2 h-3 w-40" />
            </div>
            <SkeletonLine className="h-4 w-14" />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4">
        <SkeletonLine className="h-4 w-20" />
        <SkeletonLine className="h-5 w-16" />
      </div>
      <div className="mt-6 h-40 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--media-bg)]" />
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="max-w-[68rem]" aria-hidden>
      <SkeletonLine className="mb-2 h-8 w-40" />
      <SkeletonLine className="mb-6 h-4 w-[min(100%,28rem)]" />
      <div className="grid gap-6 min-[880px]:grid-cols-[1fr_22rem]">
        <div className="grid max-w-[28rem] gap-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i}>
              <SkeletonLine className="mb-2 h-3 w-24" />
              <span className="block h-9 w-full animate-pulse rounded-lg bg-[var(--media-bg)]" />
            </div>
          ))}
          <SkeletonLine className="h-3 w-[min(100%,22rem)]" />
        </div>
        <aside>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <SkeletonLine className="mb-2 h-3 w-32" />
            <ul className="m-0 mt-2 list-none p-0">
              {Array.from({ length: 2 }, (_, i) => (
                <li key={i} className="flex justify-between gap-3 border-b border-[var(--border)] py-2 last:border-0">
                  <SkeletonLine className="h-3 flex-1" />
                  <SkeletonLine className="h-3 w-20" />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-3">
              <SkeletonLine className="h-3 w-16" />
              <SkeletonLine className="h-4 w-14" />
            </div>
            <span className="mt-4 block h-10 w-full animate-pulse rounded-lg bg-[var(--media-bg)]" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="max-w-[48rem]" aria-hidden>
      <SkeletonLine className="mb-2 h-8 w-32" />
      <SkeletonLine className="mb-4 h-4 w-40" />
      <ul className="m-0 mt-4 list-none p-0">
        {Array.from({ length: 2 }, (_, i) => (
          <li key={i} className="flex flex-wrap gap-4 border-b border-[var(--border)] py-4">
            <span className="block h-24 w-[4.5rem] shrink-0 animate-pulse rounded-lg bg-[var(--media-bg)]" />
            <div className="min-w-[min(100%,12rem)] flex-1">
              <SkeletonLine className="h-4 w-[min(100%,14rem)]" />
              <SkeletonLine className="mt-2 h-3 w-28" />
              <div className="mt-3 flex gap-2">
                <span className="h-8 w-8 animate-pulse rounded-md bg-[var(--media-bg)]" />
                <span className="h-8 w-8 animate-pulse rounded-md bg-[var(--media-bg)]" />
                <span className="h-8 w-8 animate-pulse rounded-md bg-[var(--media-bg)]" />
              </div>
            </div>
            <SkeletonLine className="h-5 w-16 max-[520px]:ml-auto" />
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-end gap-4 border-t border-[var(--border)] pt-5">
        <SkeletonLine className="h-4 w-20" />
        <SkeletonLine className="h-6 w-16" />
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
      className={cn("w-full min-w-0", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{zhHant.loadingPage}</span>
      {variant === "home" && <HomeSkeleton />}
      {variant === "catalog" && <CatalogSkeleton />}
      {variant === "product" && <ProductSkeleton />}
      {variant === "order" && <OrderSkeleton />}
      {variant === "cart" && <CartSkeleton />}
      {variant === "checkout" && <CheckoutSkeleton />}
    </div>
  );
}
