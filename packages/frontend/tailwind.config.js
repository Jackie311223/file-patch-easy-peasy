/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all relevant files in src
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D47A1', // Deep Blue
          light: '#1565C0',
          dark: '#0A3880',
        },
        secondary: {
          DEFAULT: '#607D8B', // Blue Grey
          light: '#90A4AE',
          dark: '#455A64',
        },
        success: {
          DEFAULT: '#2E7D32', // Green
          light: '#4CAF50',
          dark: '#1B5E20',
        },
        warning: {
          DEFAULT: '#FF8F00', // Amber
          light: '#FFC107',
          dark: '#E65100',
        },
        error: {
          DEFAULT: '#C62828', // Red
          light: '#EF5350',
          dark: '#B71C1C',
        },
        background: {
          DEFAULT: '#FFFFFF', // White
          subtle: '#F5F7FA', // Light Grey
          muted: '#ECEFF1', // Grey (Borders/Dividers)
        },
        text: {
          DEFAULT: '#212121', // Near Black
          secondary: '#616161', // Dark Grey
          muted: '#9E9E9E', // Medium Grey (Placeholders)
          onDark: '#FFFFFF', // White
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Set Inter as default sans-serif
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.3', fontWeight: '700' }], // Bold
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '700' }], // Bold
        'h3': ['20px', { lineHeight: '1.3', fontWeight: '600' }], // SemiBold
        'h4': ['16px', { lineHeight: '1.3', fontWeight: '600' }], // SemiBold
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }], // Regular
        'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }], // Regular
        'body-sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }], // Regular
        'button': ['14px', { lineHeight: '1', fontWeight: '500' }], // Medium, line height 1 for buttons
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      borderRadius: {
        'DEFAULT': '4px', // Default border radius
        'md': '4px', // Explicitly name it
        'lg': '8px', // Larger radius for modals/cards
      },
    },
  },
  plugins: [],
}

