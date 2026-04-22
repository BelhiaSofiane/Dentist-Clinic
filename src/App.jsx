import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from './context/authStore';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import WaitingRoom from './pages/WaitingRoom';
import Sidebar from './components/Sidebar';
import LanguageSwitcher from './components/LanguageSwitcher';

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
        className="flex min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50"
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white/90 backdrop-blur-sm border-b border-cyan-100 px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dental Clinic Management</h1>
              <p className="text-sm text-cyan-700">Appointments, queue flow, and front-desk control</p>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
