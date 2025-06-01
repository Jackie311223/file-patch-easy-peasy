import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './hooks/useAuth';
import { FilterProvider } from './contexts/FilterContext';
import App from './App';

// Đảm bảo HashRouter đang được sử dụng
// và các routes có dạng /#/login, /#/dashboard, v.v.

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Router>
        <AuthProvider>
          <FilterProvider>
            <App />
          </FilterProvider>
        </AuthProvider>
      </Router>
    </React.StrictMode>
  );
} else {
  // Nếu không tìm thấy #root, tạo phần tử root và gắn vào body
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  ReactDOM.createRoot(newRoot).render(
    <React.StrictMode>
      <Router>
        <AuthProvider>
          <FilterProvider>
            <App />
          </FilterProvider>
        </AuthProvider>
      </Router>
    </React.StrictMode>
  );
}