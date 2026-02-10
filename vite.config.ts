// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
    base: './', // This makes all paths relative
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
})