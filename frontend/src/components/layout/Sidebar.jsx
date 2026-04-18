import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BarChart2, Building2, Briefcase,
  Upload, Settings, Users, ChevronLeft, ChevronRight,
  GraduationCap, TrendingUp, BookOpen, Calendar,
} from 'lucide-react';
import { useAuthStore } from '../../store';

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    label: 'Reports',
    icon: BarChart2,
    children: [
      { label: 'Leaderboard', icon: TrendingUp, path: '/reports/leaderboard' },
      { label: 'Student-wise', icon: GraduationCap, path: '/reports/students' },
      { label: 'Company-wise', icon: Building2, path: '/reports/companies' },
      { label: 'Branch-wise', icon: BookOpen, path: '/reports/branches' },
      { label: 'Batch-wise', icon: Calendar, path: '/reports/batches' },
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
  const [expandedGroups, setExpandedGroups] = useState(['Reports']);
  const { user } = useAuthStore();

  // 🔥 ROLE FIX
  const role = user?.role?.toLowerCase();

  // 🔥 CRITICAL FIX (THIS WAS MISSING → CAUSED BLANK PAGE)
  const filteredItems = navItems.filter(item =>
    !item.roles || item.roles.map(r => r.toLowerCase()).includes(role)
  );

  const toggleGroup = (label) => {
    setExpandedGroups(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  return (
    <aside
      className={`h-screen bg-primary flex flex-col fixed left-0 top-0 z-40 shadow-2xl
      ${collapsed ? 'w-16' : 'w-64'}`}
    >

      {/* LOGO */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
          VNR
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm">VNRVJIET</div>
            <div className="text-white/60 text-xs">Placement Portal</div>
          </div>
        )}
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredItems.map((item) => {
          if (item.children) {
            const isExpanded = expandedGroups.includes(item.label);

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
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
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
              className="sidebar-link flex items-center gap-2"
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* COLLAPSE */}
      <div className="border-t p-2">
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
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user.name?.[0] || 'U'}
          </div>
          {!collapsed && (
            <div>
              <div className="text-white text-xs font-semibold">{user.name}</div>
              <div className="text-white/50 text-xs">{user.role}</div>
            </div>
          )}
        </div>
      )}

    </aside>
  );
}