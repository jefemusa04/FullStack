import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    // Forzar a Vite a usar una sola copia de React y React-DOM
    dedupe: ['react', 'react-dom'],
  }
});