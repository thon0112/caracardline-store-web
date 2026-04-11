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

export type CatalogListItem = {
  productId: string;
  slug: string;
  title: string;
  description: string | null;
  listPrice: number;
  availableQuantity: number;
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

/** Cart line payload mirrors `GET /api/carts/:id` catalog entries (stock may be hidden). */
export type CartCatalogItem = Omit<CatalogListItem, "availableQuantity"> & {
  availableQuantity?: number;
  hideQuantity?: boolean;
};

export type CartLine = {
  lineId: string;
  quantity: number;
  catalog: CartCatalogItem;
};

export type CartResponse = {
  cartId: string;
  items: CartLine[];
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
}): Promise<CatalogResponse> {
  const u = new URL("/api/catalog", window.location.origin);
  if (params.limit) u.searchParams.set("limit", String(params.limit));
  if (params.cursor) u.searchParams.set("cursor", params.cursor);
  const url = apiPath(u.pathname + u.search);
  logApi("GET", url);
  const res = await fetch(url);
  await throwIfNotOk(res);
  return res.json() as Promise<CatalogResponse>;
}

export async function fetchCatalogItem(
  productId: string,
): Promise<CatalogListItem> {
  const path = `/api/catalog/item/${encodeURIComponent(productId)}`;
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
  return res.json() as Promise<CartResponse>;
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
