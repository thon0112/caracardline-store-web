import { SITE_ORIGIN, type JsonLd } from "./site-seo.js";

/** Matches `/refund` — used as `@id` for cross-page policy references. */
export const MERCHANT_RETURN_POLICY_ID = `${SITE_ORIGIN}/refund#return-policy`;

const RETURN_POLICY_URL = `${SITE_ORIGIN}/refund`;

/**
 * Store-wide return policy for Product/Offer JSON-LD.
 * Aligned with the refund policy page (7-day window; collectibles may have exceptions).
 *
 * Emit this object once per page `@graph`. Offers / Organization should link via
 * {@link merchantReturnPolicyRef} to avoid duplicate fields under a shared `@id`.
 */
export function buildMerchantReturnPolicy(): JsonLd {
  return {
    "@type": "MerchantReturnPolicy",
    "@id": MERCHANT_RETURN_POLICY_ID,
    url: RETURN_POLICY_URL,
    applicableCountry: "HK",
    returnPolicyCategory:
      "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  };
}

/** `@id` pointer for hasMerchantReturnPolicy — pair with one full graph node. */
export function merchantReturnPolicyRef(): JsonLd {
  return { "@id": MERCHANT_RETURN_POLICY_ID };
}
