import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),VitePWA({ registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png','masked-icon.svg'],
      manifest: {
        name: 'Sistema de registro',
        short_name: 'Sistema MP',
        description: 'Pequeño sistema de registro y control para el area de informatica del ministerio publico',
        theme_color: '#2e3192',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: "any maskable"
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })],
  server:{
    proxy:{
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: false
      },
      '/public/contents/evidences': {
        target: 'http://localhost:3000',
        changeOrigin: false
      },
      '/public/users/avatar': {
        target: 'http://localhost:3000',
        changeOrigin: false
      },
    }
  }
})
