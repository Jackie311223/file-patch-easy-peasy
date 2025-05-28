export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const TOAST_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERSISTENT: Infinity,
} as const;

export const EMPTY_STATES = {
  NO_DATA: {
    title: 'No data available',
    description: 'There is no data to display at the moment.',
  },
  NO_RESULTS: {
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you\'re looking for.',
  },
  NO_BOOKINGS: {
    title: 'No bookings yet',
    description: 'Start by creating your first booking.',
  },
  NO_PROPERTIES: {
    title: 'No properties yet',
    description: 'Start by adding your first property.',
  },
  NO_PAYMENTS: {
    title: 'No payments yet',
    description: 'Payments will appear here once they are processed.',
  },
  NO_INVOICES: {
    title: 'No invoices yet',
    description: 'Invoices will appear here once they are created.',
  },
  NO_MESSAGES: {
    title: 'No messages yet',
    description: 'Your messages will appear here.',
  },
  ERROR: {
    title: 'Something went wrong',
    description: 'An error occurred while loading the data. Please try again.',
  },
} as const;

export const LOADING_STATES = {
  INITIAL: 'initial',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

export const Z_INDICES = {
  DROPDOWN: 1000,
  STICKY: 1100,
  FIXED: 1200,
  OVERLAY: 1300,
  MODAL: 1400,
  POPOVER: 1500,
  TOAST: 1600,
  TOOLTIP: 1700,
} as const;
