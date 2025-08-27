import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  envPrefix: 'VITE_',
  server: {
    host: '0.0.0.0',
    port: 5180,
    hmr: {
      port: 5180,
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    cors: true,
    strictPort: false
  }
});
