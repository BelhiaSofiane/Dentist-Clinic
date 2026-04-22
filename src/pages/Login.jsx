import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Stethoscope } from 'lucide-react';
import useAuthStore from '../context/authStore';

const Login = () => {
  const { t } = useTranslation();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden border border-cyan-100">
        <section className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-cyan-700 to-blue-700 text-white p-10">
          <div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-5">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold leading-tight">Dental Clinic Console</h1>
            <p className="mt-3 text-cyan-100 text-sm">
              Manage appointments, patients, and waiting room flow with confidence.
            </p>
          </div>
          <div className="text-sm text-cyan-100">
            Built for front desk teams and dental assistants.
          </div>
        </section>

        <section className="p-8 md:p-10">
          <div className="flex items-center gap-2 text-cyan-700 mb-6">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Secure Sign In</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{t('auth.login')}</h2>
          <p className="text-sm text-slate-500 mb-6">Use your clinic account to continue.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.login')}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
