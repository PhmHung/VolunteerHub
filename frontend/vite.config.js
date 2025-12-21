import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["hd1.png", "hd3.png", "mask-icon.svg"],
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,

        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg}"],

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes("/api/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-data-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === "https://images.unsplash.com" ||
              url.origin === "https://res.cloudinary.com",
            handler: "CacheFirst",
            options: {
              cacheName: "external-images-cache",
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style" ||
              request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "static-resources-cache",
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "VolunteerHub",
        short_name: "VolunteerHub",
        description: "Nền tảng kết nối tình nguyện viên",
        theme_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],

  // ✅ THÊM PHẦN NÀY ĐỂ FIX Firebase Popup (COOP)
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      // Nếu bạn (hoặc lib nào đó) có set COEP, thì nên nới/tắt trong dev:
      // "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },

  build: {
    chunkSizeWarningLimit: 3000,
  },
});
