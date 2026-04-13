/**
 * Traditional Chinese (繁體中文) UI copy — single locale, no i18n framework.
 */
export const zhHant = {
  brand: "Caracardline",
  navSiteAria: "網站導覽",
  navCart: "購物車",
  navHome: "首頁",
  navCatalog: "商品目錄",
  /** Instagram @cara.cardline — opens in a new tab */
  navInstagramAria:
    "Instagram：開啟 Caracardline 官方帳號（新視窗）",
  navInstagram: "Instagram",
  navMenuOpen: "開啟選單",
  navMenuClose: "關閉選單",
  navDrawerAria: "網站選單",
  navDrawerClose: "關閉選單",
  notFound: "找不到頁面。",
  footerCopyright: (year: number) => `© ${year} Caracardline。保留所有權利。`,
  footerNavAria: "頁尾連結",
  footerContact: "聯絡我們",
  footerPrivacy: "隱私權政策",
  footerAbout: "關於我們",

  aboutTitle: "關於我們",
  aboutLede:
    "Caracardline 專注於收藏卡與相關商品的策展與販售，希望為同好提供清楚標示、可信來源的購物體驗。",
  aboutWhoTitle: "我們是誰",
  aboutWhoP1:
    "團隊成員本身也是卡牌收藏者，熟悉鑑定、品相與市場常見流程。我們以小而精的選品為起點，逐步擴充目錄，並維持庫存與價格資訊的即時更新。",
  aboutWhoP2:
    "以下內容為範例文案，實際公司介紹、地址與客服管道請日後替換為正式版本。",
  aboutMissionTitle: "我們在意的事",
  aboutMissionP1:
    "透明：商品狀態與可購數量盡量清楚呈現。穩妥：訂單與付款流程簡潔，減少來回確認。尊重：您的聯絡與訂單資料僅用於履行訂單與必要客服聯繫。",
  aboutContactTitle: "聯絡方式",
  aboutContactP1:
    "若有批發、鑑定合作或其他商務洽詢，歡迎透過網站頁尾「聯絡我們」與我們聯繫（此為範例說明）。",
  aboutBackCatalog: "返回商品目錄",

  catalogTitle: "商品目錄",

  homeGroupOther: "其他",
  homeViewAll: "查看全部",
  homeFullCatalog: "瀏覽完整目錄",
  homeBannerAria: "主視覺圖片輪播",
  homeBannerPrev: "上一張橫幅",
  homeBannerNext: "下一張橫幅",
  homeBannerDots: "選擇橫幅",
  homeBannerSlide: "橫幅",
  homeRailHint: "可左右滑動瀏覽",
  catalogStockHidden: "庫存數量未公開",
  /** Full-page / main view while data is loading */
  loadingPage: "載入中...",
  loadMore: "載入更多",
  addToCart: "加入購物車",
  /** Shown briefly after a product is added from listing or detail. */
  addToCartSuccess: "已成功加入購物車。",
  adding: "加入中…",
  noProducts: "尚無商品。請先上架商品並連結庫存。",
  errLoadCatalog: "無法載入目錄",
  errLoadMore: "無法載入更多",
  errAddToCart: "加入購物車失敗",

  productFallback: "商品",
  productInvalid: "商品連結無效",
  productNotFound: "找不到商品或暫不提供",
  productBack: "返回",
  productBackCatalog: "返回商品目錄",
  productInStock: "庫存",
  productPsaId: "PSA 編號",
  errAddFailed: "加入失敗",

  cartTitle: "購物車",
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
  cartCheckoutNote: "確認商品後可前往結帳。",
  cartGoCheckout: "前往結帳",
  errUpdateFailed: "更新失敗",
  errRemoveFailed: "移除失敗",
  errCartLoadFailed: "無法載入購物車",

  /** 400 responses — server may still send English; map known phrases for toasts. */
  apiBadRequestGeneric: "請求無法完成，請稍後再試。",
  apiBadRequestInvalidBody: "送出的資料格式不正確。",
  apiErrorItemUnavailable: "此商品暫無法加入購物車。",
  apiErrorInsufficientQty: "庫存不足，無法使用此數量。",
  apiErrorInvalidLine: "購物車項目無效。",
  apiErrorCartEmpty: "購物車是空的，無法建立訂單。",
  apiErrorInvalidOrderStatus: "訂單狀態不允許此操作。",
  apiErrorCartNotFound: "找不到購物車。",

  checkoutTitle: "結帳",
  checkoutLede:
    "目前僅送香港。請填寫電子郵件、電話與香港境內收貨地址（其餘欄位可選填或稍後再補）。完成後將為您暫留庫存並顯示轉帳資訊。",
  checkoutOrderPreview: "訂單預覽",
  checkoutEmail: "電子郵件（必填）",
  checkoutEmailRequired: "請填寫電子郵件。",
  checkoutShipName: "收件人姓名",
  checkoutShipPhone: "電話（必填）",
  checkoutPhoneRequired: "請填寫電話。",
  checkoutShipLine1: "地址第一行",
  checkoutShipLine2: "地址第二行（選填）",
  checkoutShipCountry: "國家／地區（僅香港）",
  /** Shown in readonly country field; API still uses ISO code HK. */
  checkoutShipCountryHongKongDisplay: "香港（HK）",
  checkoutFpsNote: "送出後訂單即成立，請依訂單頁指示以 FPS 轉帳；款項核對後我們會處理出貨。",
  checkoutSubmit: "建立訂單",
  checkoutSubmitting: "建立中…",
  checkoutPlaceFailed: "無法建立訂單",
  backToCart: "返回購物車",

  orderTitle: "訂單",
  orderInvalidId: "訂單編號無效。",
  orderNotFound: "找不到此訂單。",
  orderLoadFailed: "無法載入訂單",
  orderRef: "訂單編號",
  orderStatus: "狀態：",
  orderStatusAwaitingPayment: "待付款（請轉帳）",
  orderStatusAwaitingConfirmation: "已通知轉帳，待核對入數",
  orderStatusExpired: "已過期（庫存已釋放）",
  orderStatusPaid: "已付款",
  orderHoldUntil: "庫存暫留至",
  orderExpiredHint: "若您已轉帳，請聯絡客服並提供訂單編號與入數證明。",
  orderItems: "訂單明細",
  orderAmountDue: "應付總額",
  fpsTitle: "FPS 轉帳",
  fpsInstructions: "請使用「轉數快」轉入以下帳戶，並在備註填寫訂單編號以便對帳。",
  fpsPayExact: "請轉帳剛好",
  fpsMemoHint: "轉帳備註請填：",
  fpsReceiverLabel: "收款 FPS ID / 電話",
  fpsReceiverUnset: "請於網站環境變數設定 VITE_FPS_RECEIVER_ID 以顯示收款資訊。",
  orderMarkTransferred: "我已完成轉帳",
  orderPaymentSubmitting: "送出中…",
  orderPaymentSubmittedToast: "已記錄，我們會盡快核對入數。",
  orderPaymentSubmitFailed: "無法更新狀態",
  orderAwaitingConfirmationHint: "我們收到通知後會核對銀行入數；通過後會再與您聯絡。",
} as const;

export function homeRailAriaLabel(groupName: string): string {
  return `「${groupName}」，${zhHant.homeRailHint}`;
}

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
    case "cart is empty":
      return zhHant.apiErrorCartEmpty;
    case "invalid order status":
      return zhHant.apiErrorInvalidOrderStatus;
    case "cart not found":
      return zhHant.apiErrorCartNotFound;
    case "invalid order id":
      return zhHant.orderInvalidId;
    default:
      return m;
  }
}
