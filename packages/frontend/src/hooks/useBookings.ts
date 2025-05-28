import { useContext } from 'react';
import { BookingsContext } from '../contexts/BookingsContext';

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};
