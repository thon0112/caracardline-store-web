const debugApi =
  import.meta.env.DEV ||
  import.meta.env.VITE_DEBUG_API === "1" ||
  import.meta.env.VITE_DEBUG_API === "true";

function logApi(method: string, url: string) {
  if (debugApi) console.debug(`[api] ${method}`, url);
}

function apiPath(path: string) {
  const prefix = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  // When set, always use it (local dev can hit the deployed worker; prod Pages build must set this).
  if (prefix) return `${prefix}${path}`;
  // Dev without VITE_API_URL: same-origin /api → Vite proxy (see vite.config.ts).
  return path;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

/** Mirrors store-worker `buildCatalogListItem` / catalog JSON. */
export type CatalogListItem = {
  productId: string;
  /** ISO timestamp; used by `/api/catalog` cursor pagination. */
  createdAt: string;
  slug: string;
  title: string;
  description: string | null;
  listPrice: number;
  /** Mirrors store-worker: not purchasable (listed after in-stock items). */
  soldOut: boolean;
  hideQuantity: boolean;
  /** Omitted when `hideQuantity` is true. */
  availableQuantity?: number;
  productType: string;
  condition: string | null;
  psaId: string | null;
  imageUrls: string[] | null;
  card: {
    id: number;
    name: string;
    collection: string | null;
    image: string | null;
    largeImage: string | null;
    rare: string | null;
  } | null;
};

/** Cart line payload mirrors `GET /api/carts/:id` catalog entries. */
export type CartCatalogItem = CatalogListItem;

export type CartLine = {
  lineId: string;
  quantity: number;
  catalog: CartCatalogItem;
};

/** Mirrors store-worker GET `/api/carts/:cartId` `pricing` field. */
export type CartPricing = {
  merchandiseSubtotal: number;
  discountTotal: number;
  totalDue: number;
  couponCode: string | null;
  couponCapExhausted?: boolean;
};

export type CartResponse = {
  cartId: string;
  items: CartLine[];
  pricing: CartPricing;
};

export async function readApiErrorMessage(res: Response): Promise<string> {
  try {
    const j: unknown = await res.json();
    if (j && typeof j === "object" && "error" in j) {
      const err = (j as { error: unknown }).error;
      if (typeof err === "string") return err;
      if (err && typeof err === "object") return JSON.stringify(err);
    }
  } catch {
    /* ignore */
  }
  return `request failed (${res.status})`;
}

async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;
  throw new ApiError(await readApiErrorMessage(res), res.status);
}

export function isNotFoundError(e: unknown): boolean {
  return isApiError(e) && e.status === 404;
}

export type CatalogResponse = {
  items: CatalogListItem[];
  nextCursor: string | null;
};

export async function fetchCatalog(params: {
  limit?: number;
  cursor?: string;
  /** When set, passed as `productType` (store-worker may filter server-side). */
  productType?: string;
  /** `date_asc` | `date_desc` | `price_asc` | `price_desc` */
  sort?: string;
  /** `in_stock` → store-worker `availability=in_stock` (purchasable only). */
  availability?: "all" | "in_stock";
  highlight?: boolean; // get items by each productType
}): Promise<CatalogResponse> {
  const u = new URL("/api/catalog", window.location.origin);
  if (params.limit) u.searchParams.set("limit", String(params.limit));
  if (params.cursor) u.searchParams.set("cursor", params.cursor);
  if (params.productType)
    u.searchParams.set("productType", params.productType);
  if (params.sort) u.searchParams.set("sort", params.sort);
  if (params.availability === "in_stock")
    u.searchParams.set("availability", "in_stock");
  if (params.highlight) u.searchParams.set("highlight", "true");
  const url = apiPath(u.pathname + u.search);
  logApi("GET", url);
  const res = await fetch(url);
  await throwIfNotOk(res);
  return res.json() as Promise<CatalogResponse>;
}

/** Keyword search; mirrors `GET /api/catalog/search` (store-worker). */
export async function fetchCatalogSearch(params: {
  q: string;
  limit?: number;
  cursor?: string;
  availability?: "all" | "in_stock";
}): Promise<CatalogResponse> {
  const u = new URL("/api/catalog/search", window.location.origin);
  u.searchParams.set("q", params.q);
  if (params.limit) u.searchParams.set("limit", String(params.limit));
  if (params.cursor) u.searchParams.set("cursor", params.cursor);
  if (params.availability === "in_stock")
    u.searchParams.set("availability", "in_stock");
  const url = apiPath(u.pathname + u.search);
  logApi("GET", url);
  const res = await fetch(url);
  await throwIfNotOk(res);
  return res.json() as Promise<CatalogResponse>;
}

/** Resolves by URL slug or legacy product UUID (`GET /api/catalog/item/:idOrSlug`). */
export async function fetchCatalogItem(slugOrId: string): Promise<CatalogListItem> {
  const path = `/api/catalog/item/${encodeURIComponent(slugOrId)}`;
  const url = apiPath(path);
  logApi("GET", url);
  const res = await fetch(url);
  await throwIfNotOk(res);
  return res.json() as Promise<CatalogListItem>;
}

