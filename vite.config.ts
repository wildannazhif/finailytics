
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Konfigurasi ini membantu jika ada masalah dengan path relatif atau HMR
    fs: {
      strict: true,
    },
    // Pastikan port tidak bentrok jika perlu
    // port: 3000, 
  },
  base: "/finailytics/",
  // Vite akan memproses index.html di root secara default
  // dan menangani environment variables melalui import.meta.env
})
