import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';
import { useAuthStore } from '../../store';

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">
        <Header sidebarWidth="16rem" />
        <main className="flex-1 pt-[72px] p-6 animate-fade-in">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
