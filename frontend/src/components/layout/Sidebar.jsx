import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BarChart2, Building2, Briefcase,
  Upload, Settings, Users, ChevronLeft, ChevronRight,
  GraduationCap, FileText, TrendingUp, BookOpen, Calendar,
} from 'lucide-react';
import { useAuthStore } from '../../store';

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['Admin', 'Staff', 'Faculty', 'Student'],
  },
  {
    label: 'Reports',
    icon: BarChart2,
    roles: ['Admin', 'Staff', 'Faculty'],
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
    roles: ['Admin', 'Staff', 'Faculty', 'Student'],
  },
  {
    label: 'Active Offers',
    icon: Briefcase,
    path: '/offers',
    roles: ['Admin', 'Staff', 'Faculty', 'Student'],
  },
  {
    label: 'Submit Offer Letter',
    icon: Upload,
    path: '/submit-offer',
    roles: ['Admin', 'Staff', 'Student'],
  },
  {
    label: 'My Profile',
    icon: GraduationCap,
    path: '/profile',
    roles: ['Student'],
  },
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
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const toggleGroup = (label) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const filteredItems = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <aside
      className={`h-screen bg-primary flex flex-col sidebar-transition fixed left-0 top-0 z-40 shadow-2xl
        ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo Area */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/10 min-h-[72px] ${collapsed ? 'justify-center' : ''}`}>
        {/* College Monogram */}
        <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg">
          VNR
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight">VNRVJIET</div>
            <div className="text-white/60 text-xs leading-tight">Placement Portal</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredItems.map((item) => {
          if (item.children) {
            const isExpanded = !collapsed && expandedGroups.includes(item.label);
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`sidebar-link w-full ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </>
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 animate-fade-in">
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `sidebar-link text-xs ${isActive ? 'active' : ''}`
                        }
                      >
                        <child.icon size={15} className="flex-shrink-0" />
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
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-link w-full justify-center hover:bg-white/10"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User Badge */}
      {user && (
        <div className={`p-3 border-t border-white/10 ${collapsed ? 'flex justify-center' : 'flex items-center gap-2'}`}>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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
    </aside>
  );
}
