import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'icons/*.png'],
      manifest: {
        name: 'Menovitta 4.0',
        short_name: 'Menovitta',
        description: 'Saúde e bem-estar para mulheres 40+',
        theme_color: '#B76E79',
        background_color: '#F9F9F9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Garante que rotas SPA funcionem quando app está instalado como PWA
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // CRÍTICO: ativa o novo service worker IMEDIATAMENTE sem esperar
        // fechar todas as abas — garante que usuárias recebam updates na hora
        skipWaiting: true,
        clientsClaim: true,
      }
    })
  ],
})
