import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import useAuthStore from '../context/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updatePassword } = useAuthStore();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!currentPassword) {
      setError(t('settings.currentPasswordRequired') || 'Current password is required');
      return;
    }

    if (!newPassword) {
      setError(t('settings.newPasswordRequired') || 'New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError(t('settings.passwordMinLength') || 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('settings.passwordsDoNotMatch') || 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError(t('settings.passwordsDifferent') || 'New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(currentPassword, newPassword);
      toast.success(t('settings.passwordChangedSuccess') || 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || t('settings.passwordChangeFailed') || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-600 hover:text-cyan-700 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {t('common.back') || 'Back'}
      </button>

      <Card className="border-cyan-100 shadow-sm">
        <CardHeader className="border-b border-cyan-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                {t('settings.title') || 'Account Settings'}
              </CardTitle>
              <CardDescription className="text-slate-600">
                {t('settings.subtitle') || 'Manage your account and security settings'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* User Info */}
          <div className="mb-8 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
            <h3 className="font-semibold text-slate-900 mb-2">
              {t('settings.accountInfo') || 'Account Information'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">{t('auth.email') || 'Email'}:</span>
                <span className="text-slate-900 font-medium">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Password Change Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-cyan-700" />
              <h3 className="font-semibold text-slate-900">
                {t('settings.changePassword') || 'Change Password'}
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t('settings.currentPassword') || 'Current Password'}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  placeholder={t('settings.enterCurrentPassword') || 'Enter current password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {t('settings.newPassword') || 'New Password'}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder={t('settings.enterNewPassword') || 'Enter new password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('settings.confirmNewPassword') || 'Confirm New Password'}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                placeholder={t('settings.confirmNewPassword') || 'Confirm new password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('settings.changing') || 'Changing...'}
                </>
              ) : (
                t('settings.changePasswordButton') || 'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;