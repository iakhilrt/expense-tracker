import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Shield, User, Mail, Bell } from 'lucide-react';

const Settings = () => {
  const { user, updateSettings } = useAuth();
  const [govMode, setGovMode] = useState(user?.governmentModeEnabled || false);
  const [success, setSuccess] = useState(false);

  const handleToggleGovMode = async () => {
    try {
      const newValue = !govMode;
      await api.put('/user/settings', { governmentModeEnabled: newValue });
      updateSettings({ governmentModeEnabled: newValue });
      setGovMode(newValue);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings', err);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-2xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm sm:text-base">Manage your account and preferences</p>
      </header>

      <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100">
        {/* Profile */}
        <div className="p-5 lg:p-8">
          <div className="flex items-center gap-3 lg:gap-4 mb-5 lg:mb-6">
            <div className="p-2.5 lg:p-3 bg-slate-100 rounded-xl lg:rounded-2xl">
              <User className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" />
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-slate-900">Account Details</h2>
          </div>
          <div className="flex justify-between items-center p-3 lg:p-4 bg-slate-50 rounded-xl lg:rounded-2xl">
            <div className="flex items-center gap-2 lg:gap-3">
              <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
              <span className="text-slate-600 font-medium text-sm lg:text-base">Email Address</span>
            </div>
            <span className="text-slate-900 font-bold text-sm lg:text-base truncate ml-3 max-w-[180px] sm:max-w-none">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Security */}
        <div className="p-5 lg:p-8">
          <div className="flex items-center gap-3 lg:gap-4 mb-5 lg:mb-6">
            <div className={`p-2.5 lg:p-3 rounded-xl lg:rounded-2xl ${govMode ? 'bg-red-100' : 'bg-slate-100'}`}>
              <Shield className={`w-5 h-5 lg:w-6 lg:h-6 ${govMode ? 'text-red-600' : 'text-slate-600'}`} />
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-slate-900">Security & Enforcement</h2>
          </div>

          <div className={`p-4 lg:p-6 rounded-2xl lg:rounded-3xl border transition-all ${govMode ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center justify-between gap-4 lg:gap-6">
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold mb-1 text-sm lg:text-base ${govMode ? 'text-red-900' : 'text-slate-900'}`}>
                  Global Government Mode
                </h3>
                <p className="text-xs lg:text-sm text-slate-500">
                  When enabled, strict enforcement prevents spending beyond allocated category limits.
                </p>
              </div>
              <button
                onClick={handleToggleGovMode}
                className={`w-12 lg:w-14 h-7 lg:h-8 rounded-full relative transition-all shrink-0 ${govMode ? 'bg-red-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-5 h-5 lg:w-6 lg:h-6 bg-white rounded-full transition-all shadow-sm ${govMode ? 'left-6 lg:left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
          {success && (
            <p className="mt-4 text-sm text-emerald-600 font-bold">Settings updated successfully!</p>
          )}
        </div>

        {/* Notifications */}
        <div className="p-5 lg:p-8">
          <div className="flex items-center gap-3 lg:gap-4 mb-5 lg:mb-6">
            <div className="p-2.5 lg:p-3 bg-slate-100 rounded-xl lg:rounded-2xl">
              <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" />
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-slate-900">Notifications</h2>
          </div>
          <p className="text-slate-400 italic text-sm">Notification preferences coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;