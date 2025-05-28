import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Import Providers
// import { FilterProvider } from './contexts/FilterContext';
import { PropertiesProvider } from './contexts/PropertiesContext';
import { RoomTypesProvider } from './contexts/RoomTypesContext';
import { BookingsProvider } from './contexts/BookingsContext';

// Import Layout and Pages (Keep most commented out)
// import Layout from './components/Layout';
// import DashboardPage from './pages/Dashboard/DashboardPage';
import LoginPage from './pages/LoginPage'; // Dummy component
// import PropertiesPage from './pages/Properties/PropertiesPage';
// import PropertyDetailPage from './pages/Properties/PropertyDetailPage';
// import RoomTypesPage from './pages/RoomTypes/RoomTypesPage';
// import BookingsPage from './pages/Bookings/BookingsPage';
// import CalendarPage from './pages/Calendar/CalendarPage';
// import InboxPage from './pages/Inbox/InboxPage';
// import PaymentsPage from './pages/Payments/PaymentsPage';
// import InvoicesPage from './pages/Invoices/InvoiceListPage';
// import InvoiceDetailPage from './pages/Invoices/InvoiceDetailPage';
// import SettingsPage from './pages/Settings/SettingsPage';

// Import Error Boundary
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* <FilterProvider> */}
        <PropertiesProvider>
          <RoomTypesProvider>
            <BookingsProvider>
              <Routes>
                {/* Only keep the login route active for now */}
                <Route path="/login" element={<LoginPage />} />

                {/* Keep other routes commented out */}
                {/* <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="properties" element={<PropertiesPage />} />
                  <Route path="properties/:id" element={<PropertyDetailPage />} />
                  <Route path="room-types" element={<RoomTypesPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="inbox" element={<InboxPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="invoices" element={<InvoicesPage />} />
                  <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} /> 
                </Route> */}

                {/* Add a fallback route to redirect to login if no other route matches */}
                 <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <Toaster />
            </BookingsProvider>
          </RoomTypesProvider>
        </PropertiesProvider>
      {/* </FilterProvider> */}
    </ErrorBoundary>
  );
}

export default App;
