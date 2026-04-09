function apiPath(path: string) {
  const prefix = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  if (import.meta.env.DEV) return path;
  if (!prefix) return path;
  return `${prefix}${path}`;
}

export type CatalogListItem = {
  inventoryItemId: number;
  quantity: number;
  listPrice: number;
  condition: string | null;
  card: {
    id: number;
    name: string;
    collection: string | null;
    image: string | null;
    largeImage: string | null;
    rare: string | null;
  };
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
  const res = await fetch(apiPath(u.pathname + u.search));
  if (!res.ok) throw new Error(`catalog ${res.status}`);
  return res.json() as Promise<CatalogResponse>;
}

export async function fetchCatalogItem(
  inventoryItemId: number,
): Promise<CatalogListItem & { psaId: string | null }> {
  const path = `/api/catalog/item/${inventoryItemId}`;
  const res = await fetch(apiPath(path));
  if (!res.ok) throw new Error(`item ${res.status}`);
  return res.json() as Promise<CatalogListItem & { psaId: string | null }>;
}

export async function createCart(): Promise<{ cartId: string }> {
  const path = "/api/carts";
  const res = await fetch(apiPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) throw new Error(`create cart ${res.status}`);
  return res.json() as Promise<{ cartId: string }>;
}

export async function addCartItem(
  cartId: string,
  body: { inventoryItemId: number; quantity?: number },
): Promise<void> {
  const path = `/api/carts/${cartId}/items`;
  const res = await fetch(apiPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`add to cart ${res.status}`);
}
