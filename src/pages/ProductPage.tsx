import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Link, useParams } from "wouter";
import {
  addCartItem,
  createCart,
  fetchCatalogItem,
  isApiError,
} from "../api.js";
import { useCart } from "../cart-context.js";
import { collectProductImageUrls } from "../catalog-helpers.js";
import { cn } from "../cn.js";
import {
  displayProductType,
  normalizeCatalogTypeFilter,
  zhHant,
} from "../locale/zh-Hant.js";
import { useDocumentMeta } from "../document-meta.js";
import { PAGE_META, productMeta } from "../page-meta.js";
import { ProductJsonLd } from "../product-schema.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { ProductPrice } from "../components/ProductPrice.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { TOAST_DURATION_SHORT_MS, useToast } from "../toast-context.js";
import { isCardPoolEnabled } from "../store-config.js";

function isProductSlugParam(raw: string | undefined): raw is string {
  return typeof raw === "string" && raw.trim().length > 0;
}

function ProductImageGallery({
  urls,
  soldOut,
  imageAlt,
  type,
}: {
  urls: string[];
  soldOut: boolean;
  imageAlt: string;
  type?: string;
}) {
  const [active, setActive] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollThumbIntoView = useCallback(
    (i: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(i);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActive(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    scrollThumbIntoView(active);
  }, [active, scrollThumbIntoView]);

  const n = urls.length;
  const safeIndex = Math.min(Math.max(active, 0), Math.max(n - 1, 0));
  const src = urls[safeIndex];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);

  const openLightbox = useCallback(
    (atIndex?: number) => {
      if (n === 0) return;
      const i =
        typeof atIndex === "number"
          ? Math.min(Math.max(atIndex, 0), n - 1)
          : safeIndex;
      setLightboxIndex(i);
      setLightboxOpen(true);
    },
    [n, safeIndex],
  );

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const lightboxGo = useCallback(
    (delta: number) => {
      if (n <= 1) return;
      setLightboxIndex((i) => (i + delta + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const t = window.setTimeout(() => lightboxCloseRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowLeft" && n > 1) {
        e.preventDefault();
        lightboxGo(-1);
      } else if (e.key === "ArrowRight" && n > 1) {
        e.preventDefault();
        lightboxGo(1);
      }
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [closeLightbox, lightboxGo, lightboxOpen, n]);

  function go(delta: number) {
    if (n <= 1) return;
    setActive((i) => (i + delta + n) % n);
  }

  const lightboxSrc = urls[lightboxIndex] ?? src;

  if (n === 0) {
    return (
      <div className="aspect-[3/4] max-h-[500px] w-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]" />
    );
  }

  return (
    <div
      className="flex flex-col gap-2"
      aria-label={zhHant.productImageGalleryAria}
    >
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <button
          type="button"
          className={cn(
            "relative block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
            soldOut && "[&_img]:opacity-72 [&_img]:grayscale-[25%]",
          )}
          aria-label={zhHant.productImageOpenLightboxAria}
          onClick={() => openLightbox()}
        >
          <div className="relative isolate flex min-h-[280px] items-center justify-center md:min-h-[320px]">
            {type === "booster_box" ? (
              <img
                src={src}
                alt={imageAlt}
                draggable={false}
                className="mx-auto block max-h-[500px] min-h-[260px] w-full max-w-full select-none object-contain md:min-h-[300px] scale-[1.33]"
              />
            ) : (
              <img
                src={src}
                alt={imageAlt}
                draggable={false}
                className="mx-auto block max-h-[500px] min-h-[260px] w-full max-w-full select-none object-contain md:min-h-[300px]"
              />
            )}
          </div>
        </button>

        {n > 1 && (
          <>
            <button
              type="button"
              className="absolute left-1 top-1/2 z-[1] flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_92%,transparent)] text-[var(--accent)] shadow-sm backdrop-blur-[2px] hover:bg-[color-mix(in_srgb,var(--accent)_12%,var(--card))] max-[480px]:h-8 max-[480px]:w-8"
              aria-label={zhHant.productImagePrev}
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
            >
              <span aria-hidden className="text-lg leading-none">
                ‹
              </span>
            </button>
            <button
              type="button"
              className="absolute right-1 top-1/2 z-[1] flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_92%,transparent)] text-[var(--accent)] shadow-sm backdrop-blur-[2px] hover:bg-[color-mix(in_srgb,var(--accent)_12%,var(--card))] max-[480px]:h-8 max-[480px]:w-8"
              aria-label={zhHant.productImageNext}
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
            >
              <span aria-hidden className="text-lg leading-none">
                ›
              </span>
            </button>
          </>
        )}
      </div>
      {n > 1 && (
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y gap-2">
            {urls.map((u, i) => (
              <button
                key={u}
                type="button"
                className={cn(
                  "relative min-h-0 w-[4.5rem] shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-[var(--card)] p-0 transition-[box-shadow,opacity] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                  i === safeIndex
                    ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--border)] opacity-85 hover:opacity-100",
                  soldOut && "[&>img]:opacity-72 [&>img]:grayscale-[25%]",
                )}
                aria-label={zhHant.productImageThumbAria(i + 1, n)}
                aria-current={i === safeIndex ? "true" : undefined}
                onClick={() => setActive(i)}
              >
                <img
                  className="aspect-[3/4] h-16 w-full object-cover"
                  src={u}
                  alt=""
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {lightboxOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/88 p-3 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={zhHant.productImageLightboxTitle}
            onClick={closeLightbox}
          >
            <div
              className="relative flex max-h-[100dvh] max-w-[min(100vw,1600px)] flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxSrc}
                alt={imageAlt}
                className="max-h-[85dvh] w-auto max-w-full object-contain"
                draggable={false}
              />
              {n > 1 && (
                <p className="mt-3 text-center text-sm text-white/80">
                  {lightboxIndex + 1} / {n}
                </p>
              )}
            </div>

            <button
              ref={lightboxCloseRef}
              type="button"
              className="absolute right-3 top-3 z-[1] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-black/45 text-2xl leading-none text-white backdrop-blur-sm hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={zhHant.productImageCloseLightbox}
              onClick={closeLightbox}
            >
              <span aria-hidden>×</span>
            </button>

            {n > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 z-[1] flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-black/45 text-xl text-white backdrop-blur-sm hover:bg-black/60 max-[480px]:left-1 max-[480px]:h-10 max-[480px]:w-10"
                  aria-label={zhHant.productImagePrev}
                  onClick={(e) => {
                    e.stopPropagation();
                    lightboxGo(-1);
                  }}
                >
                  <span aria-hidden>‹</span>
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 z-[1] flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-black/45 text-xl text-white backdrop-blur-sm hover:bg-black/60 max-[480px]:right-1 max-[480px]:h-10 max-[480px]:w-10"
                  aria-label={zhHant.productImageNext}
                  onClick={(e) => {
                    e.stopPropagation();
                    lightboxGo(1);
                  }}
                >
                  <span aria-hidden>›</span>
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

export function ProductPage() {
  const { showToast } = useToast();
  const params = useParams();
  const slug = params.slug;
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchCatalogItem>
  > | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  /** Sorted unique pool numbers (multi-select). */
  const [selectedPoolNumbers, setSelectedPoolNumbers] = useState<number[]>([]);
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem("sf_cart_id"),
  );
  const { refreshCart, lines } = useCart();

  const documentMeta = useMemo(
    () => (data ? productMeta(data) : PAGE_META.productLoading),
    [data],
  );
  useDocumentMeta(documentMeta);

  const poolNumbersInCart = useMemo(() => {
    if (!data || data.productType !== "card_pool" || !data.pool) {
      return new Set<number>();
    }
    const pid = data.productId;
    const nums = new Set<number>();
    for (const line of lines) {
      if (line.catalog.productId === pid && line.poolNumber != null) {
        nums.add(line.poolNumber);
      }
    }
    return nums;
  }, [data, lines]);

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
          setSelectedPoolNumbers([]);
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

  function togglePoolNumber(n: number) {
    setSelectedPoolNumbers((prev) => {
      const set = new Set(prev);
      if (set.has(n)) set.delete(n);
      else set.add(n);
      return Array.from(set).sort((a, b) => a - b);
    });
  }

  async function addToCart() {
    if (!data) return;
    const isCardPool = data.productType === "card_pool" && data.pool != null;
    if (isCardPool && selectedPoolNumbers.length === 0) {
      showToast(zhHant.productPoolSelectRequired, TOAST_DURATION_SHORT_MS);
      return;
    }
    try {
      setAdding(true);
      const cid = await ensureCart();
      if (!isCardPool) {
        await addCartItem(cid, {
          productId: data.productId,
          quantity: 1,
        });
        await refreshCart();
        showToast(zhHant.addToCartSuccess, TOAST_DURATION_SHORT_MS);
        return;
      }

      const toAdd = [...selectedPoolNumbers];
      const added: number[] = [];
      let stoppedOnConflict = false;
      for (const poolNumber of toAdd) {
        try {
          await addCartItem(cid, {
            productId: data.productId,
            quantity: 1,
            poolNumber,
          });
          added.push(poolNumber);
        } catch (e) {
          if (isApiError(e) && (e.status === 409 || e.status === 400)) {
            stoppedOnConflict = true;
            if (!tryToastBadRequest(e, showToast)) {
              showToast(e.message, TOAST_DURATION_SHORT_MS);
            }
            break;
          }
          throw e;
        }
      }

      await refreshCart();

      if (added.length === toAdd.length) {
        showToast(
          added.length > 1
            ? zhHant.productPoolAddMultiSuccess(added.length)
            : zhHant.addToCartSuccess,
          TOAST_DURATION_SHORT_MS,
        );
        setSelectedPoolNumbers([]);
      } else if (added.length > 0) {
        showToast(
          zhHant.productPoolAddPartialSuccess(added.length, toAdd.length),
          TOAST_DURATION_SHORT_MS,
        );
        setSelectedPoolNumbers((prev) =>
          prev.filter((n) => !added.includes(n)),
        );
      }

      if (stoppedOnConflict || added.length < toAdd.length) {
        const seg = (slug && slug.trim()) || data.slug || data.productId;
        try {
          const row = await fetchCatalogItem(seg);
          setData(row);
        } catch {
          /* ignore refresh failure */
        }
      }
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

  if (data.productType === "card_pool" && !isCardPoolEnabled) {
    return (
      <div>
        <p className="text-[var(--err)]">{zhHant.productNotFound}</p>
        <Link
          href="/"
          className="mb-4 inline-block cursor-pointer select-none text-[var(--muted)] no-underline caret-transparent"
        >
          ← {zhHant.productBack}
        </Link>
      </div>
    );
  }

  const subtitle = [
    data.card?.collection,
    data.card?.rare,
    data.condition && `${data.condition}`,
    displayProductType(data.productType),
  ]
    .filter(Boolean)
    .join(" · ");
  const isCardPool = data.productType === "card_pool" && data.pool != null;
  const soldNumbers = new Set(data.pool?.soldNumbers ?? []);
  const allNumbers = isCardPool
    ? Array.from({ length: data.pool!.poolSize }, (_, i) => i + 1)
    : [];

  return (
    <article className="select-none [-webkit-user-select:none]">
      <ProductJsonLd data={data} catalogListHref={catalogListHref} />
      <Link
        href={catalogListHref}
        className="mb-4 inline-block cursor-pointer select-none text-[var(--muted)] no-underline caret-transparent"
      >
        ← {zhHant.productBackCatalog}
      </Link>
      <div className="grid select-none gap-8 caret-transparent [-webkit-user-select:none] max-[720px]:grid-cols-1 md:grid-cols-3 [&_code]:select-text [&_h1]:select-text [&_p]:select-text">
        <div className="relative md:col-span-1">
          {data.soldOut && (
            <span
              className="pointer-events-none absolute right-[0.65rem] top-[0.65rem] z-[2] rounded-lg bg-[color-mix(in_srgb,var(--err)_88%,transparent)] px-2 py-1 text-[0.8125rem] font-bold leading-snug text-[var(--card)]"
              aria-hidden
            >
              {zhHant.soldOutBadge}
            </span>
          )}
          <ProductImageGallery
            type={data.productType}
            urls={collectProductImageUrls(data)}
            soldOut={data.soldOut}
            imageAlt={data.title}
          />
        </div>
        <div className="md:col-span-2">
          <h1 className="m-0 mb-2 text-[1.75rem] font-bold">{data.title}</h1>
          {subtitle && <p className="text-[var(--muted)]">{subtitle}</p>}
          {data.description && (
            <p className="m-0 mb-6 mt-3 max-w-[42rem] whitespace-pre-line">
              {data.description}
            </p>
          )}
          {data.psaId && (
            <p className="text-sm text-[var(--muted)]">
              {zhHant.productPsaId}：
              <code className="rounded bg-[var(--media-bg)] px-[0.35em] py-[0.1em] text-[0.9em]">
                {data.psaId}
              </code>
            </p>
          )}
          <ProductPrice
            className="my-4"
            size="lg"
            listPrice={data.listPrice}
            compareAtPrice={data.compareAtPrice}
          />
          {isCardPool && (
            <section
              data-testid="card-pool"
              className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_10px_28px_rgba(28,24,21,0.06)]"
            >
              <p className="m-0 mb-3 text-xs text-[var(--muted)]">
                {zhHant.productPoolPickHint(data.pool!.poolSize)}
              </p>
              <div className="grid grid-cols-5 gap-2 max-[520px]:grid-cols-4">
                {allNumbers.map((n) => {
                  const sold = soldNumbers.has(n);
                  const inCart = poolNumbersInCart.has(n);
                  const selected = selectedPoolNumbers.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={sold}
                      title={
                        sold
                          ? undefined
                          : inCart
                            ? zhHant.productPoolNumberInCart
                            : undefined
                      }
                      onClick={() => togglePoolNumber(n)}
                      className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-lg border px-2 py-1.5 text-sm font-semibold transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_12px_26px_rgba(28,24,21,0.10)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                        sold
                          ? "cursor-not-allowed border-[var(--border)] bg-[color-mix(in_srgb,var(--muted)_15%,var(--card))] text-[var(--muted)] line-through opacity-70"
                          : inCart
                            ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_22%,var(--card))] text-[var(--accent)] ring-2 ring-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
                            : selected
                              ? "animate-[pool-pick-pop_0.34s_cubic-bezier(0.34,1.4,0.64,1)] border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(154,85,48,0.28)] motion-reduce:animate-none"
                              : "border-[var(--border)] bg-transparent text-[var(--fg)] hover:border-[var(--accent)]",
                      )}
                    >
                      {selected && !sold && !inCart ? (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-[inherit] animate-[pool-pick-ring_0.45s_ease-out] motion-reduce:animate-none"
                        />
                      ) : null}
                      <span
                        className={cn(
                          "pointer-events-none relative inline-flex flex-col items-center leading-none transition-transform duration-200 motion-reduce:transition-none",
                          selected && !sold && !inCart && "scale-105 motion-reduce:scale-100",
                        )}
                      >
                        <span>{n}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedPoolNumbers.length > 0 && (
                <p className="m-0 mt-3 text-sm text-[var(--accent)]">
                  {selectedPoolNumbers.length === 1
                    ? zhHant.productPoolSelected(selectedPoolNumbers[0]!)
                    : zhHant.productPoolSelectedMany(selectedPoolNumbers)}
                </p>
              )}
            </section>
          )}
          {data.soldOut && (
            <p className="mt-2 text-[var(--muted)]">{zhHant.productSoldOut}</p>
          )}
          <button
            type="button"
            className="mb-4 mt-3 cursor-pointer rounded-lg border border-[var(--accent)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              adding ||
              data.soldOut ||
              (isCardPool && selectedPoolNumbers.length === 0)
            }
            title={data.soldOut ? zhHant.soldOutAddDisabled : undefined}
            onClick={addToCart}
          >
            {adding
              ? zhHant.adding
              : data.soldOut
                ? zhHant.soldOutBadge
                : isCardPool && selectedPoolNumbers.length > 1
                  ? zhHant.productPoolAddToCartMany(selectedPoolNumbers.length)
                  : zhHant.addToCart}
          </button>
        </div>
      </div>
    </article>
  );
}
