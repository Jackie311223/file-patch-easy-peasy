import React, { lazy, Suspense } from 'react';
// Sửa import Spinner thành LoadingSpinner (named import) và cập nhật tên sử dụng
import { LoadingSpinner } from "@/ui/Loading/Spinner"; 

// Example of lazy-loaded components
const LazyCalendarPage = lazy(() => import('../pages/Calendar/CalendarPage'));
const LazyPaymentsPage = lazy(() => import('../pages/Payments/PaymentsPage'));
const LazyInvoiceListPage = lazy(() => import('../pages/Invoices/InvoiceListPage'));
const LazyInboxPage = lazy(() => import('../pages/Inbox/InboxPage'));
// Thêm các trang khác nếu cần lazy load
// const LazyBookingDetailPage = lazy(() => import('../pages/Bookings/BookingDetailPage'));
// const LazyDashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));


interface LazyLoadComponentProps {
  component: React.ComponentType<any>; // Thành phần được lazy load
  props?: Record<string, any>; // Props tùy chọn cho thành phần
  fallback?: React.ReactNode; // Fallback UI trong khi chờ load
}

export const LazyLoadComponent: React.FC<LazyLoadComponentProps> = ({
  component: Component,
  props = {},
  fallback = (
    <div className="flex justify-center items-center h-full w-full min-h-[200px]"> {/* Đảm bảo fallback có kích thước */}
      <LoadingSpinner size="lg" /> {/* Sử dụng LoadingSpinner */}
    </div>
  ),
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Example usage in routes array for react-router-dom v6+
// Đây chỉ là ví dụ, bạn cần tích hợp vào cấu hình router thực tế của mình
export const lazyAppRoutes = [
  {
    path: '/calendar',
    element: <LazyLoadComponent component={LazyCalendarPage} />,
  },
  {
    path: '/payments',
    element: <LazyLoadComponent component={LazyPaymentsPage} />,
  },
  {
    path: '/invoices', // Giả sử đây là danh sách invoices
    element: <LazyLoadComponent component={LazyInvoiceListPage} />,
  },
  // Nếu bạn có trang chi tiết invoice và muốn lazy load:
  // {
  //   path: '/invoices/:id',
  //   element: <LazyLoadComponent component={lazy(() => import('../pages/Invoices/InvoiceDetailPage'))} />,
  // },
  {
    path: '/inbox',
    element: <LazyLoadComponent component={LazyInboxPage} />,
  },
  // Thêm các route khác ở đây
  // {
  //   path: '/bookings/:id',
  //   element: <LazyLoadComponent component={LazyBookingDetailPage} />,
  // },
  // {
  //   path: '/dashboard',
  //   element: <LazyLoadComponent component={LazyDashboardPage} />,
  // }
];

// Lưu ý: 'lazyRoutes' có thể không phải là cách bạn trực tiếp sử dụng trong App.tsx.
// Thông thường, bạn sẽ import LazyLoadComponent và các LazyComponent (LazyCalendarPage, etc.)
// vào file router chính của bạn (ví dụ: App.tsx hoặc một file định nghĩa routes riêng)
// và sử dụng chúng trong cấu trúc <Routes> của react-router-dom.
// Ví dụ trong App.tsx hoặc router.tsx:
//
// import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import RootLayout from './layouts/RootLayout'; // Ví dụ layout
// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <RootLayout />,
//     children: [
//       { index: true, element: <LazyLoadComponent component={LazyDashboardPage} /> },
//       { path: 'calendar', element: <LazyLoadComponent component={LazyCalendarPage} /> },
//       // ... other lazy routes
//     ]
//   }
// ]);
// const App = () => <RouterProvider router={router} />;