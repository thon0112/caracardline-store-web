import type { CatalogListItem } from "./api.js";
import {
  collectProductImageUrls,
  displayTitle,
  storefrontListingCategory,
} from "./catalog-helpers.js";
import {
  displayProductType,
  normalizeCatalogTypeFilter,
  zhHant,
} from "./locale/zh-Hant.js";
import { BRAND_NAME, SITE_ORIGIN, type JsonLd } from "./site-seo.js";

function productPageUrl(slug: string): string {
  return `${SITE_ORIGIN}/item/${encodeURIComponent(slug.trim())}`;
}

function schemaItemCondition(
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

function buildProductDescription(data: CatalogListItem): string {
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

  return parts.join(" · ");
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

function buildBreadcrumbJsonLd(
  data: CatalogListItem,
  catalogListHref: string,
): JsonLd {
  const categoryCode = storefrontListingCategory(data);
  const catalogLabel = categoryCode
    ? `${zhHant.catalogTitle} · ${displayProductType(categoryCode)}`
    : zhHant.catalogTitle;
  const catalogUrl = catalogListHref.startsWith("http")
    ? catalogListHref
    : `${SITE_ORIGIN}${catalogListHref.startsWith("/") ? catalogListHref : `/${catalogListHref}`}`;

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: zhHant.navHome,
        item: `${SITE_ORIGIN}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: catalogLabel,
        item: catalogUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayTitle(data),
        item: productPageUrl(data.slug),
      },
    ],
  };
}

export function buildProductJsonLd(
  data: CatalogListItem,
  catalogListHref: string,
): JsonLd {
  const images = collectProductImageUrls(data);
  const url = productPageUrl(data.slug);
  const categoryLabel = displayProductType(
    storefrontListingCategory(data) || data.productType,
  );

  const offer: JsonLd = {
    "@type": "Offer",
    url,
    priceCurrency: "HKD",
    price: data.listPrice.toFixed(2),
    availability: data.soldOut
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock",
    itemCondition: schemaItemCondition(data.productType, data.condition),
    seller: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: SITE_ORIGIN,
    },
  };

  const product: JsonLd = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: displayTitle(data),
    url,
    sku: data.productId,
    description: buildProductDescription(data),
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    category: categoryLabel || undefined,
    image: images.length === 1 ? images[0] : images.length > 1 ? images : undefined,
    offers: offer,
    additionalProperty: buildAdditionalProperties(data),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [buildBreadcrumbJsonLd(data, catalogListHref), product],
  };
}

export function ProductJsonLd({
  data,
  catalogListHref,
}: {
  data: CatalogListItem;
  catalogListHref: string;
}) {
  const jsonLd = buildProductJsonLd(data, catalogListHref);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
