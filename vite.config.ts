import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const api = process.env.VITE_DEV_API_URL ?? "http://127.0.0.1:8787";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [],
    },
  },
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
