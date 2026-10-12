import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Download,
  Upload,
  Building2,
  Shield,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { activeCompany, exportCompanyJson, restoreCompany, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !activeCompany) return null;

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const ok = restoreCompany(parsed);
        if (ok) onClose();
      } catch {
        showToast('Invalid backup file JSON', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Chamber Preferences & Backup
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Active Firm Profile */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{activeCompany.name}</span>
          </div>
          <div className="text-slate-500">
            <strong>Bar Council Reg:</strong> {activeCompany.barCouncil || 'WB/Chamber'}
          </div>
          <div className="text-slate-500">
            <strong>Office:</strong> {activeCompany.address || ''}, {activeCompany.city || ''} - {activeCompany.pin || ''}
          </div>
          <div className="text-slate-500">
            <strong>Phone / Email:</strong> {activeCompany.phone} · {activeCompany.email}
          </div>
        </div>

        {/* Backup & Restore Controls */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Data Preservation & Portability
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportCompanyJson}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition-all group cursor-pointer"
            >
              <Download className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Export JSON Backup
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Full chamber database export
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-left transition-all group cursor-pointer"
            >
              <Upload className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Restore from Backup
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Import .json archive file
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreFile}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
