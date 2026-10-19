import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  HardDrive,
  CheckCircle2,
  X,
  Power,
  ShieldCheck,
  Calendar,
  Clock
} from 'lucide-react';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isMobileTrigger?: boolean;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isMobileTrigger = false
}) => {
  const { activeCompany, backupStoragePath, language } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    await onConfirm();
    setIsProcessing(false);
  };

  const now = new Date();
  const formattedNow = now.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Are you sure you want to close the app?
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isMobileTrigger
                  ? 'Mobile back double-press confirmation'
                  : 'Desktop application exit confirmation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cancel / Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Data Protection &amp; Auto-Backup Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              If you select <strong>Yes</strong>, the app will execute an automatic backup of all case files, schedules, parties, and diary entries into your designated storage path with date and time recorded.
            </p>
          </div>

          {/* Backup Path Details */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                <span>Auto Backup Path:</span>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                Ready
              </span>
            </div>
            <div className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 break-all p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/60">
              {backupStoragePath || 'C:/SRK_Case_Backups'}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>Chamber: {activeCompany?.name || 'SRK Legal Chamber'}</span>
              <span>Time: {formattedNow}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            No, Stay in App (অ্যাপে থাকুন)
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isProcessing ? 'Auto-Backing up...' : 'Yes, Close & Backup'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
