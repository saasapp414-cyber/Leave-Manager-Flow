import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import LeavesPage from '@/pages/LeavesPage';
import ApprovalsPage from '@/pages/ApprovalsPage';
import EmployeesPage from '@/pages/EmployeesPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import OrganizationPage from '@/pages/OrganizationPage';
import NotFoundPage from '@/pages/NotFoundPage';
import "@/index.css";

function AppRoutes() {
  useAuth();
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: '12px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leaves" element={<LeavesPage />} />
          <Route path="approvals" element={
            <ProtectedRoute roles={['manager','hr_admin','super_admin']}>
              <ApprovalsPage />
            </ProtectedRoute>
          } />
          <Route path="employees" element={
            <ProtectedRoute roles={['hr_admin','super_admin']}>
              <EmployeesPage />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute roles={['hr_admin','super_admin']}>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="organization" element={
            <ProtectedRoute roles={['super_admin']}>
              <OrganizationPage />
            </ProtectedRoute>
          } />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
