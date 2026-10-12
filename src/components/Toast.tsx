import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-800 text-white border-emerald-700 shadow-emerald-950/20',
    error: 'bg-rose-800 text-white border-rose-700 shadow-rose-950/20',
    info: 'bg-blue-800 text-white border-blue-700 shadow-blue-950/20'
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium shadow-lg max-w-md ${bgStyles}`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1">{toast.message}</span>
      </div>
    </div>
  );
};
