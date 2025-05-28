import React, { lazy, Suspense } from 'react';
import Spinner from "@/ui/Loading/Spinner";

// Example of lazy-loaded components
const LazyCalendarPage = lazy(() => import('../pages/Calendar/CalendarPage'));
const LazyPaymentsPage = lazy(() => import('../pages/Payments/PaymentsPage'));
const LazyInvoiceListPage = lazy(() => import('../pages/Invoices/InvoiceListPage'));
const LazyInboxPage = lazy(() => import('../pages/Inbox/InboxPage'));

interface LazyLoadComponentProps {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
}

export const LazyLoadComponent: React.FC<LazyLoadComponentProps> = ({
  component: Component,
  props = {},
  fallback = <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>,
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Example usage in routes
export const lazyRoutes = [
  {
    path: '/calendar',
    element: <LazyLoadComponent component={LazyCalendarPage} />,
  },
  {
    path: '/payments',
    element: <LazyLoadComponent component={LazyPaymentsPage} />,
  },
  {
    path: '/invoices',
    element: <LazyLoadComponent component={LazyInvoiceListPage} />,
  },
  {
    path: '/inbox',
    element: <LazyLoadComponent component={LazyInboxPage} />,
  },
];
