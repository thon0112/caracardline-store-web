import { SITE_ORIGIN, type JsonLd } from "./site-seo.js";

/** Matches `/shipping` — used as `@id` for cross-page policy references. */
export const OFFER_SHIPPING_DETAILS_ID = `${SITE_ORIGIN}/shipping#shipping-policy`;

const SHIPPING_POLICY_URL = `${SITE_ORIGIN}/shipping`;

/**
 * Store-wide HK shipping for Product/Offer JSON-LD.
 * Aligned with /shipping: SF Express, 1–3 business-day handling, freight collect (到付).
 * `maxValue` reflects typical local SF Express rates paid on delivery.
 *
 * Emit this object once per page `@graph`. Offers should link via
 * {@link offerShippingDetailsRef} so shared `@id` nodes do not merge duplicate
 * `shippingRate` / `deliveryTime` (Search Console Merchant listings issue).
 */
export function buildOfferShippingDetails(): JsonLd {
  return {
    "@type": "OfferShippingDetails",
    "@id": OFFER_SHIPPING_DETAILS_ID,
    url: SHIPPING_POLICY_URL,
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "HK",
    },
    shippingRate: {
      "@type": "MonetaryAmount",
      currency: "HKD",
      maxValue: 50,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
    },
  };
}

/** `@id` pointer for Offer.shippingDetails — pair with one full graph node. */
export function offerShippingDetailsRef(): JsonLd {
  return { "@id": OFFER_SHIPPING_DETAILS_ID };
}
