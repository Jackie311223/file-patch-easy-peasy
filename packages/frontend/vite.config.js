import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Nếu có dùng Tailwind v2, bạn mới cần plugin; còn v3+ chỉ cần postcss config
    // tailwindcss(),
  ],
  base: '/', 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5179,
    allowedHosts: [
      '5177-im95q5721ceke4hzzcm6v-bc096365.manusvm.computer',
      '5176-i9dn3qcjm6xmvprypblh7-bc096365.manusvm.computer',
      // nếu có hostname mới cho port 5179, thêm vào đây
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
});
