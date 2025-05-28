import React from 'react';

// Utility function to detect touch devices
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Utility function to format date ranges for display
export const formatDateRange = (start: Date, end: Date): string => {
  const startMonth = start.toLocaleString('default', { month: 'short' });
  const endMonth = end.toLocaleString('default', { month: 'short' });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startMonth === endMonth && startYear === endYear) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${startYear}`;
  } else if (startYear === endYear) {
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${startYear}`;
  } else {
    return `${startMonth} ${start.getDate()}, ${startYear} - ${endMonth} ${end.getDate()}, ${endYear}`;
  }
};

// Utility function to calculate number of nights between two dates
export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Utility function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Utility function to get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 border-green-500 text-green-800';
    case 'PENDING':
      return 'bg-amber-100 border-amber-500 text-amber-800';
    case 'CANCELLED':
      return 'bg-red-100 border-red-500 text-red-800';
    case 'CHECKED_IN':
      return 'bg-blue-100 border-blue-500 text-blue-800';
    case 'CHECKED_OUT':
      return 'bg-purple-100 border-purple-500 text-purple-800';
    case 'NO_SHOW':
      return 'bg-gray-100 border-gray-500 text-gray-800';
    default:
      return 'bg-gray-100 border-gray-500 text-gray-800';
  }
};

// Utility function to generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
