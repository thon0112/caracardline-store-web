import { WHATSAPP_CHAT_URL } from "./components/WhatsAppFloat";

/**
 * Home hero image slider — assets from cdn.caracardline.com.
 */
export const homeBannerSlides = [
  {
    id: "slide-banner-6",
    src: "https://cdn.caracardline.com/assets/1776263425636-49754c0823dc4d2f-banner-6.webp",
    alt: "首頁主視覺一",
    href: "https://www.instagram.com/p/DUkR1geExWx/?img_index=1",
  },
  {
    id: "slide-banner-5",
    src: "https://cdn.caracardline.com/assets/1776263426485-7b88f59fc5f32b19-banner-5.webp",
    alt: "首頁主視覺二",
    href: WHATSAPP_CHAT_URL,
  },
  {
    id: "slide-banner-4",
    src: "https://cdn.caracardline.com/assets/1776263427398-eb9a061d08742ce8-banner-4.webp",
    alt: "首頁主視覺三",
    href: "https://www.instagram.com/p/DRUPiTOE91z",
  },
] as const;
