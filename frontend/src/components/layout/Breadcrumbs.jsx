import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels = {
  dashboard: 'Dashboard',
  reports: 'Reports',
  leaderboard: 'Leaderboard',
  students: 'Student-wise',
  companies: 'Companies',
  branches: 'Branch-wise',
  batches: 'Batch-wise',
  offers: 'Active Offers',
  'submit-offer': 'Submit Offer Letter',
  profile: 'My Profile',
  admin: 'Admin',
  users: 'User Management',
  settings: 'Settings',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === 'login') return null;

  // Build breadcrumb paths
  const crumbs = [{ label: 'Home', path: '/dashboard' }];
  let cumPath = '';

  for (const seg of segments) {
    cumPath += `/${seg}`;
    const label =
      routeLabels[seg] ||
      (seg.length > 8 ? `${seg.slice(0, 6)}...` : seg);

    crumbs.push({ label, path: cumPath });
  }

  return (
    <nav className="flex items-center gap-1 text-sm mb-5">
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={`${crumb.path}-${idx}`}>
          {idx > 0 && (
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
          )}

          {idx === crumbs.length - 1 ? (
            <span className="text-primary font-semibold">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              {idx === 0 && <Home size={13} />}
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}