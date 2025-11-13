import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // If your repo is named 'coupon', keep this. If different, change the string accordingly.
  base: '/coupon/',
  plugins: [react()],
  build: {
    target: 'es2018',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true
  },
  test: {
    environment: 'jsdom'
  }
});