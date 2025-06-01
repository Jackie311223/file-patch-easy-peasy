import { defineConfig } from 'vitest/config'; // Thay đổi import để có type checking tốt hơn cho cấu hình test
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  base: '/', 
  resolve: {
    // Alias này dùng cho Vite dev server và build
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
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: { // Cấu hình cho Vitest
    globals: true,
    environment: 'jsdom', // Hoặc 'happy-dom'
    setupFiles: './src/test/setup.ts', // Đường dẫn tới file setup test của bạn (nếu có)
    
    // Thêm alias vào đây một cách tường minh cho Vitest nếu nó không tự nhận từ cấu hình chung
    // Điều này đảm bảo Vitest cũng hiểu được '@/' trỏ đến 'src/'
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }
});

// npx vitest run