export async function createCart(): Promise<{ cartId: string }> {
  const path = "/api/carts";
  const url = apiPath(path);
  logApi("POST", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  await throwIfNotOk(res);
  return res.json() as Promise<{ cartId: string }>;
}

export async function addCartItem(
  cartId: string,
  body: { productId: string; quantity?: number },
): Promise<void> {
  const path = `/api/carts/${cartId}/items`;
  const url = apiPath(path);
  logApi("POST", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await throwIfNotOk(res);
}

export async function fetchCart(cartId: string): Promise<CartResponse> {
  const path = `/api/carts/${encodeURIComponent(cartId)}`;
  const url = apiPath(path);
  logApi("GET", url);
  const res = await fetch(url);
  await throwIfNotOk(res);
  const raw = (await res.json()) as Partial<CartResponse>;
  const items = raw.items ?? [];
  const ms = items.reduce(
    (s, line) => s + line.quantity * line.catalog.listPrice,
    0,
  );
  const pricing: CartPricing =
    raw.pricing ??
    ({
      merchandiseSubtotal: ms,
      discountTotal: 0,
      totalDue: ms,
      couponCode: null,
    } satisfies CartPricing);
  return { cartId: raw.cartId!, items, pricing };
}

export async function applyCartCoupon(
  cartId: string,
  body: { code: string },
): Promise<CartResponse> {
  const path = `/api/carts/${encodeURIComponent(cartId)}/coupon`;
  const url = apiPath(path);
  logApi("POST", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await throwIfNotOk(res);
  const raw = (await res.json()) as Partial<CartResponse>;
  const items = raw.items ?? [];
  const ms = items.reduce(
    (s, line) => s + line.quantity * line.catalog.listPrice,
    0,
  );
  const pricing: CartPricing =
    raw.pricing ??
    ({
      merchandiseSubtotal: ms,
      discountTotal: 0,
      totalDue: ms,
      couponCode: null,
    } satisfies CartPricing);
  return { cartId: raw.cartId!, items, pricing };
}

export async function removeCartCoupon(cartId: string): Promise<CartResponse> {
  const path = `/api/carts/${encodeURIComponent(cartId)}/coupon`;
  const url = apiPath(path);
  logApi("DELETE", url);
  const res = await fetch(url, { method: "DELETE" });
  await throwIfNotOk(res);
  const raw = (await res.json()) as Partial<CartResponse>;
  const items = raw.items ?? [];
  const ms = items.reduce(
    (s, line) => s + line.quantity * line.catalog.listPrice,
    0,
  );
  const pricing: CartPricing =
    raw.pricing ??
    ({
      merchandiseSubtotal: ms,
      discountTotal: 0,
      totalDue: ms,
      couponCode: null,
    } satisfies CartPricing);
  return { cartId: raw.cartId!, items, pricing };
}

export async function patchCartLineQuantity(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<void> {
  const path = `/api/carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(lineId)}`;
  const url = apiPath(path);
  logApi("PATCH", url);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  await throwIfNotOk(res);
}

export async function deleteCartLine(
  cartId: string,
  lineId: string,
): Promise<void> {
  const path = `/api/carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(lineId)}`;
  const url = apiPath(path);
  logApi("DELETE", url);
  const res = await fetch(url, { method: "DELETE" });
  await throwIfNotOk(res);
}

export type PlaceOrderBody = {
  cartId: string;
  email?: string;
  shipRecipientName?: string;
  shipPhone: string;
  shipAddressLine1?: string;
  shipAddressLine2?: string;
  shipCity?: string;
  shipRegion?: string;
  shipPostalCode?: string;
  shipCountry?: string;
};

export type PlaceOrderResponse = {
  orderId: string;
  status: string;
  reservationExpiresAt: string;
};

export async function placeOrder(body: PlaceOrderBody): Promise<PlaceOrderResponse> {
  const path = "/api/orders";
  const url = apiPath(path);
  logApi("POST", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await throwIfNotOk(res);
  return res.json() as Promise<PlaceOrderResponse>;
}

export type OrderLineItem = {
  productId: string;
  slug: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type OrderDetailResponse = {
  orderId: string;
  status: string;
  email: string | null;
  shipRecipientName: string | null;
  shipPhone: string | null;
  shipAddressLine1: string | null;
  shipAddressLine2: string | null;
  shipCity: string | null;
  shipRegion: string | null;
  shipPostalCode: string | null;
  shipCountry: string | null;
  /** Set when staff records carrier (e.g. SF Express). */
  shipCarrier: string | null;
  /** Waybill / tracking number when shipped. */
  shipTrackingNumber: string | null;
  createdAt: string;
  reservationExpiresAt: string | null;
  merchandiseSubtotal?: number;
  discountTotal?: number;
  totalDue?: number;
  couponCode?: string | null;
  items: OrderLineItem[];
};

export async function fetchOrder(orderId: string): Promise<OrderDetailResponse> {
  const path = `/api/orders/${encodeURIComponent(orderId)}`;
  const url = apiPath(path);
  logApi("GET", url);
  const res = await fetch(url);
  await throwIfNotOk(res);
  return res.json() as Promise<OrderDetailResponse>;
}

export type LookupOrdersByEmailResponse = {
  ok: true;
  message: string;
};

/** POST `/api/orders/lookup-by-email` — sends matching order ids to the email (worker). */
export async function lookupOrdersByEmail(
  email: string,
): Promise<LookupOrdersByEmailResponse> {
  const path = "/api/orders/lookup-by-email";
  const url = apiPath(path);
  logApi("POST", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  await throwIfNotOk(res);
  return res.json() as Promise<LookupOrdersByEmailResponse>;
}

export type PaymentSubmittedResponse = {
  orderId: string;
  status: string;
  reservationExpiresAt: string | null;
};

export async function submitPaymentSubmitted(
  orderId: string,
): Promise<PaymentSubmittedResponse> {
  const path = `/api/orders/${encodeURIComponent(orderId)}/payment-submitted`;
  const url = apiPath(path);
  logApi("POST", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  await throwIfNotOk(res);
  return res.json() as Promise<PaymentSubmittedResponse>;
}
