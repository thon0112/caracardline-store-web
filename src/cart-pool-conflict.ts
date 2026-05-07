import type { CartLine } from "./api.js";

/** True when this line's pool number has an active claim elsewhere (another buyer / order). */
export function lineHasTakenPoolNumber(line: CartLine): boolean {
  const n = line.poolNumber;
  if (n == null) return false;
  const pool = line.catalog.pool;
  if (!pool) return false;
  return pool.soldNumbers.includes(n);
}

export function cartHasTakenPoolNumbers(lines: CartLine[]): boolean {
  return lines.some(lineHasTakenPoolNumber);
}
