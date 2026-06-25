import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/chapter')) {
            const match = id.match(/chapter(\d)/);
            if (match) return `chapter${match[1]}`;
          }
        }
      }
    }
  }
});
