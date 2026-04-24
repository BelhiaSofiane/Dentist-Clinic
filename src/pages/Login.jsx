import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Stethoscope, Globe } from 'lucide-react';
import useAuthStore from '../context/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const Login = () => {
  const { t, i18n } = useTranslation();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLangMenu(false);
  };

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
          {/* Language Selector */}
          <div className="relative mb-6">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-700 transition"
            >
              <Globe className="w-4 h-4" />
              <span>{currentLang.flag} {currentLang.name}</span>
            </button>
            {showLangMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-cyan-100 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-cyan-50 transition ${
                      lang.code === i18n.language ? 'text-cyan-700 font-medium' : 'text-slate-600'
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-cyan-700 mb-6">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Secure Sign In</span>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm ring-cyan-100">
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold text-slate-900">{t('auth.login')}</CardTitle>
              <CardDescription>Use your clinic account to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t('auth.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10"
                  />
                </div>

                {error && (
                  <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-cyan-600 text-white hover:bg-cyan-700"
                >
                  {loading ? t('common.loading') : t('auth.login')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Login;
