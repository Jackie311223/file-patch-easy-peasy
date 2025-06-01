import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

import ErrorBoundary from './components/common/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import { PropertiesProvider } from './contexts/PropertiesContext';
import { RoomTypesProvider } from './contexts/RoomTypesContext';
import { BookingsProvider } from './contexts/BookingsContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PropertiesPage from './pages/Properties/PropertiesPage';
import PropertyDetailPage from './pages/Properties/PropertyDetailPage';
import RoomTypesPage from './pages/RoomTypes/RoomTypesPage';
import BookingsPage from './pages/Bookings/BookingsPage';
import CalendarPage from './pages/Calendar/CalendarPage';
import InboxPage from './pages/Inbox/InboxPage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import InvoicesPage from './pages/Invoices/InvoiceListPage';
import InvoiceDetailPage from './pages/Invoices/InvoiceDetailPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Component bảo vệ route
function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  
  console.log("PrivateRoute check - Auth:", isAuthenticated, "Loading:", loading);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Đảm bảo chuyển hướng đến /login nếu chưa đăng nhập
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <div>
      <h1>Trang đăng nhập</h1>
      <form>
        <div>
          <label>Email</label>
          <input type="text" placeholder="Email" />
        </div>
        <div>
          <label>Password</label>
          <input type="password" placeholder="Password" /> 
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}

export default App;