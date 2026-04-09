/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production Worker origin, e.g. https://api.example.com (no trailing slash). */
  readonly VITE_API_URL?: string;
  /** Set to "1" or "true" to log each API URL in the browser console (production builds too). */
  readonly VITE_DEBUG_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
