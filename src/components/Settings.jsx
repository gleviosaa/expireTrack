import React from 'react';
import { Moon, Sun, User, Mail, LogOut, Package, Info } from 'lucide-react';

const Settings = ({ user, darkMode, onToggleDarkMode, onLogout }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

      {/* User Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Profile
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <p className="text-sm truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-blue-500" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {darkMode ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleDarkMode}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              darkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* App Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          About
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-900 dark:text-white">App Name</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">ExpireTrack</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-900 dark:text-white">Version</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-3xl shadow-sm p-6 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-3"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
};

export default Settings;
