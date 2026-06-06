import path from 'path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: true,
      },
      plugins: [tailwindcss(), react()],
      build: {
        cssMinify: false,
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
          '@assets': path.resolve(__dirname, 'attached_assets'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        exclude: ['**/node_modules/**', '**/dist/**', '**/tests-e2e/**'],
      }
    };
});
