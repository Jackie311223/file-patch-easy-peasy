// src/setupTests.ts
import '@testing-library/jest-dom'; // Để sử dụng các matcher như toBeInTheDocument

// Polyfill cho TextEncoder và TextDecoder nếu chúng không có sẵn trong môi trường test global
// Một số thư viện (ví dụ: liên quan đến react-router) có thể cần chúng.
if (typeof global.TextEncoder === 'undefined') {
  try {
    // Sử dụng import() động hoặc require nếu cần để tránh lỗi nếu module không tồn tại
    // trong một số môi trường rất hạn chế, mặc dù 'util' là core module của Node.
    const util = await import('node:util'); // Hoặc 'util'
    global.TextEncoder = util.TextEncoder;
  } catch (e) {
    console.error('Failed to polyfill TextEncoder:', e);
  }
}

if (typeof global.TextDecoder === 'undefined') {
  try {
    const util = await import('node:util'); // Hoặc 'util'
    // @ts-ignore: TextDecoder có thể không được định nghĩa sẵn trên global type
    global.TextDecoder = util.TextDecoder;
  } catch (e) {
    console.error('Failed to polyfill TextDecoder:', e);
  }
}

// Bạn có thể thêm các cài đặt global khác cho test ở đây nếu cần
// Ví dụ:
// import { vi } from 'vitest';
// vi.mock('path/to/module-can-mock-toan-cuc', () => {
//   return {
//     default: vi.fn(),
//     namedExport: vi.fn(),
//   };
// });