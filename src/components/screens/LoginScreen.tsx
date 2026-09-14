import React, { useState } from 'react';
import { Mail, KeyRound, ShieldAlert, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
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

  const fillQuickAccount = (sampleEmail: string, samplePass = 'clave123') => {
    setEmail(sampleEmail);
    setPassword(samplePass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          Church Media Manager
        </h2>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-stone-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
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
                Correo o Usuario
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
                  className="block w-full pl-9.5 pr-10 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 placeholder:text-stone-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-1">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-70 transition-all cursor-pointer"
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

          {/* Quick Account Selector for Prototype Review */}
          <div className="mt-7 pt-6 border-t border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider text-center mb-3">
              Cuentas demo para evaluar el prototipo
            </p>
            <div className="space-y-2">
              <button
                type="button"
                id="quick-login-user"
                onClick={() => fillQuickAccount('carlos.mora@iglesia.org')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-left transition-colors text-xs"
              >
                <div>
                  <span className="font-semibold text-stone-900">Carlos Mora</span>
                  <span className="text-stone-500 ml-1.5">(carlos.mora@iglesia.org)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700">
                  Rol: Usuario
                </span>
              </button>

              <button
                type="button"
                id="quick-login-admin"
                onClick={() => fillQuickAccount('marta.solis@iglesia.org')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:border-sky-300 hover:bg-sky-50/50 text-left transition-colors text-xs"
              >
                <div>
                  <span className="font-semibold text-stone-900">Marta Solís</span>
                  <span className="text-stone-500 ml-1.5">(marta.solis@iglesia.org)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-100 text-sky-800">
                  Rol: Admin
                </span>
              </button>

              <button
                type="button"
                id="quick-login-superadmin"
                onClick={() => fillQuickAccount('pastor.david@iglesia.org')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:border-purple-300 hover:bg-purple-50/50 text-left transition-colors text-xs"
              >
                <div>
                  <span className="font-semibold text-stone-900">Pastor David</span>
                  <span className="text-stone-500 ml-1.5">(pastor.david@iglesia.org)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                  Rol: Superadmin
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
