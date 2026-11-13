/** National Dex count through Gen 9 (Paldea / Indigo Disk). */
export const NATIONAL_DEX_MAX = 1025;

/**
 * Official artwork by National Dex number (PokeAPI sprites CDN).
 * Returns null when the number is outside the known dex range.
 */
export function pokedexOfficialArtworkUrl(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > NATIONAL_DEX_MAX) return null;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${n}.png`;
}

export function formatPokedexNumber(n: number): string {
  return `#${String(n).padStart(3, "0")}`;
}
