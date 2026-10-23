import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  HardDrive,
  Folder,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Clock,
  X,
  FileText,
  RotateCcw,
  Sparkles,
  Check,
  ChevronRight,
  Laptop,
  Smartphone,
  Plus,
  FileCheck
} from 'lucide-react';

export const BackupPathModal: React.FC = () => {
  const {
    backupStoragePath,
    setBackupStoragePath,
    isBackupPathConfigured,
    backupHistory,
    performBackup,
    isSelectBackupPathModalOpen,
    setIsSelectBackupPathModalOpen,
    isManualBackupConfirmOpen,
    setIsManualBackupConfirmOpen,
    activeCompany,
    showToast,
    language
  } = useApp();

  const [customPath, setCustomPath] = useState(backupStoragePath || 'C:/Case_Backups');
  const [isChangingPath, setIsChangingPath] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDriveExplorer, setShowDriveExplorer] = useState(false);
  const [subfolderInput, setSubfolderInput] = useState('');
  const [showSubfolderPrompt, setShowSubfolderPrompt] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpen = isSelectBackupPathModalOpen || isManualBackupConfirmOpen;

  // Keep customPath in sync with context when modal opens or path changes
  useEffect(() => {
    if (isOpen) {
      setCustomPath(backupStoragePath || 'C:/Case_Backups');
      setShowDriveExplorer(false);
      setShowSubfolderPrompt(false);
      setSubfolderInput('');
    }
  }, [isOpen, backupStoragePath]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsSelectBackupPathModalOpen(false);
    setIsManualBackupConfirmOpen(false);
    setIsChangingPath(false);
    setShowDriveExplorer(false);
  };

  /**
   * Universal Folder Browser:
   * 1. Attempts Native File System Access API (showDirectoryPicker)
   * 2. Seamlessly falls back to HTML5 webkitdirectory picker input
   * 3. Handles iframe security limitations without crashing
   */
  const handleBrowseFolder = async () => {
    let succeededWithNative = false;

    // Method 1: File System Access API (Desktop Chrome / Edge / Opera)
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        // @ts-ignore
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        if (dirHandle && dirHandle.name) {
          const isWindows = typeof navigator !== 'undefined' && /win/i.test(navigator.userAgent);
          const sanitized = dirHandle.name.replace(/[^a-zA-Z0-9_\-\s]/g, '_');
          const cleanPath = isWindows ? `C:/${sanitized}` : `/Documents/${sanitized}`;
          setCustomPath(cleanPath);
          showToast(`Directory selected: ${dirHandle.name}`, 'success');
          succeededWithNative = true;
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User deliberately cancelled OS dialog
          return;
        }
        // In iframe or cross-origin environments, showDirectoryPicker throws SecurityError.
        // Silently proceed to HTML5 file input fallback.
        console.info('showDirectoryPicker restricted in iframe, opening folder picker input:', err);
      }
    }

    // Method 2: HTML5 Directory Input (Works across all browsers and iframes)
    if (!succeededWithNative && folderInputRef.current) {
      folderInputRef.current.value = '';
      folderInputRef.current.click();
    }
  };

  // Handle folder chosen via HTML5 input
  const handleFolderInputSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const first = files[0];
      const relPath = first.webkitRelativePath || first.name;
      const folderName = relPath.includes('/') ? relPath.split('/')[0] : 'Selected_Chamber_Folder';
      const cleanFolder = folderName.replace(/[^a-zA-Z0-9_\-\s]/g, '_');
      const isWindows = typeof navigator !== 'undefined' && /win/i.test(navigator.userAgent);
      const chosenPath = isWindows
        ? `C:/Users/Advocate/Documents/${cleanFolder}`
        : `/Internal_Storage/Documents/${cleanFolder}`;

      setCustomPath(chosenPath);
      showToast(`Selected directory: ${cleanFolder}`, 'success');
    } catch {
      setCustomPath('C:/Case_Backups');
    }
  };

  // Handle target file chosen as parent folder reference
  const handleFileInputSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const filePath = (file as any).path;
    if (filePath && typeof filePath === 'string') {
      const parent = filePath.replace(/[/\\][^/\\]+$/, '').replace(/\\/g, '/');
      setCustomPath(parent);
      showToast(`Designated folder resolved: ${parent}`, 'success');
    } else {
      const isWindows = typeof navigator !== 'undefined' && /win/i.test(navigator.userAgent);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\-\s]/g, '_');
      const resolved = isWindows ? `C:/Case_Backups/${cleanName}` : `/Documents/Chamber_Backups`;
      setCustomPath(resolved);
      showToast(`Directory set for backup vault`, 'info');
    }
  };

  const handleAddSubfolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subfolderInput.trim()) return;
    const cleanSub = subfolderInput.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
    const base = customPath.replace(/\/+$/, '');
    const newPath = `${base}/${cleanSub}`;
    setCustomPath(newPath);
    setSubfolderInput('');
    setShowSubfolderPrompt(false);
    showToast(`Added subfolder: ${cleanSub}`, 'success');
  };

  const handleSavePathAndProceed = async () => {
    let finalPath = customPath.trim();
    if (!finalPath) finalPath = 'C:/Case_Backups';
    // Clean up any extraneous strings or formatting
    finalPath = finalPath.replace(/^Directory:\s*/i, '').replace(/\\/g, '/');

    setBackupStoragePath(finalPath);
    setIsChangingPath(false);

    if (isManualBackupConfirmOpen) {
      setIsProcessing(true);
      await performBackup({ type: 'manual', customPath: finalPath, downloadFile: true });
      setIsProcessing(false);
      handleClose();
    } else {
      setIsSelectBackupPathModalOpen(false);
      showToast(`Data storage path configured: ${finalPath}`);
    }
  };

  const handleConfirmManualBackupCurrent = async () => {
    setIsProcessing(true);
    await performBackup({ type: 'manual', downloadFile: true });
    setIsProcessing(false);
    handleClose();
  };

  // Preset quick storage locations
  const storagePresets = [
    {
      label: 'Local Disk C: (Default Vault)',
      path: 'C:/Case_Backups',
      icon: <Laptop className="w-3.5 h-3.5 text-blue-600" />,
      desc: 'Standard Windows Local Drive'
    },
    {
      label: 'Documents Folder',
      path: 'C:/Users/Advocate/Documents/Chamber_Data',
      icon: <Folder className="w-3.5 h-3.5 text-indigo-600" />,
      desc: 'Advocate User Documents'
    },
    {
      label: 'Desktop Folder',
      path: 'C:/Users/Advocate/Desktop/Case_Backups',
      icon: <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />,
      desc: 'Instant Desktop Access'
    },
    {
      label: 'Legal Chamber Drive (D:)',
      path: 'D:/Legal_Chamber_Vault',
      icon: <HardDrive className="w-3.5 h-3.5 text-amber-600" />,
      desc: 'Dedicated Secondary Partition'
    },
    {
      label: 'Mobile Internal Storage',
      path: '/storage/emulated/0/Documents/Case_Backups',
      icon: <Smartphone className="w-3.5 h-3.5 text-purple-600" />,
      desc: 'Android Documents Directory'
    },
    {
      label: 'Mobile Downloads Vault',
      path: '/storage/emulated/0/Download/Legal_Backups',
      icon: <Smartphone className="w-3.5 h-3.5 text-cyan-600" />,
      desc: 'Direct Device Downloads'
    }
  ];

  // Example filename preview
  const previewFileName = `Backup_${(activeCompany?.name || 'Chamber').replace(/[^a-zA-Z0-9]/g, '_')}_2026-10-19_14-30-00.json`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      {/* Hidden native HTML5 folder picker input for universal compatibility */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory=""
        multiple
        className="hidden"
        onChange={handleFolderInputSelected}
      />

      {/* Hidden file picker input for folder resolution fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileInputSelected}
      />

      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isManualBackupConfirmOpen && !isChangingPath
                  ? 'Confirm Manual Data Backup'
                  : 'Select Data Backup Storage Path'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isManualBackupConfirmOpen && !isChangingPath
                  ? 'Verify storage destination before exporting chamber database'
                  : 'Mandatory: Set location for automatic and manual backups'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cancel / Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE 1: Manual Backup Confirmation (If already configured & user didn't ask to change) */}
        {isManualBackupConfirmOpen && !isChangingPath ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-indigo-600" />
                  <span>Current Designated Storage Path:</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                  Ready
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-800/60 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all">
                {backupStoragePath || 'C:/Case_Backups'}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>
                  Chamber: <strong>{activeCompany?.name}</strong> · Total Cases:{' '}
                  <strong>{activeCompany?.cases?.length || 0}</strong> records
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Timestamp Included
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsChangingPath(true)}
                className="px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 hover:bg-indigo-100 dark:bg-indigo-950/50 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Change Path (Browse)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmManualBackupCurrent}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isProcessing ? 'Generating Backup...' : 'Confirm & Backup to Path'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MODE 2: Select / Change Storage Path with Browse */
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Data Storage Path Destination (পাথ নির্বাচন করুন) *
                </label>
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Folder Ready
                </span>
              </div>

              {/* Main Input + Browse Button Group */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Folder className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customPath}
                    onChange={e => setCustomPath(e.target.value)}
                    placeholder="e.g. C:/Case_Backups or D:/Legal_Chamber_Vault"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-inner"
                  />
                </div>

                {/* Primary Browse Folder Button */}
                <button
                  type="button"
                  onClick={handleBrowseFolder}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
                  title="Browse directory via OS folder picker"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Browse...</span>
                </button>
              </div>

              {/* Path Details & File Preview */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
                <span className="truncate">
                  File name format: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{previewFileName}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSubfolderPrompt(prev => !prev)}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 ml-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Subfolder</span>
                </button>
              </div>

              {/* Optional Subfolder Creation Input */}
              {showSubfolderPrompt && (
                <form
                  onSubmit={handleAddSubfolder}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex gap-2 items-center animate-in fade-in duration-150"
                >
                  <input
                    type="text"
                    value={subfolderInput}
                    onChange={e => setSubfolderInput(e.target.value)}
                    placeholder="New subfolder name (e.g., 2026_Backups)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs cursor-pointer hover:bg-indigo-700"
                  >
                    Append
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubfolderPrompt(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>



            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              {isChangingPath ? (
                <button
                  type="button"
                  onClick={() => setIsChangingPath(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Back to Confirm
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancel / Close
                </button>
              )}

              <button
                type="button"
                onClick={handleSavePathAndProceed}
                disabled={!customPath.trim() || isProcessing}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? 'Processing...' : 'Save Storage Path & Proceed'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
