# caracardline-store-web

Standalone Vite + React storefront (split from the monorepo’s `apps/store-web`). It talks to the Cloudflare Worker API via `VITE_API_URL` in production; in dev, `/api` is proxied to `VITE_DEV_API_URL` or `http://127.0.0.1:8787`.

## Local

```bash
npm install
npm run dev
```

## Cloudflare Pages

- **Root directory:** `/` (this repo root)
- **Build command:** `npm run build`
- **Output:** `dist`
- Set **`VITE_API_URL`** to your Worker origin (no trailing slash).

If you use **`SKIP_DEPENDENCY_INSTALL=1`**, use build command **`npm run build:cf`**.

## Syncing from the monorepo

Source of truth for the app in the big repo is `apps/store-web/`. After changing it, copy updated files into this repo and commit here, or merge manually.

This folder lives under the monorepo path but is **gitignored** there so it can keep its **own** `.git` and remote without nesting inside the parent repository.

To publish only this app: `cd caracardline-store-web`, add a GitHub remote, and push.
