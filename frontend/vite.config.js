import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['hd1.png', 'hd3.png', 'mask-icon.svg'], 
      workbox: {
        // --- THÊM DÒNG NÀY ĐỂ SỬA LỖI ---
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // Tăng giới hạn lên 4MB
        // -------------------------------
     
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg}'],

        runtimeCaching: [
          // 0. SPA NAVIGATION: Cache HTML cho offline
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 1. API: StaleWhileRevalidate (cache nhanh + update nền)
          {
            urlPattern: ({ url }) => url.pathname.includes('/api/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-data-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 ngày
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 2. ẢNH: CacheFirst (ưu tiên cache, giảm bandwidth)
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst', 
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 ngày
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 3. ẢNH NGOÀI (Unsplash, Cloudinary...)
          {
            urlPattern: ({ url }) => 
              url.origin === 'https://images.unsplash.com' || 
              url.origin === 'https://res.cloudinary.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-images-cache',
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 24 * 60 * 60 }, // 60 ngày
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 3. FONT & SCRIPT: CacheFirst
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources-cache',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'VolunteerHub',
        short_name: 'VolunteerHub',
        description: 'Nền tảng kết nối tình nguyện viên',
        theme_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  // Tùy chọn: Giúp ẩn cảnh báo file nặng khi build
  build: {
    chunkSizeWarningLimit: 3000,
  }
})