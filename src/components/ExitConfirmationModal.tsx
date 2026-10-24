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
  const [hasExited, setHasExited] = useState(false);

  if (!isOpen) return null;

  const triggerDirectClose = () => {
    try {
      const w = window as any;
      if (w.electronAPI?.closeApp) {
        w.electronAPI.closeApp();
        return;
      }
      if (w.electronAPI?.exitApp) {
        w.electronAPI.exitApp();
        return;
      }
      if (w.electron?.closeApp) {
        w.electron.closeApp();
        return;
      }
      if (w.electron?.close) {
        w.electron.close();
        return;
      }
      if (w.ipcRenderer?.send) {
        w.ipcRenderer.send('app-close');
        return;
      }
      if (w.require) {
        try {
          const { ipcRenderer } = w.require('electron');
          ipcRenderer.send('app-close');
          return;
        } catch {}
      }
      if (w.nw?.App?.quit) {
        w.nw.App.quit();
        return;
      }
      if (w.__TAURI__?.window?.getCurrent) {
        w.__TAURI__.window.getCurrent().close();
        return;
      }
      window.close();
      window.open('', '_self', '');
      window.close();
    } catch (e) {
      console.warn('Window close error:', e);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (e) {
      console.warn('Exit confirmation error:', e);
    }
    triggerDirectClose();
    setIsProcessing(false);
    setHasExited(true);
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
        {hasExited ? (
          <div className="text-center space-y-4 py-2 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Workspace Closed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Session ended safely. You can now close this window or reopen the chamber workspace.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={triggerDirectClose}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Close Window Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasExited(false);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Reopen App
              </button>
            </div>
          </div>
        ) : (
          <>
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

            {/* Simple content without auto backup rule notice */}
            <div className="py-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Click <strong>Yes, Close</strong> to close the application, or <strong>No</strong> to stay in the chamber workspace.
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
                <span>{isProcessing ? 'Closing...' : 'Yes, Close App'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
