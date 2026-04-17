/**
 * Stops PostCSS from walking up to the monorepo root `postcss.config.js`, which
 * registers Tailwind v3 and breaks Tailwind v4 (`@import "tailwindcss"` via
 * `@tailwindcss/vite`).
 */
export default {
  plugins: [],
};
