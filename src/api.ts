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
  if (!res.ok) throw new Error(`catalog ${res.status}`);
  return res.json() as Promise<CatalogResponse>;
}

export async function fetchCatalogItem(
  productId: string,
): Promise<CatalogListItem> {
  const path = `/api/catalog/item/${encodeURIComponent(productId)}`;
  const url = apiPath(path);
  logApi("GET", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`item ${res.status}`);
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
  if (!res.ok) throw new Error(`create cart ${res.status}`);
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
  if (!res.ok) throw new Error(`add to cart ${res.status}`);
}
