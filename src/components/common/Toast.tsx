import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notifications-container"
      className="fixed bottom-5 right-5 z-60 flex flex-col gap-2.5 max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
            case 'info':
            default:
              return <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-200 bg-white';
            case 'error':
              return 'border-rose-200 bg-white';
            case 'warning':
              return 'border-amber-200 bg-white';
            case 'info':
            default:
              return 'border-sky-200 bg-white';
          }
        };

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${getBorderColor()} transition-all transform translate-y-0`}
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-sm font-semibold text-stone-900 leading-snug">{toast.title}</h4>
              )}
              <p className="text-xs text-stone-600 leading-relaxed mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
