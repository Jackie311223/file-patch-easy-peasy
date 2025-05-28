/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Path to setup file
    // Optional: Configure coverage
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/vite-env.d.ts',
        'src/main.tsx', // Exclude main entry point
        'src/App.tsx', // Exclude App component if not testing directly
        'src/mock/', // Exclude mock data
        'src/types/', // Exclude type definitions
        'src/contexts/', // Exclude contexts if tested indirectly or separately
        'src/hooks/', // Exclude hooks if tested indirectly or separately
        'src/pages/', // Exclude pages if testing components individually
        'src/components/layout/', // Exclude layout components if not testing directly
        'src/components/common/PlaceholderPage.tsx', // Exclude placeholders
        // Add other files/folders to exclude as needed
      ],
    },
  },
});

