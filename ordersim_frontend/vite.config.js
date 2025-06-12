import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite dev server is configured to run on port 5000 (instead of the default 5173 or 3001)
 * To run frontend, use: npm run dev
 * Then open: http://localhost:5000
 * 
 * Port 5000 is used to avoid conflicts and for easier exposure.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000, // Changed from 3001 to 5000 as per user request
    proxy: {
      // You can proxy API requests if needed (if CORS disabled on backend)
    }
  }
})
