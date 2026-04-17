import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { cloudflare } from "@cloudflare/vite-plugin";

const api = process.env.VITE_DEV_API_URL ?? "http://127.0.0.1:8787";

export default defineConfig({
  plugins: [tailwindcss(), react(), cloudflare()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: api,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5174,
  },
});