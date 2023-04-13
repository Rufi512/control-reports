import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
