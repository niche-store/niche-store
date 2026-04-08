import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        clothes: resolve(__dirname, 'clothes.html'),
        shoes: resolve(__dirname, 'shoes.html'),
        contact: resolve(__dirname, 'contact.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
})