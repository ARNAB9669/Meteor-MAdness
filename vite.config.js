import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cards: resolve(__dirname, 'cards.html'),
        dashboard: resolve(__dirname, 'Dashboard.html'),
        game: resolve(__dirname, 'game.html'),
        rawData: resolve(__dirname, 'Raw_data.html')
      }
    }
  }
})
