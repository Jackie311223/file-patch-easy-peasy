import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const baseURL = '/api'; // Thay vì http://localhost:3001

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      [baseURL]: {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(new RegExp(`^${baseURL}`), '')
      }
    }
  }
});