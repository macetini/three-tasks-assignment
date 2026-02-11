import { defineConfig } from 'vite';

export default defineConfig({
    base: '/three-tasks-assignment/',
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'esnext'
    }
});