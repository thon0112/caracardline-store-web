import type { CatalogListItem } from "./api.js";
import { zhHant } from "./locale/zh-Hant.js";

export function primaryImage(item: CatalogListItem): string | null {
  const fromProduct = item.imageUrls?.[0];
  if (fromProduct) return fromProduct;
  const c = item.card;
  if (!c) return null;
  return c.largeImage || c.image;
}

export function displayTitle(item: CatalogListItem): string {
  return item.title || item.card?.name || zhHant.productFallback;
}
