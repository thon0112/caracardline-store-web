import { WHATSAPP_CHAT_URL } from "./components/WhatsAppFloat";

/**
 * Home hero image slider — assets from cdn.caracardline.com.
 */
export const homeBannerSlides = [
  {
    id: "slide-banner-6",
    src: "https://cdn.caracardline.com/assets/1776263425636-49754c0823dc4d2f-banner-6.webp",
    alt: "專業卡牌維修服務",
    href: "/card-repair",
  },
  {
    id: "slide-banner-5",
    src: "https://cdn.caracardline.com/assets/1781256172807-22dcf8925e83cf0f-web-site.webp",
    alt: "PSA 代鑑服務",
    href: WHATSAPP_CHAT_URL,
  },
  {
    id: "slide-banner-4",
    src: "https://cdn.caracardline.com/assets/1776263427398-eb9a061d08742ce8-banner-4.webp",
    alt: "PSA驗真假",
    href: "https://www.instagram.com/p/DRUPiTOE91z",
  },
] as const;
