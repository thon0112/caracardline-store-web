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
