import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom'; // Use HashRouter for static hosting
import './index.css'; // Import Tailwind directives
import { AuthProvider } from './hooks/useAuth.tsx'; // Corrected named import
import App from './App'; // Import the main App component (still simplified)

// Get the root element
const rootElement = document.getElementById('root');

// Check if the root element exists before trying to render
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    // Restore Router
    <Router> 
      {/* Restore AuthProvider */}
      <AuthProvider>
        {/* Keep App simplified for now */}
        <App />
      </AuthProvider>
    </Router>
  );
} else {
  // Log an error if the root element is not found
  console.error('Root element with ID "root" not found in the HTML.');
  document.body.innerHTML = '<div style="color: red; font-size: 20px; padding: 20px;">Error: Root element #root not found. Cannot mount React app.</div>';
}

