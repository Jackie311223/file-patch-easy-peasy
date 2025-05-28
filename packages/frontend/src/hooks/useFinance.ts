import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/axios';

// Types
export interface FinanceStats {
  totalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  averageBookingValue: number;
}

export interface PaymentSummary {
  month: string;
  revenue: number;
}

// Query keys
const FINANCE_KEYS = {
  stats: ['finance', 'stats'],
  summary: ['finance', 'summary'],
};

// Fetch finance statistics
export const useFinanceStats = () => {
  return useQuery({
    queryKey: FINANCE_KEYS.stats,
    queryFn: async () => {
      const { data } = await apiClient.get<FinanceStats>('/finance/stats');
      return data;
    },
  });
};

// Fetch payment summary (for charts)
export const usePaymentSummary = (period: 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: [...FINANCE_KEYS.summary, period],
    queryFn: async () => {
      const { data } = await apiClient.get<PaymentSummary[]>(`/finance/summary?period=${period}`);
      return data;
    },
  });
};

// Export default to satisfy import in other files
export default { useFinanceStats, usePaymentSummary };
