import type { CatalogListItem } from "./api.js";
import { displayTitle, storefrontListingCategory } from "./catalog-helpers.js";
import { displayProductType, zhHant } from "./locale/zh-Hant.js";
import { SITE_ORIGIN, type JsonLd } from "./site-seo.js";
import {
  buildCatalogProductJsonLd,
  productPageUrl,
} from "./catalog-product-schema.js";

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

export { buildProductDescription } from "./catalog-product-schema.js";

export function buildProductJsonLd(
  data: CatalogListItem,
  catalogListHref: string,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildBreadcrumbJsonLd(data, catalogListHref),
      buildCatalogProductJsonLd(data),
    ],
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
