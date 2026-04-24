import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from './context/authStore';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import WaitingRoom from './pages/WaitingRoom';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Toaster } from '@/components/ui/sonner';
import { Menu } from 'lucide-react';

function ProtectedRoute({ allowedRoles, role, children }) {
  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'admin' ? '/admin' : '/agent'} replace />;
  }

  return children;
}

function App() {
  const { user, role, loading, initialize, cleanup } = useAuthStore();
  const { i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initialize();

    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div
        className="flex min-h-screen bg-linear-to-br from-cyan-50 via-white to-blue-50"
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col">
          <header className="bg-white/90 backdrop-blur-sm border-b border-cyan-100 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-cyan-100 rounded-lg transition"
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dental Clinic Management</h1>
                <p className="text-sm text-cyan-700">Appointments, queue flow, and front-desk control</p>
              </div>
            </div>
            <LanguageSwitcher />
          </header>
          <main className="flex-1 p-6">
            <Routes>
              <Route
                path="/"
                element={
                  role === 'admin' ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Navigate to="/agent" replace />
                  )
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']} role={role}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/patients"
                element={
                  <ProtectedRoute allowedRoles={['admin']} role={role}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/appointments"
                element={
                  <ProtectedRoute allowedRoles={['admin']} role={role}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'agent']} role={role}>
                    <AgentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waiting-room"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'agent']} role={role}>
                    <WaitingRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'agent']} role={role}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors closeButton />
    </Router>
  );
}

export default App;
