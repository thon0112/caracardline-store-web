import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "wouter";
import {
  fetchCatalog,
  createCart,
  addCartItem,
  type CatalogListItem,
} from "../api.js";
import { displayTitle, primaryImage } from "../catalog-helpers.js";
import { useCart } from "../cart-context.js";
import {
  CATALOG_PRODUCT_TYPE_CODES,
  displayProductType,
  formatPriceUsd,
  normalizeCatalogSort,
  normalizeCatalogTypeFilter,
  type CatalogSortValue,
  zhHant,
} from "../locale/zh-Hant.js";
import { PageLoadingSkeleton } from "../components/PageLoadingSkeleton.js";
import { tryToastBadRequest } from "../notify-bad-request.js";
import { TOAST_DURATION_SHORT_MS, useToast } from "../toast-context.js";

export function CatalogPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = useMemo(
    () => normalizeCatalogTypeFilter(searchParams.get("type")),
    [searchParams],
  );
  const sortFilter = useMemo(
    () => normalizeCatalogSort(searchParams.get("sort")),
    [searchParams],
  );

  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { refreshCart } = useCart();
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem("sf_cart_id"),
  );
  const [adding, setAdding] = useState<string | null>(null);

  const visibleItems = useMemo(() => {
    if (!typeFilter) return items;
    return items.filter(
      (i) => i.productType.toLowerCase() === typeFilter.toLowerCase(),
    );
  }, [items, typeFilter]);

  function setTypeQuery(value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value === "") p.delete("type");
    else p.set("type", value);
    setSearchParams(p, { replace: true });
  }

  function setSortQuery(value: CatalogSortValue) {
    const p = new URLSearchParams(searchParams.toString());
    if (value === "date_asc") p.delete("sort");
    else p.set("sort", value);
    setSearchParams(p, { replace: true });
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await fetchCatalog({
          limit: 24,
          productType: typeFilter || undefined,
          sort: sortFilter,
        });
        if (!cancelled) {
          setItems(data.items);
          setNextCursor(data.nextCursor);
        }
      } catch (e) {
        if (!cancelled) {
          if (!tryToastBadRequest(e, showToast)) {
            setErr(e instanceof Error ? e.message : zhHant.errLoadCatalog);
          }
          setItems([]);
          setNextCursor(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast, typeFilter, sortFilter]);

  async function loadMore() {
    if (!nextCursor) return;
    try {
      const data = await fetchCatalog({
        limit: 24,
        cursor: nextCursor,
        productType: typeFilter || undefined,
        sort: sortFilter,
      });
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (e) {
      if (!tryToastBadRequest(e, showToast)) {
        setErr(e instanceof Error ? e.message : zhHant.errLoadMore);
      }
    }
  }

  async function ensureCart() {
    if (cartId) return cartId;
    const { cartId: id } = await createCart();
    localStorage.setItem("sf_cart_id", id);
    setCartId(id);
    return id;
  }

  async function addToCart(item: CatalogListItem) {
    try {
      setAdding(item.productId);
      const id = await ensureCart();
      await addCartItem(id, { productId: item.productId, quantity: 1 });
      await refreshCart();
      showToast(zhHant.addToCartSuccess, TOAST_DURATION_SHORT_MS);
    } catch (e) {
      if (!tryToastBadRequest(e, showToast)) {
        setErr(e instanceof Error ? e.message : zhHant.errAddToCart);
      }
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="catalog-page">
      <h1 className="title">
        {typeFilter
          ? `${zhHant.catalogTitle} · ${displayProductType(typeFilter)}`
          : zhHant.catalogTitle}
      </h1>

      <div className="catalog-toolbar">
        <div className="catalog-toolbar-fields">
          <div className="form-field">
            <label htmlFor="catalog-filter-type">{zhHant.catalogFilterType}</label>
            <select
              id="catalog-filter-type"
              value={typeFilter}
              onChange={(e) => setTypeQuery(e.target.value)}
            >
              <option value="">{zhHant.catalogFilterTypeAll}</option>
              {CATALOG_PRODUCT_TYPE_CODES.map((code) => (
                <option key={code} value={code}>
                  {displayProductType(code)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="catalog-sort">{zhHant.catalogSort}</label>
            <select
              id="catalog-sort"
              value={sortFilter}
              onChange={(e) =>
                setSortQuery(e.target.value as CatalogSortValue)
              }
            >
              <option value="date_asc">{zhHant.catalogSortDateAsc}</option>
              <option value="date_desc">{zhHant.catalogSortDateDesc}</option>
              <option value="price_asc">{zhHant.catalogSortPriceAsc}</option>
              <option value="price_desc">{zhHant.catalogSortPriceDesc}</option>
            </select>
          </div>
        </div>
      </div>

      {err && <p className="error">{err}</p>}
      {loading && !err && (
        <PageLoadingSkeleton variant="catalog" className="catalog-loading" />
      )}

      {!loading && !err && (
        <>
          <ul className="grid">
            {visibleItems.map((item) => (
              <li
                key={item.productId}
                className={`card${item.soldOut ? " card--sold-out" : ""}`}
              >
                <Link href={`/item/${item.productId}`} className="card-link">
                  <div className="card-media">
                    {item.soldOut && (
                      <span className="card-sold-out-badge" aria-hidden>
                        {zhHant.soldOutBadge}
                      </span>
                    )}
                    {primaryImage(item) && (
                      <img
                        src={primaryImage(item) || ""}
                        alt=""
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="card-body">
                    <h2 className="card-title">{displayTitle(item)}</h2>
                    <p className="muted small">
                      {[
                        item.card?.collection,
                        item.card?.rare,
                        displayProductType(item.productType),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="price">{formatPriceUsd(item.listPrice)}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  className="btn"
                  disabled={adding === item.productId || item.soldOut}
                  title={item.soldOut ? zhHant.soldOutAddDisabled : undefined}
                  onClick={() => addToCart(item)}
                >
                  {adding === item.productId ? zhHant.adding : zhHant.addToCart}
                </button>
              </li>
            ))}
          </ul>
          {visibleItems.length === 0 && (
            <p className="muted">{zhHant.noProducts}</p>
          )}
          {nextCursor && (
            <button type="button" className="btn secondary" onClick={loadMore}>
              {zhHant.loadMore}
            </button>
          )}
        </>
      )}
    </div>
  );
}
