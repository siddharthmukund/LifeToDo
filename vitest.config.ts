import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],

    test: {
        // Environment
        environment: 'jsdom',

        // Setup files
        setupFiles: ['./tests/setup/vitest.setup.ts'],

        // Coverage
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.config.ts',
                'src/**/index.ts',
                'src/**/__tests__/**',
                'src/**/*.test.{ts,tsx}',
                'src/**/*.spec.{ts,tsx}',
            ],
            thresholds: {
                statements: 85,
                branches: 80,
                functions: 85,
                lines: 85,
            },
        },

        // Globals
        globals: true,

        // Watch mode
        watch: false,

        // Reporters
        reporters: ['verbose'],

        // Timeout
        testTimeout: 10000,
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@tests': path.resolve(__dirname, './tests')
        }
    }
});
