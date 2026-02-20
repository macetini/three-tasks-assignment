import { defineConfig } from 'vitest/config';

export default defineConfig({
    base: '/three-tasks-assignment/',
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'esnext'
    },
    // This section is for Vitest
    test: {
        globals: true,           // Allows describe/it/expect without imports
        environment: 'jsdom',    // Fakes the browser for PIXI
        setupFiles: ['./tests/setup.ts'], // The mock file we're about to create
        include: ['tests/**/*.test.ts', 'src/**/*.test.ts'], // Where to look for tests
    },
});