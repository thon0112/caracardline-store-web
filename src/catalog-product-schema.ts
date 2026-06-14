import type { CatalogListItem } from "./api.js";
import {
  collectProductImageUrls,
  displayTitle,
  storefrontListingCategory,
} from "./catalog-helpers.js";
import {
  displayProductType,
  normalizeCatalogTypeFilter,
} from "./locale/zh-Hant.js";
import { BRAND_NAME, SITE_ORIGIN, type JsonLd } from "./site-seo.js";
import { buildMerchantReturnPolicy } from "./merchant-return-policy.js";
import { buildOfferShippingDetails } from "./offer-shipping-details.js";

/** Manufacturer brand for PTCG / Pokemon products (Google global identifier). */
const PTCG_MANUFACTURER_BRAND = "Pokemon";

export function schemaProductBrand(data: CatalogListItem): string {
  const code = normalizeCatalogTypeFilter(
    storefrontListingCategory(data) || data.productType,
  );
  if (code === "card" || code === "booster_box" || code === "card_pool") {
    return PTCG_MANUFACTURER_BRAND;
  }
  return BRAND_NAME;
}

/** MPN paired with brand when no GTIN is available. */
export function schemaProductMpn(data: CatalogListItem): string {
  if (data.psaId?.trim()) return data.psaId.trim();
  if (data.card?.id != null) return String(data.card.id);
  return data.productId.trim();
}

export function schemaItemCondition(
  productType: string,
  condition: string | null,
): string {
  const code = normalizeCatalogTypeFilter(productType);
  if (code === "booster_box" || code === "accessory" || code === "card_pool") {
    return "https://schema.org/NewCondition";
  }
  const c = (condition ?? "").trim().toUpperCase();
  if (!c || c === "NEW" || c === "SEALED" || c === "MINT") {
    return "https://schema.org/NewCondition";
  }
  return "https://schema.org/UsedCondition";
}

export function buildProductDescription(data: CatalogListItem): string {
  if (data.description?.trim()) return data.description.trim();

  const parts = [
    displayTitle(data),
    data.card?.collection,
    data.card?.rare,
    data.condition,
    displayProductType(
      storefrontListingCategory(data) || data.productType,
    ),
  ].filter((p): p is string => typeof p === "string" && p.trim().length > 0);

  const joined = parts.join(" · ").trim();
  if (joined) return joined;

  const title = displayTitle(data).trim() || data.title.trim();
  return title || BRAND_NAME;
}

function buildAdditionalProperties(
  data: CatalogListItem,
): JsonLd[] | undefined {
  const props: JsonLd[] = [];

  if (data.psaId?.trim()) {
    props.push({
      "@type": "PropertyValue",
      name: "PSA Certification Number",
      value: data.psaId.trim(),
    });
  }
  if (data.card?.collection?.trim()) {
    props.push({
      "@type": "PropertyValue",
      name: "Collection",
      value: data.card.collection.trim(),
    });
  }
  if (data.card?.rare?.trim()) {
    props.push({
      "@type": "PropertyValue",
      name: "Rarity",
      value: data.card.rare.trim(),
    });
  }
  if (data.condition?.trim()) {
    props.push({
      "@type": "PropertyValue",
      name: "Condition",
      value: data.condition.trim(),
    });
  }

  return props.length > 0 ? props : undefined;
}

export function productPageUrl(slug: string): string {
  return `${SITE_ORIGIN}/item/${encodeURIComponent(slug.trim())}`;
}

export function buildProductOfferJsonLd(
  data: CatalogListItem,
  options?: { sellerId?: string },
): JsonLd {
  const url = productPageUrl(data.slug);

  return {
    "@type": "Offer",
    url,
    priceCurrency: "HKD",
    price: data.listPrice.toFixed(2),
    availability: data.soldOut
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock",
    itemCondition: schemaItemCondition(data.productType, data.condition),
    seller: options?.sellerId
      ? { "@id": options.sellerId }
      : {
          "@type": "Organization",
          name: BRAND_NAME,
          url: SITE_ORIGIN,
        },
    hasMerchantReturnPolicy: buildMerchantReturnPolicy(),
    shippingDetails: buildOfferShippingDetails(),
  };
}

export function buildCatalogProductJsonLd(
  data: CatalogListItem,
  options?: { sellerId?: string; productId?: string },
): JsonLd {
  const images = collectProductImageUrls(data);
  const url = productPageUrl(data.slug);
  const categoryLabel = displayProductType(
    storefrontListingCategory(data) || data.productType,
  );
  const productId = options?.productId ?? `${url}#product`;

  return {
    "@type": "Product",
    "@id": productId,
    name: displayTitle(data),
    url,
    sku: data.productId.trim(),
    mpn: schemaProductMpn(data),
    description: buildProductDescription(data),
    brand: {
      "@type": "Brand",
      name: schemaProductBrand(data),
    },
    category: categoryLabel || undefined,
    image:
      images.length === 1
        ? images[0]
        : images.length > 1
          ? images
          : undefined,
    offers: buildProductOfferJsonLd(data, options),
    additionalProperty: buildAdditionalProperties(data),
  };
}
