import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/reports/Leaderboard';
import StudentReport from './pages/reports/StudentReport';
import CompanyReport from './pages/reports/CompanyReport';
import BranchReport from './pages/reports/BranchReport';
import BatchReport from './pages/reports/BatchReport';
import CompanyList from './pages/companies/CompanyList';
import CompanyDetail from './pages/companies/CompanyDetail';
import OfferList from './pages/offers/OfferList';
import OfferDetail from './pages/offers/OfferDetail';
import SubmitOffer from './pages/SubmitOffer';
import Profile from './pages/Profile';
import UserManagement from './pages/admin/UserManagement';
import AdminSettings from './pages/admin/AdminSettings';
import { useAuthStore } from './store';
import PlacementChatbot from './pages/PlacementChatbot';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="card text-center py-20">
        <div className="text-error text-lg font-bold mb-2">Access Denied</div>
        <p className="text-gray-500 text-sm">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
}

// 🔄 Loading spinner shown while session is being restored
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading your session…</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isLoading, restoreSession, user, isAuthenticated } = useAuthStore();
  // Restore JWT session on app boot
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isLoading) return <AuthLoading />;

  return (
    <BrowserRouter>
      {isAuthenticated && user?.role === 'Student' && <PlacementChatbot />}
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Reports */}
          <Route path="reports">
            <Route path="leaderboard" element={<Leaderboard />} />

            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Faculty']}>
                  <StudentReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="companies"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Faculty']}>
                  <CompanyReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="branches"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Faculty']}>
                  <BranchReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="batches"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Faculty']}>
                  <BatchReport />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Companies */}
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/:id" element={<CompanyDetail />} />

          {/* Offers */}
          <Route path="offers" element={<OfferList />} />
          <Route path="offers/:id" element={<OfferDetail />} />

          {/* Submit Offer */}
          <Route path="submit-offer" element={<SubmitOffer />} />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />

          {/* Admin */}
          <Route path="admin">
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}