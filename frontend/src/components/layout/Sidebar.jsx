import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BarChart2, Building2, Briefcase,
  Upload, Settings, Users, ChevronLeft, ChevronRight,
  GraduationCap, TrendingUp, BookOpen, Calendar, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '../../store';

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    label: 'Leaderboard',
    icon: TrendingUp,
    path: '/reports/leaderboard',
  },
  {
    label: 'Reports',
    icon: BarChart2,
    roles: ['Admin', 'Faculty'],
    children: [
      { label: 'Student-wise', icon: GraduationCap, path: '/reports/students', roles: ['Admin', 'Faculty'] },
      { label: 'Company-wise', icon: Building2, path: '/reports/companies', roles: ['Admin', 'Faculty'] },
      { label: 'Branch-wise', icon: BookOpen, path: '/reports/branches', roles: ['Admin', 'Faculty'] },
      { label: 'Batch-wise', icon: Calendar, path: '/reports/batches', roles: ['Admin', 'Faculty'] },
    ],
  },
  {
    label: 'Company Details',
    icon: Building2,
    path: '/companies',
  },
  {
    label: 'Active Offers',
    icon: Briefcase,
    path: '/offers',
  },
  {
    label: 'Submit Offer Letter',
    icon: Upload,
    path: '/submit-offer',
  },
  {
    label: 'My Profile',
    icon: GraduationCap,
    path: '/profile',
  },

  // ADMIN ONLY
  {
    label: 'User Management',
    icon: Users,
    path: '/admin/users',
    roles: ['Admin'],
  },
  {
    label: 'Settings',
    icon: Settings,
    path: '/admin/settings',
    roles: ['Admin'],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(['Reports']);
  const { user } = useAuthStore();

  const role = user?.role;

  // Filter top-level items by role
  const filteredItems = navItems.filter(item =>
    !item.roles || item.roles.includes(role)
  );

  const toggleGroup = (label) => {
    setExpandedGroups(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const sidebarContent = (
    <>
      {/* LOGO */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
          VNR
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm">VNRVJIET</div>
            <div className="text-white/60 text-xs">Placement Portal</div>
          </div>
        )}
        {/* Mobile close button */}
        <button className="lg:hidden ml-auto text-white/60 hover:text-white" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredItems.map((item) => {
          if (item.children) {
            const isExpanded = expandedGroups.includes(item.label);
            // Filter children by role
            const visibleChildren = item.children.filter(child =>
              !child.roles || child.roles.includes(role)
            );

            if (visibleChildren.length === 0) return null;

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className="sidebar-link w-full flex items-center gap-2"
                >
                  <item.icon size={18} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight
                        size={14}
                        className={isExpanded ? 'rotate-90' : ''}
                      />
                    </>
                  )}
                </button>

                {isExpanded && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {visibleChildren.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        className="sidebar-link text-xs flex items-center gap-2"
                      >
                        <child.icon size={15} />
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="sidebar-link flex items-center gap-2"
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* COLLAPSE (desktop only) */}
      <div className="border-t p-2 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-link w-full flex items-center justify-center"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* USER */}
      {user && (
        <div className="p-3 border-t flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name?.[0] || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user.name}</div>
              <div className="text-white/50 text-xs">{user.role}</div>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`h-screen bg-primary flex flex-col fixed left-0 top-0 z-40 shadow-2xl transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}