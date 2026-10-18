import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  // GitHub Pages serves this project from /V5/, so relative asset URLs are required.
  base: './',
  plugins: [viteSingleFile()],
  build: {
    // Keep the public directory available in dev, but publish only assets
    // referenced by the built page (copied by the post-build script).
    copyPublicDir: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  }
})
