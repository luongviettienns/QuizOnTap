import { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'info';
  message: ReactNode;
  onDismiss?: (id: string) => void;
}

export function Toast({ id, type = 'info', message, onDismiss }: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-900/60',
    error: 'border-rose-200 dark:border-rose-900/60',
    info: 'border-indigo-200 dark:border-indigo-900/60',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border ${borders[type]} shadow-lg text-sm text-slate-800 dark:text-slate-200 animate-in slide-in-from-bottom-2 duration-150`}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 font-medium">{message}</div>
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
