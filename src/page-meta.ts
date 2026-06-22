import type { CatalogListItem } from "./api.js";
import { collectProductImageUrls, displayTitle } from "./catalog-helpers.js";
import type { DocumentMeta } from "./document-meta.js";
import {
  type CatalogProductTypeCode,
  zhHant,
} from "./locale/zh-Hant.js";
import { buildProductDescription } from "./product-schema.js";
import {
  formatPageTitle,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from "./site-seo.js";

/** Static pages — replace PLACEHOLDER strings with your final SEO copy. */
export const PAGE_META = {
  home: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    canonicalPath: "/",
  },
  catalog: {
    title: formatPageTitle("所有商品"),
    canonicalPath: "/catalog",
  },
  catalogBoosterBox: {
    title: formatPageTitle("PTCG原盒"),
    canonicalPath: "/catalog/booster_box",
  },
  catalogCard: {
    title: formatPageTitle("單卡 & 鑑定卡"),
    canonicalPath: "/catalog/card",
  },
  catalogAccessory: {
    title: formatPageTitle("周邊產品"),
    canonicalPath: "/catalog/accessory",
  },
  catalogCardPool: {
    title: formatPageTitle("卡拉福袋"),
    canonicalPath: "/catalog/card_pool",
  },
  about: {
    title: formatPageTitle("關於我們"),
    description: "關於我們：卡拉卡LINE是一家專業的卡牌修復、卡牌回收、卡牌買賣、代鑑代收等。",
    canonicalPath: "/about",
  },
  services: {
    title: formatPageTitle("其他服務"),
    description: "其他服務：包括卡牌修復、卡牌回收、卡牌買賣、代鑑代收等。",
    canonicalPath: "/services",
  },
  cardRepair: {
    title: formatPageTitle("專業卡牌修復"),
    description: "專業卡片修復服務：精修摺痕、壓痕、白邊、白點及各種損傷。針對各類卡片損壞進行細緻還原，讓您的收藏品重現完美品相。",
    canonicalPath: "/card-repair",
  },
  disclaimer: {
    title: formatPageTitle("免責聲明"),
    canonicalPath: "/disclaimer",
  },
  shipping: {
    title: formatPageTitle(zhHant.shippingPolicyTitle),
    canonicalPath: "/shipping",
  },
  refund: {
    title: formatPageTitle(zhHant.refundPolicyTitle),
    canonicalPath: "/refund",
  },
  cart: {
    title: formatPageTitle(zhHant.cartTitle),
    canonicalPath: "/cart",
    noindex: true,
  },
  checkout: {
    title: formatPageTitle(zhHant.checkoutTitle),
    canonicalPath: "/checkout",
    noindex: true,
  },
  account: {
    title: formatPageTitle(zhHant.accountTitle),
    canonicalPath: "/account",
    noindex: true,
  },
  track: {
    title: formatPageTitle(zhHant.trackOrderTitle),
    canonicalPath: "/track",
    noindex: true,
  },
  order: {
    title: formatPageTitle(zhHant.orderTitle),
    canonicalPath: "/order",
    noindex: true,
  },
  notFound: {
    title: formatPageTitle(zhHant.notFound),
    canonicalPath: "/",
    noindex: true,
  },
  productLoading: {
    title: formatPageTitle(zhHant.productFallback),
    description: SITE_DESCRIPTION,
    canonicalPath: "/catalog",
  },
} as const satisfies Record<string, DocumentMeta>;

export function catalogPageMeta(
  q: string,
  typeCode: CatalogProductTypeCode | "",
): DocumentMeta {
  if (q.trim()) return catalogSearchMeta(q);
  switch (typeCode) {
    case "booster_box":
      return PAGE_META.catalogBoosterBox;
    case "card":
      return PAGE_META.catalogCard;
    case "accessory":
      return PAGE_META.catalogAccessory;
    case "card_pool":
      return PAGE_META.catalogCardPool;
    default:
      return PAGE_META.catalog;
  }
}

export function catalogSearchMeta(query: string): DocumentMeta {
  const q = query.trim();
  return {
    title: formatPageTitle(zhHant.catalogSearchMetaTitle(q)),
    description: zhHant.catalogSearchMetaDescription(q),
    canonicalPath: `/catalog?q=${encodeURIComponent(q)}`,
  };
}

export function productMeta(data: CatalogListItem): DocumentMeta {
  const images = collectProductImageUrls(data);
  return {
    title: formatPageTitle(displayTitle(data)),
    description: buildProductDescription(data),
    canonicalPath: `/item/${encodeURIComponent(data.slug.trim())}`,
    ogImage: images[0],
    ogType: "product",
  };
}
