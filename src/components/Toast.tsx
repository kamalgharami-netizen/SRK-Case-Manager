import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();
  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-800 text-white border-emerald-700 shadow-emerald-950/20',
    error: 'bg-rose-800 text-white border-rose-700 shadow-rose-950/20',
    info: 'bg-blue-800 text-white border-blue-700 shadow-blue-950/20',
    warning: 'bg-amber-900 text-white border-amber-700 shadow-amber-950/30'
  }[toast.type] || 'bg-slate-800 text-white border-slate-700';

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
  }[toast.type] || Info;

  const handleActionClick = () => {
    if (toast.action) {
      toast.action.onClick();
      hideToast();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-lg">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl ${bgStyles}`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1 text-xs sm:text-sm">{toast.message}</span>
        {toast.action && (
          <button
            type="button"
            onClick={handleActionClick}
            className="px-2.5 py-1 text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 ml-1"
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={hideToast}
          className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer shrink-0 -mr-1"
          title="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
