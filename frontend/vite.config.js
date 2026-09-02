import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El puerto 5401 es el que usa el curso; 5173 ya está ocupado en la máquina del director.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5401,
    strictPort: true,
  },
})
