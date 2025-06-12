import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite dev server is configured to run on port 3001 (instead of the default 5173)
 * To run frontend, use: npm run dev
 * Then open: http://localhost:3001
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Changed from 5173 to 3001 as per user request
    proxy: {
      // You can proxy API requests if needed (if CORS disabled on backend)
    }
  }
})
