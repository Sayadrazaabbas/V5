import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  // GitHub Pages serves this project from /V5/, so relative asset URLs are required.
  base: './',
  plugins: [viteSingleFile()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  }
})
