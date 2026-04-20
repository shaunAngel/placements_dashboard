import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore, useNotificationStore, useStudentStore, useCompanyStore } from '../../store';

export default function Header({ sidebarWidth }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { students } = useStudentStore();
  const { companies } = useCompanyStore();
  const { notifications, markAsRead, markAllRead, getUnreadCount } = useNotificationStore();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const searchRef = useRef(null);

  const unread = getUnreadCount();

  const student =
    students.find((s) => s.rollNo === user?.rollNo) ||
    students.find((s) => s.email === user?.email);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchResults(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Real search across students, companies, and offers
  const handleSearch = (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults(null); return; }

    const query = q.toLowerCase();

    // Search students by name, rollNo, email
    const matchedStudents = students
      .filter(s =>
        s.name?.toLowerCase().includes(query) ||
        s.rollNo?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query)
      )
      .slice(0, 5);

    // Search companies by name
    const matchedCompanies = companies
      .filter(c =>
        c.companyName?.toLowerCase().includes(query) ||
        c.companySector?.toLowerCase().includes(query)
      )
      .slice(0, 5);

    setSearchResults({
      students: matchedStudents,
      companies: matchedCompanies,
    });
  };

  return (
    <header
      className="fixed top-0 right-0 z-30 h-[72px] bg-white border-b border-border flex items-center justify-between px-3 sm:px-6 shadow-sm left-0 lg:left-64"
    >
      {/* Left: College Name — hidden on mobile to save space */}
      <div className="hidden sm:block pl-8 lg:pl-0">
        <div className="text-primary font-bold text-sm lg:text-base leading-tight">
          Vallurupalli Nageswara Rao Vignana Jyothi Institute
        </div>
        <div className="text-gray-500 text-xs">of Engineering & Technology — Placement Portal</div>
      </div>

      {/* Right: Search + Notif + User */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Global Search */}
        <div className="relative" ref={searchRef}>
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg w-40 sm:w-56 md:w-72 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
          />
          {searchResults && (
            <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-fade-in">
              {searchResults.students.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-muted">Students</div>
                  {searchResults.students.map(s => (
                    <button key={s.rollNo} onClick={() => { setSearchQuery(''); setSearchResults(null); navigate('/reports/leaderboard'); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.rollNo} · {s.branch}</div>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.companies.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-muted">Companies</div>
                  {searchResults.companies.map(c => (
                    <button key={c.companyName} onClick={() => { setSearchQuery(''); setSearchResults(null); navigate('/companies'); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors">
                      {c.companyName}
                    </button>
                  ))}
                </div>
              )}
              {!searchResults.students.length && !searchResults.companies.length && (
                <div className="px-4 py-3 text-sm text-gray-400">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <Bell size={18} className="text-primary" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-primary text-sm">Notifications</span>
                <button onClick={markAllRead} className="text-xs text-accent hover:text-accent-dark font-medium">Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="text-sm text-gray-800 font-medium leading-tight">{n.message}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{n.time}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {/* Avatar */}
            {student?.profileImage ? (
              <img
                src={`http://localhost:8000${student.profileImage}`}
                className="w-8 h-8 rounded-full object-cover border border-border"
                alt="Profile"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-primary leading-tight">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden animate-fade-in">
              <button
                onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-muted flex items-center gap-2 transition-colors"
              >
                <User size={15} className="text-primary" />
                <span>My Profile</span>
              </button>
              <div className="border-t border-border" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-error flex items-center gap-2 transition-colors"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
