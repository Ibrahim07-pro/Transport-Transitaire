import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permet d’écouter toutes les interfaces réseau
    port: 5173,
    allowedHosts: [
      'thdg7l-ip-102-180-70-118.tunnelmole.net', // ton host tunnel
      'localhost'
    ],
  },
})
