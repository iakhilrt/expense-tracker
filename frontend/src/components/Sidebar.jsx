import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Wallet,
  Tag,
  Receipt,
  Settings as SettingsIcon,
  LogOut,
  ShieldAlert,
  X
} from 'lucide-react';

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: Wallet, label: 'Budgets', path: '/budgets' },
    { icon: Tag, label: 'Categories', path: '/categories' },
    { icon: Receipt, label: 'Expenses', path: '/expenses' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (onClose) onClose();
  };

  return (
    <div
      className={`
        fixed left-0 top-0 z-30 h-screen w-64 bg-white border-r border-slate-200
        flex flex-col p-6 transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Vault</span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user?.governmentModeEnabled && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-xs font-semibold text-red-700 leading-tight">Government Mode Active</span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="px-4 mb-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;