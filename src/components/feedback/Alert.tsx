import React from 'react';
import { CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  className = '',
}) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
    info: <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
  };

  const bgClasses = {
    success: 'bg-emerald-50/55 border-emerald-200 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-900/50 dark:text-emerald-300',
    warning: 'bg-amber-50/55 border-amber-200 text-amber-800 dark:bg-amber-950/10 dark:border-amber-900/50 dark:text-amber-300',
    error: 'bg-rose-50/55 border-rose-200 text-rose-800 dark:bg-rose-950/10 dark:border-rose-900/50 dark:text-rose-300',
    info: 'bg-sky-50/55 border-sky-200 text-sky-800 dark:bg-sky-950/10 dark:border-sky-900/50 dark:text-sky-300',
  };

  return (
    <div
      className={`flex gap-3 p-4 border rounded-xl ${bgClasses[type]} ${className}`}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div className="space-y-1">
        {title && <h5 className="text-sm font-semibold leading-none font-heading text-inherit">{title}</h5>}
        <p className="text-xs font-light leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
