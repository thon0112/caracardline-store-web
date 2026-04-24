import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { fetchCatalogItem, createCart, addCartItem } from "../api.js";
import { useCart } from "../cart-context.js";
import { cn } from "../cn.js";
import {
  displayProductType,
  formatPriceUsd,
  normalizeCatalogTypeFilter,
  zhHant,
} from "../locale/zh-Hant.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { TOAST_DURATION_SHORT_MS, useToast } from "../toast-context.js";

function isProductSlugParam(raw: string | undefined): raw is string {
  return typeof raw === "string" && raw.trim().length > 0;
}

function primaryImage(item: Awaited<ReturnType<typeof fetchCatalogItem>>) {
  const fromProduct = item.imageUrls?.[0];
  if (fromProduct) return fromProduct;
  const c = item.card;
  if (!c) return null;
  return c.largeImage || c.image;
}

export function ProductPage() {
  const { showToast } = useToast();
  const params = useParams();
  const slug = params.slug;
  const [data, setData] = useState<
    Awaited<ReturnType<typeof fetchCatalogItem>> | null
  >(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { refreshCart } = useCart();
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem("sf_cart_id"),
  );

  useEffect(() => {
    if (!isProductSlugParam(slug)) {
      setErr(zhHant.productInvalid);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const row = await fetchCatalogItem(slug.trim());
        if (!cancelled) {
          setData(row);
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) {
          if (!tryToastBadRequest(e, showToast)) {
            setErr(zhHant.productNotFound);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, showToast]);

  async function ensureCart() {
    if (cartId) return cartId;
    const { cartId: newId } = await createCart();
    localStorage.setItem("sf_cart_id", newId);
    setCartId(newId);
    return newId;
  }

  async function addToCart() {
    if (!data) return;
    try {
      setAdding(true);
      const cid = await ensureCart();
      await addCartItem(cid, { productId: data.productId, quantity: 1 });
      await refreshCart();
      showToast(zhHant.addToCartSuccess, TOAST_DURATION_SHORT_MS);
    } catch (e) {
      if (!tryToastBadRequest(e, showToast)) {
        setErr(e instanceof Error ? e.message : zhHant.errAddFailed);
      }
    } finally {
      setAdding(false);
    }
  }

  const catalogListHref = useMemo(() => {
    if (!data) return "/catalog";
    const code = normalizeCatalogTypeFilter(data.productType);
    return code ? `/catalog/${code}` : "/catalog";
  }, [data]);

  if (loading) return <PageLoadingSkeleton variant="product" />;
  if (err || !data) {
    return (
      <div>
        <p className="text-[var(--err)]">{err ?? zhHant.productNotFound}</p>
        <Link
          href="/"
          className="mb-4 inline-block cursor-pointer select-none text-[var(--muted)] no-underline caret-transparent"
        >
          ← {zhHant.productBack}
        </Link>
      </div>
    );
  }

  const img = primaryImage(data);
  const subtitle = [
    data.card?.collection,
    data.card?.rare,
    data.condition && `${data.condition}`,
    displayProductType(data.productType),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="select-none [-webkit-user-select:none]">
      <Link
        href={catalogListHref}
        className="mb-4 inline-block cursor-pointer select-none text-[var(--muted)] no-underline caret-transparent"
      >
        ← {zhHant.productBackCatalog}
      </Link>
      <div className="grid select-none gap-8 caret-transparent [-webkit-user-select:none] max-[720px]:grid-cols-1 md:grid-cols-3 [&_code]:select-text [&_h1]:select-text [&_p]:select-text">
        <div
          className={cn(
            "relative md:col-span-1",
            data.soldOut && "[&_img]:opacity-72 [&_img]:grayscale-[25%] [&_.ph]:opacity-72 [&_.ph]:grayscale-[25%]",
          )}
        >
          {data.soldOut && (
            <span
              className="absolute right-[0.65rem] top-[0.65rem] z-[1] rounded-lg bg-[color-mix(in_srgb,var(--err)_88%,transparent)] px-2 py-1 text-[0.8125rem] font-bold leading-snug text-[var(--card)]"
              aria-hidden
            >
              {zhHant.soldOutBadge}
            </span>
          )}
          {img ? (
            <img
              className="block md:min-h-[450px] max-h-[400px] w-full object-contain rounded-xl border border-[var(--border)]"
              src={img}
              alt=""
            />
          ) : (
            <div className="aspect-[3/4] max-h-[400px] w-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]" />
          )}
        </div>
        <div className="md:col-span-2">
          <h1 className="m-0 mb-2 text-[1.75rem] font-bold">{data.title}</h1>
          {subtitle && <p className="text-[var(--muted)]">{subtitle}</p>}
          {data.description && (
            <p className="m-0 mb-6 mt-3 max-w-[42rem]">{data.description}</p>
          )}
          {data.psaId && (
            <p className="text-sm text-[var(--muted)]">
              {zhHant.productPsaId}：<code className="rounded bg-[var(--media-bg)] px-[0.35em] py-[0.1em] text-[0.9em]">
                {data.psaId}
              </code>
            </p>
          )}
          <p className="my-4 text-2xl font-bold text-[var(--accent)]">
            {formatPriceUsd(data.listPrice)}
          </p>
          {data.soldOut && (
            <p className="mt-2 text-[var(--muted)]">{zhHant.productSoldOut}</p>
          )}
          <button
            type="button"
            className="mb-4 mt-3 cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={adding || data.soldOut}
            title={data.soldOut ? zhHant.soldOutAddDisabled : undefined}
            onClick={addToCart}
          >
            {adding ? zhHant.adding : data.soldOut ? zhHant.soldOutBadge : zhHant.addToCart}
          </button>
        </div>
      </div>
    </article>
  );
}
