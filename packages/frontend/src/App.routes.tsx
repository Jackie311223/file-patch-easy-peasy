import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropertiesPage from './pages/Properties/PropertiesPage';
import PropertyForm from './components/Properties/PropertyForm';

// Import any other existing components
// ...

const AppRoutes = () => { // Renamed component to avoid conflict with App.tsx
  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        {/* ... */}
        
        {/* Properties module routes */}
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/new" element={<PropertyForm />} />
        <Route path="/properties/:id/edit" element={<PropertyForm />} />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes; // Export renamed component

