import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This exposes the server to your local machine
    port: 5173,      // Ensure this matches the port mapped in your devcontainer.json
    watch: {
      usePolling: true // This is essential for hot-reloading inside Docker volumes
    }
  }
})