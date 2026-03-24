import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LicenseExpiredPage from './pages/LicenseExpiredPage';
import LicenseExpiredLoginPage from './pages/LicenseExpiredLoginPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import PosPage from './pages/PosPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import RegistersPage from './pages/RegistersPage';
import CashClosurePage from './pages/CashClosurePage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';
import AccumulatedPage from './pages/AccumulatedPage';
import SuppliersPage from './pages/SuppliersPage';
import UsersPage from './pages/UsersPage';
import TransfersPage from './pages/TransfersPage';
import BackupPage from './pages/BackupPage';
import { useThemeStore } from './store/themeStore';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.licenseExpiresAt && new Date() > new Date(user.licenseExpiresAt)) {
    return <LicenseExpiredPage />;
  }

  return children;
};

function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/license-expired" element={<LicenseExpiredLoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<div className="text-gray-500 text-center mt-20 text-xl">Selecciona una opción del menú</div>} />
          <Route path="pos" element={<PosPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="sales" element={<SalesHistoryPage />} />
          <Route path="registers" element={<RegistersPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="cash-closure" element={<CashClosurePage />} />
          <Route path="accumulated" element={<AccumulatedPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="backups" element={<BackupPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
