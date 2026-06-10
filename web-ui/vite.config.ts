import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Dev server proxies /api to the Node API so the SPA and API share an origin.
// API_TARGET lets you point at the dockerised API (http://localhost:3000 by default).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.API_TARGET ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
