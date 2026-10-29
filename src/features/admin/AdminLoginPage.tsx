import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { verifyAndCreateSession, isSessionActive } from '../../lib/adminSession';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Lock, User, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  useDocumentTitle('Administrator Login');
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect to admin dashboard
  useEffect(() => {
    if (isSessionActive()) {
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        ROUTES.ADMIN;
      navigate(from, { replace: true });
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await verifyAndCreateSession(username, password);

      if (result.success) {
        // Send user to Admin Dashboard or intended page
        const from =
          (location.state as { from?: { pathname: string } })?.from?.pathname ||
          ROUTES.ADMIN;
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.errorMessage || 'Wrong username or password');
      }
    } catch {
      setErrorMessage('Wrong username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="p-8 rounded-[var(--radius-lg)] border border-[#E7E3DA] bg-white shadow-hairline space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-xs)] bg-[#183B32] text-sm font-serif text-[#FAF8F4] font-semibold">
            F
          </span>
          <h1 className="text-2xl font-serif-heading font-semibold text-[#141413]">
            Curator Portal Login
          </h1>
          <p className="text-xs text-[#5C5955]">
            Sign in with administrative credentials to upload curriculum materials and manage catalog records.
          </p>
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-[var(--radius-sm)] bg-[#FDF2F1] border border-[#9E2B25]/20 text-xs text-[#9E2B25] flex items-start gap-2.5 leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-medium text-[#5C5955] mb-1"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#87837B]" />
              <Input
                id="admin-username"
                type="text"
                autoComplete="username"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-[#5C5955] mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#87837B]" />
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 pr-9 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#87837B] hover:text-[#141413] p-0.5 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full text-xs font-medium gap-1.5"
          >
            <span>Sign in to Administrator Portal</span>
          </Button>
        </form>

        <div className="pt-4 border-t border-[#E7E3DA] flex items-center justify-center gap-1.5 text-[11px] text-[#87837B]">
          <Shield className="w-3.5 h-3.5 text-[#183B32]" />
          <span>Curator sessions remain authenticated on this browser for 30 days.</span>
        </div>
      </div>
    </div>
  );
};
