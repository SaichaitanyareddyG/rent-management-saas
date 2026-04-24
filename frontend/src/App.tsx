/**
 * Main App Component
 * Routing for Admin (protected) and Public (tenant payment) flows
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { TenantsPage } from './pages/admin/TenantsPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { PropertiesPage } from './pages/admin/PropertiesPage';
import { RoomsPage } from './pages/admin/RoomsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { TenantPaymentPage } from './pages/public/TenantPaymentPage';
import { PaymentSuccessPage } from './pages/public/PaymentSuccessPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route element={<PublicLayout />}>
          <Route path="/pay/:tenantId" element={<TenantPaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
        </Route>

        {/* Admin Routes (Protected) */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
