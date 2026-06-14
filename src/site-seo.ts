export const SITE_ORIGIN = "https://caracardline.com";
export const BRAND_NAME = "卡拉卡LINE";

export const SITE_TITLE = "卡拉卡LINE | PTCG香港專賣店";
export const SITE_DESCRIPTION =
  "卡拉卡LINE提供精選 PTCG 熱門卡牌販售，更有專業卡牌維修技術與 PSA 代鑑代收服務";
export const DEFAULT_OG_IMAGE =
  "https://cdn.caracardline.com/assets/1777702272466-e6194867f588f029-og.webp";
export const SITE_LOGO_URL =
  "https://cdn.caracardline.com/assets/logo-with-text.webp";

export type JsonLd = Record<string, unknown>;

export function formatPageTitle(pageTitle?: string): string {
  if (!pageTitle) return SITE_TITLE;
  const trimmed = pageTitle.trim();
  return `${trimmed} | ${BRAND_NAME}`;
}

export function pageCanonical(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}
