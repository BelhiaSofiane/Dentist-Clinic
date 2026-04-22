import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, Clock, LogOut, HeartPulse } from 'lucide-react';
import useAuthStore from '../context/authStore';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { role, signOut } = useAuthStore();

  const menuItems = [
    {
      to: role === 'admin' ? '/admin' : '/agent',
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
      to: '/admin',
      icon: Users,
      label: t('patients.title'),
    });
  }

  return (
    <div className="w-72 bg-white border-r border-cyan-100 shadow-sm min-h-screen flex flex-col">
      <div className="p-6 border-b border-cyan-100 bg-gradient-to-br from-cyan-600 to-blue-600 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">SmileCare</h2>
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
      <div className="p-4 border-t border-cyan-100">
        <button
          onClick={signOut}
          className="flex items-center w-full px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {t('auth.logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
