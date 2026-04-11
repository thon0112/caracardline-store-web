/**
 * Traditional Chinese (繁體中文) UI copy — single locale, no i18n framework.
 */
export const zhHant = {
  brand: "Caracardline",
  navSiteAria: "網站導覽",
  navCart: "購物車",
  navHome: "首頁",
  notFound: "找不到頁面。",
  footerCopyright: (year: number) => `© ${year} Caracardline。保留所有權利。`,
  footerContact: "聯絡我們",
  footerPrivacy: "隱私權政策",

  catalogTitle: "商品目錄",
  catalogLede:
    "以下為已上架且有庫存之商品，實際可購數量以各品項標示為準。",
  loadingCatalog: "載入商品目錄中…",
  loadMore: "載入更多",
  addToCart: "加入購物車",
  adding: "加入中…",
  noProducts: "尚無商品。請先上架商品並連結庫存。",
  errLoadCatalog: "無法載入目錄",
  errLoadMore: "無法載入更多",
  errAddToCart: "加入購物車失敗",

  productFallback: "商品",
  productLoading: "載入中…",
  productInvalid: "商品連結無效",
  productNotFound: "找不到商品或暫不提供",
  productBack: "返回",
  productBackCatalog: "返回商品目錄",
  productInStock: "庫存",
  productPsaId: "PSA 編號",
  errAddFailed: "加入失敗",

  cartTitle: "購物車",
  cartLoading: "載入購物車中…",
  cartEmpty: "購物車目前是空的。",
  browseCatalog: "瀏覽商品",
  cartRetry: "重試",
  continueShopping: "繼續購物",
  cartItemOne: "1 件商品",
  cartItemsMany: (n: number) => `${n} 件商品`,
  cartEach: "每件",
  cartAvailable: "可購",
  cartDecreaseAria: "減少數量",
  cartIncreaseAria: "增加數量",
  cartRemove: "移除",
  cartSubtotal: "小計",
  cartCheckoutNote:
    "結帳功能尚未開通——此合計金額僅供參考。",
  errUpdateFailed: "更新失敗",
  errRemoveFailed: "移除失敗",
  errCartLoadFailed: "無法載入購物車",

  /** 400 responses — server may still send English; map known phrases for toasts. */
  apiBadRequestGeneric: "請求無法完成，請稍後再試。",
  apiBadRequestInvalidBody: "送出的資料格式不正確。",
  apiErrorItemUnavailable: "此商品暫無法加入購物車。",
  apiErrorInsufficientQty: "庫存不足，無法使用此數量。",
  apiErrorInvalidLine: "購物車項目無效。",
} as const;

export function formatInStock(quantity: number): string {
  return `${zhHant.productInStock}：${quantity}`;
}

export function formatPriceUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** User-facing copy for HTTP 400 bodies from the store API. */
export function toastTextForBadRequest(message: string): string {
  const m = message.trim();
  if (!m) return zhHant.apiBadRequestGeneric;
  if (m.startsWith("{") || m.includes("formErrors") || m.includes("fieldErrors")) {
    return zhHant.apiBadRequestInvalidBody;
  }
  switch (m) {
    case "item unavailable":
      return zhHant.apiErrorItemUnavailable;
    case "insufficient quantity":
      return zhHant.apiErrorInsufficientQty;
    case "invalid line id":
      return zhHant.apiErrorInvalidLine;
    default:
      return m;
  }
}
