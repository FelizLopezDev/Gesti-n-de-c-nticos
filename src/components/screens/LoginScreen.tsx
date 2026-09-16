import React, { useState } from 'react';
import { Mail, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Por favor, ingresa tu correo institucional o nombre de usuario.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(email.trim(), password);
      setIsLoading(false);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-8 sm:py-12 px-5 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="w-full max-w-md mx-auto text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Church Media Manager
        </h1>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-200">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Error banner */}
            {errorMessage && (
              <div
                id="login-error-alert"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Email / Username field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Correo o usuario
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@iglesia.org"
                  className="block w-full pl-9.5 pr-3 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 placeholder:text-stone-400 transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Contraseña
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9.5 pr-11 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 placeholder:text-stone-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-xs text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-70 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
