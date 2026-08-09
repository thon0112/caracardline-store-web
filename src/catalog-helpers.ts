import type { CatalogListItem } from "./api.js";
import {
  displayProductType,
  normalizeCatalogTypeFilter,
  type CatalogProductTypeCode,
  zhHant,
} from "./locale/zh-Hant.js";

export function primaryImage(item: CatalogListItem): string | null {
  const fromProduct = item.imageUrls?.[0];
  if (fromProduct) return fromProduct;
  const c = item.card;
  if (!c) return null;
  return c.largeImage || c.image;
}

/** Ordered gallery URLs: primary image precedence, then all `imageUrls` when set. */
export function collectProductImageUrls(item: CatalogListItem): string[] {
  const out: string[] = [];
  const push = (u: string | null | undefined) => {
    const s = typeof u === "string" ? u.trim() : "";
    if (s && !out.includes(s)) out.push(s);
  };
  if (item.imageUrls?.length) {
    for (const u of item.imageUrls) push(u);
    return out;
  }
  const c = item.card;
  if (c) {
    push(c.largeImage);
    push(c.image);
  }
  return out;
}

export function displayTitle(item: CatalogListItem): string {
  return item.title || item.card?.name || zhHant.productFallback;
}

/** True when storefront should show a compare-at strikethrough beside list price. */
export function shouldShowCompareAtPrice(
  compareAtPrice: number | null | undefined,
  listPrice: number,
): compareAtPrice is number {
  return (
    compareAtPrice != null &&
    Number.isFinite(compareAtPrice) &&
    compareAtPrice > listPrice
  );
}

/**
 * Category for rails and `/catalog/:type` — matches store-worker: a linked `card`
 * payload implies 單卡 even when `productType` was mis-set to e.g. `booster_box`.
 */
export function storefrontListingCategory(
  item: CatalogListItem,
): CatalogProductTypeCode | "" {
  const code = normalizeCatalogTypeFilter(item.productType);
  if (code === "accessory") return "accessory";
  if (item.card != null) return "card";
  return code;
}

/** UI label for product type — uses `storefrontListingCategory` when it applies. */
export function displayListingProductType(item: CatalogListItem): string {
  const c = storefrontListingCategory(item);
  return displayProductType(c || item.productType);
}

export function isSingleCardProduct(item: CatalogListItem): boolean {
  return storefrontListingCategory(item) === "card";
}

export function isCardPoolProduct(item: CatalogListItem): boolean {
  return item.productType === "card_pool" && item.pool != null;
}

/** Client-side release check; server still enforces on cart/order. */
export function isCatalogItemReleased(
  item: Pick<CatalogListItem, "releaseAt">,
  nowMs: number = Date.now(),
): boolean {
  const raw = item.releaseAt;
  if (raw == null || raw === "") return true;
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return true;
  return nowMs >= t;
}

/** Max purchasable qty for a catalog row (1–99); singles and card pools cap at 1. */
export function catalogMaxPurchaseQty(
  item: CatalogListItem,
  currentQty = 1,
): number {
  if (isCardPoolProduct(item) || isSingleCardProduct(item)) return 1;
  if (item.soldOut) return Math.max(1, currentQty);
  const stockCap = item.hideQuantity
    ? 99
    : Math.min(99, item.availableQuantity ?? 99);
  return Math.max(1, stockCap);
}

/** PDP / catalog — show qty picker when stock is known and above 1 (not singles or pools). */
export function showProductQtySelector(item: CatalogListItem): boolean {
  if (isCardPoolProduct(item) || isSingleCardProduct(item)) return false;
  if (item.soldOut || item.hideQuantity) return false;
  return (item.availableQuantity ?? 0) > 1;
}
