import { WHATSAPP_CHAT_URL } from "./components/WhatsAppFloat.js";
import { zhHant } from "./locale/zh-Hant.js";
import { BRAND_NAME, SITE_ORIGIN, type JsonLd } from "./site-seo.js";

const CARD_REPAIR_PATH = "/card-repair";
const CARD_REPAIR_URL = `${SITE_ORIGIN}${CARD_REPAIR_PATH}`;
const HERO_IMAGE_URL =
  "https://cdn.caracardline.com/assets/1780582479414-4238e26fe63f0393-fix-step.webp";

export type CardRepairGalleryItem = {
  id: string;
  title: string;
  beforeUrl: string;
  afterUrl: string;
  note?: string | null;
};

function buildBreadcrumbJsonLd(): JsonLd {
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
        name: zhHant.navOtherServices,
        item: `${SITE_ORIGIN}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: zhHant.cardRepairTitle,
        item: CARD_REPAIR_URL,
      },
    ],
  };
}

function buildGalleryItemListJsonLd(
  gallery: CardRepairGalleryItem[],
): JsonLd | undefined {
  if (gallery.length === 0) return undefined;

  return {
    "@type": "ItemList",
    name: zhHant.cardRepairStepsTitle,
    itemListElement: gallery.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "ImageObject",
        name: item.title,
        description: item.note?.trim() || undefined,
        contentUrl: item.afterUrl,
        thumbnailUrl: item.beforeUrl,
      },
    })),
  };
}

function buildServiceDescription(): string {
  return [
    zhHant.cardRepairLede,
    zhHant.cardRepairPricePeriod,
    zhHant.cardRepairPriceNote,
    zhHant.cardRepairNote1,
    zhHant.cardRepairNote2,
    zhHant.cardRepairNote3,
  ].join(" ");
}

export function buildCardRepairJsonLd(
  gallery: CardRepairGalleryItem[],
): JsonLd {
  const galleryImages = gallery.flatMap((item) => [item.beforeUrl, item.afterUrl]);
  const images = [HERO_IMAGE_URL, ...galleryImages];

  const service: JsonLd = {
    "@type": "Service",
    "@id": `${CARD_REPAIR_URL}#service`,
    name: zhHant.cardRepairTitle,
    description: buildServiceDescription(),
    url: CARD_REPAIR_URL,
    serviceType: "Trading card repair and restoration",
    image: images,
    provider: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: SITE_ORIGIN,
    },
    areaServed: {
      "@type": "Country",
      name: "Hong Kong",
    },
    offers: {
      "@type": "Offer",
      url: CARD_REPAIR_URL,
      priceCurrency: "HKD",
      price: "300.00",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: "300.00",
        priceCurrency: "HKD",
      },
      availability: "https://schema.org/InStock",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: WHATSAPP_CHAT_URL,
      servicePhone: "+85255053984",
      availableLanguage: ["zh-Hant"],
    },
    potentialAction: {
      "@type": "CommunicateAction",
      name: zhHant.cardRepairCtaWhatsApp,
      target: WHATSAPP_CHAT_URL,
    },
  };

  const graph: JsonLd[] = [
    buildBreadcrumbJsonLd(),
    service,
    {
      "@type": "WebPage",
      "@id": CARD_REPAIR_URL,
      url: CARD_REPAIR_URL,
      name: zhHant.cardRepairTitle,
      description: zhHant.cardRepairLede,
      isPartOf: {
        "@type": "WebSite",
        name: BRAND_NAME,
        url: SITE_ORIGIN,
      },
      about: { "@id": `${CARD_REPAIR_URL}#service` },
      primaryImageOfPage: HERO_IMAGE_URL,
    },
  ];

  const galleryList = buildGalleryItemListJsonLd(gallery);
  if (galleryList) graph.push(galleryList);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function CardRepairJsonLd({
  gallery,
}: {
  gallery: CardRepairGalleryItem[];
}) {
  const jsonLd = buildCardRepairJsonLd(gallery);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
