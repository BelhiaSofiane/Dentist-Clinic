import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, Clock, LogOut, HeartPulse, Menu, X, Settings, KeyRound } from 'lucide-react';
import useAuthStore from '../context/authStore';

const Sidebar = ({ isOpen, onToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { role, signOut, user } = useAuthStore();

  const menuItems = [
    {
      to: role === 'admin' ? '/admin/appointments' : '/agent',
      icon: Calendar,
      label: t('appointments.title'),
    },
    {
      to: '/waiting-room',
      icon: Clock,
      label: t('queue.title'),
    },
  ];

  if (role === 'admin') {
    menuItems.unshift({
      to: '/admin/patients',
      icon: Users,
      label: t('patients.title'),
    });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-cyan-100 shadow-lg transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-72`}
      >
        <div className="p-6 border-b border-cyan-100 bg-linear-to-br from-cyan-600 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">SmileCare</h2>
            </div>
            <button 
              onClick={onToggle}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-cyan-100 uppercase tracking-wide">
            Dental Operations
          </p>
        </div>
        
        <nav className="px-4 py-4 flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => onToggle()}
                  className={`flex items-center px-4 py-2.5 rounded-xl transition ${
                    location.pathname === item.to
                      ? 'bg-cyan-100 text-cyan-800 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-cyan-100 space-y-2">
          {/* Account Settings */}
          <Link
            to="/settings"
            onClick={() => onToggle()}
            className="flex items-center w-full px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <Settings className="w-5 h-5 mr-3" />
            {t('settings.title') || 'Account Settings'}
          </Link>
          
          <button
            onClick={signOut}
            className="flex items-center w-full px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('auth.logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
