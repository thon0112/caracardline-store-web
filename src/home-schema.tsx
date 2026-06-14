import type { CatalogListItem } from "./api.js";
import { zhHant } from "./locale/zh-Hant.js";
import { WHATSAPP_CHAT_URL } from "./components/WhatsAppFloat.js";
import { buildCatalogProductJsonLd } from "./catalog-product-schema.js";
import {
  BRAND_NAME,
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_LOGO_URL,
  SITE_ORIGIN,
  SITE_TITLE,
  type JsonLd,
} from "./site-seo.js";
import { buildMerchantReturnPolicy } from "./merchant-return-policy.js";

const HOME_URL = `${SITE_ORIGIN}/`;
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
const WEBPAGE_ID = `${HOME_URL}#webpage`;
const STORE_ID = `${SITE_ORIGIN}/#store`;

const INSTAGRAM_URL = "https://www.instagram.com/cara.cardline/";
const THREADS_URL = "https://www.threads.com/@cara.cardline";

function buildOrganizationJsonLd(): JsonLd {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: BRAND_NAME,
    url: SITE_ORIGIN,
    logo: SITE_LOGO_URL,
    image: DEFAULT_OG_IMAGE,
    description: SITE_DESCRIPTION,
    sameAs: [INSTAGRAM_URL, THREADS_URL],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["zh-Hant"],
      url: WHATSAPP_CHAT_URL,
    },
    hasMerchantReturnPolicy: buildMerchantReturnPolicy(),
  };
}

function buildWebSiteJsonLd(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_ORIGIN,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "zh-Hant",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_ORIGIN}/catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function buildWebPageJsonLd(): JsonLd {
  return {
    "@type": "WebPage",
    "@id": WEBPAGE_ID,
    url: HOME_URL,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    primaryImageOfPage: DEFAULT_OG_IMAGE,
    inLanguage: "zh-Hant",
  };
}

function buildOnlineStoreJsonLd(): JsonLd {
  return {
    "@type": "OnlineStore",
    "@id": STORE_ID,
    name: BRAND_NAME,
    url: SITE_ORIGIN,
    image: DEFAULT_OG_IMAGE,
    description: SITE_DESCRIPTION,
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Hong Kong",
    },
    parentOrganization: { "@id": ORGANIZATION_ID },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: zhHant.catalogTitle,
      url: `${SITE_ORIGIN}/catalog`,
    },
  };
}

function buildFeaturedProductJsonLd(item: CatalogListItem): JsonLd {
  return buildCatalogProductJsonLd(item, { sellerId: ORGANIZATION_ID });
}

function buildFeaturedItemListJsonLd(
  items: CatalogListItem[],
): JsonLd | undefined {
  if (items.length === 0) return undefined;

  return {
    "@type": "ItemList",
    name: "精選商品",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: buildFeaturedProductJsonLd(item),
    })),
  };
}

export function buildHomeJsonLd(items: CatalogListItem[]): JsonLd {
  const graph: JsonLd[] = [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    buildWebPageJsonLd(),
    buildOnlineStoreJsonLd(),
  ];

  const featured = buildFeaturedItemListJsonLd(items);
  if (featured) graph.push(featured);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function HomeJsonLd({ items }: { items: CatalogListItem[] }) {
  const jsonLd = buildHomeJsonLd(items);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
