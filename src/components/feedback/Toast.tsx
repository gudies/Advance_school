import React from 'react';
import { useNotificationStore, Toast as ToastType } from '../../stores/notificationStore';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export const Toast: React.FC<ToastType> = ({ id, type, title, message }) => {
  const removeToast = useNotificationStore((state) => state.removeToast);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
    info: <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
  };

  const bgClasses = {
    success: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50',
    warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50',
    error: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50',
    info: 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/50',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full bg-white dark:bg-slate-900 transition-all duration-300 animate-in slide-in-from-top-4 sm:slide-in-from-bottom-4 ${bgClasses[type]}`}
    >
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1 space-y-0.5">
        {title && (
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white font-heading">
            {title}
          </h4>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed">
          {message}
        </p>
      </div>
      <button
        onClick={() => removeToast(id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useNotificationStore((state) => state.toasts);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm p-4 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};
