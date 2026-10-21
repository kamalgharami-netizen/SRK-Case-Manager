import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LaunchScreen } from './components/LaunchScreen';
import { Header } from './components/Header';
import { Sidebar, NavPage } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CaseDashboard } from './components/CaseDashboard';
import { CaseEntryForm } from './components/CaseEntryForm';
import { CauseList } from './components/CauseList';
import { ShareCalculator } from './components/ShareCalculator';
import { AiStudio } from './components/AiStudio';
import { PartyRegistry } from './components/PartyRegistry';
import { TeamRoles } from './components/TeamRoles';
import { DocumentVault } from './components/DocumentVault';
import { CaseDiary } from './components/CaseDiary';
import { StatutoryLibrary } from './components/StatutoryLibrary';
import { CommunicationCenter } from './components/CommunicationCenter';
import { CaseDetailModal } from './components/CaseDetailModal';
import { BackupModal } from './components/BackupModal';
import { ViewingOptionsModal } from './components/ViewingOptionsModal';
import { ChainDeedModal } from './components/ChainDeedModal';
import { BackupPathModal } from './components/BackupPathModal';
import { ExitConfirmationModal } from './components/ExitConfirmationModal';
import { Toast } from './components/Toast';
import { CaseType, CaseItem, getBackupStatus } from './types';
import {
  Plus,
  FileText,
  Send,
  Calendar,
  Brain,
  X,
  Gavel,
  FileSearch,
  Archive,
  LayoutDashboard,
  FolderGit2,
  RefreshCw,
  Building,
  Settings,
  Sparkles,
  ChevronRight,
  Calculator
} from 'lucide-react';

interface AiStudioReturnContext {
  page: NavPage;
  entryMode: CaseType | null;
  editingCase: CaseItem | null;
}

const MainAppContent: React.FC = () => {
  const {
    activeUser,
    activeCompany,
    companies,
    isChamberSetupOpen,
    setIsChamberSetupOpen,
    language,
    showToast,
    isBackupPathConfigured,
    setIsSelectBackupPathModalOpen,
    performBackup,
    isExitConfirmOpen,
    setIsExitConfirmOpen,
    confirmAppExit
  } = useApp();

  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'branding' | 'vault' | 'chainSample' | 'backup'>('branding');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile Bottom Sheet for Case Categories
  const [mobileCasesSheetOpen, setMobileCasesSheetOpen] = useState(false);

  // Case Entry Form state
  const [entryMode, setEntryMode] = useState<CaseType | null>(null);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);

  // Case Detail Modal state
  const [viewingCaseId, setViewingCaseId] = useState<string | null>(null);

  // Chain Deed Modal state (Mutation, Misc, LR Appeal, LRTT)
  const [chainDeedCaseId, setChainDeedCaseId] = useState<string | null>(null);

  // Mobile double-back exit interceptor state
  const [isMobileExitConfirmOpen, setIsMobileExitConfirmOpen] = useState(false);
  const lastBackPressRef = useRef<number>(0);

  // FAB Menu state
  const [fabOpen, setFabOpen] = useState(false);

  // AI Studio Context State (for form-type specific locked drafting)
  const [aiStudioConfig, setAiStudioConfig] = useState<{
    caseType: CaseType | 'all';
    locked: boolean;
    prefill: Partial<CaseItem> | null;
    returnTo?: AiStudioReturnContext;
  }>({
    caseType: 'all',
    locked: false,
    prefill: null
  });

  // Track state for native-like back button navigation
  const isNavigatingRef = useRef(false);

  // Push browser history state so mobile back button steps back smoothly
  const pushHistoryState = useCallback((state: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(
          {
            ...state,
            timestamp: Date.now()
          },
          ''
        );
      } catch (e) {
        console.warn('history.pushState error:', e);
      }
    }
  }, []);

  // Initialize base history state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState({ app: 'srk-case-manager', root: true, page: 'dashboard' }, '');
      } catch (e) {
        console.warn('history.replaceState error:', e);
      }
    }
  }, []);

  // Prompt user to select backup storage path on first launch if not yet configured
  useEffect(() => {
    if (activeCompany && !isBackupPathConfigured) {
      const timer = setTimeout(() => {
        setIsSelectBackupPathModalOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeCompany, isBackupPathConfigured, setIsSelectBackupPathModalOpen]);

  // Desktop Window Close Interceptor: Ask confirmation and perform auto-backup on exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Execute auto-backup on closing
      performBackup({ type: 'auto-close' });
      e.preventDefault();
      e.returnValue = 'Are you sure you want to close the app? All data will be automatically backed up.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [performBackup]);

  // Sync Hardware / Browser / Gesture Back Button on Mobile
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Step backwards from top-most layer to bottom-most:
      if (fabOpen) {
        setFabOpen(false);
        return;
      }
      if (mobileCasesSheetOpen) {
        setMobileCasesSheetOpen(false);
        return;
      }
      if (settingsOpen) {
        setSettingsOpen(false);
        return;
      }
      if (chainDeedCaseId) {
        setChainDeedCaseId(null);
        return;
      }
      if (viewingCaseId) {
        setViewingCaseId(null);
        return;
      }
      if (currentPage === 'aistudio' && aiStudioConfig.locked) {
        // Return from locked AI Studio back to form or menu
        if (aiStudioConfig.returnTo) {
          const { page, entryMode: prevEntry, editingCase: prevEdit } = aiStudioConfig.returnTo;
          setAiStudioConfig({ caseType: 'all', locked: false, prefill: null });
          setCurrentPage(page);
          if (prevEntry) {
            setEntryMode(prevEntry);
            setEditingCase(prevEdit);
          }
        } else {
          setAiStudioConfig({ caseType: 'all', locked: false, prefill: null });
          setCurrentPage('dashboard');
        }
        return;
      }
      if (entryMode !== null) {
        setEntryMode(null);
        setEditingCase(null);
        return;
      }
      if (sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
        setSidebarOpen(false);
        return;
      }
      if (currentPage !== 'dashboard') {
        setCurrentPage('dashboard');
        return;
      }

      // Root Dashboard: Protect mobile exit - must press back twice within 2.5s, plus confirm closing
      const now = Date.now();
      if (now - lastBackPressRef.current < 2500) {
        // Double-press detected: open mobile exit confirmation modal
        setIsMobileExitConfirmOpen(true);
        if (typeof window !== 'undefined') {
          window.history.pushState({ app: 'srk-case-manager', root: true }, '');
        }
      } else {
        // Single press: warn user and prevent exiting
        lastBackPressRef.current = now;
        showToast(
          language === 'bn'
            ? 'অ্যাপটি বন্ধ করতে আবার ব্যাক বোতাম চাপুন'
            : 'Press back again to exit the app',
          'warning'
        );
        if (typeof window !== 'undefined') {
          window.history.pushState({ app: 'srk-case-manager', root: true }, '');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    fabOpen,
    mobileCasesSheetOpen,
    settingsOpen,
    chainDeedCaseId,
    viewingCaseId,
    currentPage,
    aiStudioConfig,
    entryMode,
    sidebarOpen,
    language,
    showToast
  ]);

  // Programmatic Back handler (invoked by Header Back button or explicit UI triggers)
  const handleGoBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback unwind if direct URL opened
      if (fabOpen) setFabOpen(false);
      else if (mobileCasesSheetOpen) setMobileCasesSheetOpen(false);
      else if (settingsOpen) setSettingsOpen(false);
      else if (chainDeedCaseId) setChainDeedCaseId(null);
      else if (viewingCaseId) setViewingCaseId(null);
      else if (currentPage === 'aistudio' && aiStudioConfig.locked) {
        if (aiStudioConfig.returnTo) {
          const { page, entryMode: prevEntry, editingCase: prevEdit } = aiStudioConfig.returnTo;
          setAiStudioConfig({ caseType: 'all', locked: false, prefill: null });
          setCurrentPage(page);
          if (prevEntry) {
            setEntryMode(prevEntry);
            setEditingCase(prevEdit);
          }
        } else {
          setAiStudioConfig({ caseType: 'all', locked: false, prefill: null });
          setCurrentPage('dashboard');
        }
      } else if (entryMode !== null) {
        setEntryMode(null);
        setEditingCase(null);
      } else if (sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else if (currentPage !== 'dashboard') {
        setCurrentPage('dashboard');
      }
    }
  }, [
    fabOpen,
    mobileCasesSheetOpen,
    settingsOpen,
    chainDeedCaseId,
    viewingCaseId,
    currentPage,
    aiStudioConfig,
    entryMode,
    sidebarOpen
  ]);

  const canGoBack = Boolean(
    entryMode !== null ||
      viewingCaseId !== null ||
      chainDeedCaseId !== null ||
      settingsOpen ||
      mobileCasesSheetOpen ||
      (currentPage === 'aistudio' && aiStudioConfig.locked) ||
      currentPage !== 'dashboard'
  );

  const handleOpenSettings = (tab: 'branding' | 'vault' | 'chainSample' | 'backup' = 'branding') => {
    setSettingsTab(tab);
    setSettingsOpen(true);
    pushHistoryState({ modal: 'settings', tab });
  };

  // Backup alert is handled strictly once per day in Dashboard.tsx (not all the time)

  const handleOpenNewCase = (type: CaseType) => {
    setEditingCase(null);
    setEntryMode(type);
    pushHistoryState({ view: 'entry', type });
  };

  const handleEditCase = (c: CaseItem) => {
    setEditingCase(c);
    setEntryMode(c.type);
    pushHistoryState({ view: 'edit', id: c.id, type: c.type });
  };

  const handleCaseSaved = (c: CaseItem, openChainDeed?: boolean) => {
    setEntryMode(null);
    setEditingCase(null);
    // Navigate to that case's dashboard
    setCurrentPage(`case-${c.type}` as NavPage);
    pushHistoryState({ page: `case-${c.type}` });
    if (openChainDeed) {
      setChainDeedCaseId(c.id);
      pushHistoryState({ modal: 'chain-deed', id: c.id });
    }
  };

  // Launch AI Studio strictly tailored to a specific Case / Form type
  // "according to form type only show the options for ai drafting in the rti, misc case, lr appeal case or any others"
  const handleOpenAiDraft = useCallback(
    (type: CaseType, prefilledData?: Partial<CaseItem>) => {
      if (type === 'mutation') return; // Mutation drafting is completely removed as requested

      const returnTo: AiStudioReturnContext = {
        page: currentPage,
        entryMode,
        editingCase
      };

      setAiStudioConfig({
        caseType: type,
        locked: true,
        prefill: prefilledData || null,
        returnTo
      });

      pushHistoryState({ view: 'aistudio', caseType: type });
      setEntryMode(null);
      setCurrentPage('aistudio');
    },
    [currentPage, entryMode, editingCase, pushHistoryState]
  );

  // Return back from AI Studio to previous entry form or case menu
  const handleAiStudioBack = useCallback(() => {
    if (aiStudioConfig.returnTo) {
      const { page, entryMode: prevEntry, editingCase: prevEdit } = aiStudioConfig.returnTo;
      setAiStudioConfig({ caseType: 'all', locked: false, prefill: null });
      setCurrentPage(page);
      if (prevEntry) {
        setEntryMode(prevEntry);
        setEditingCase(prevEdit);
      }
    } else {
      setAiStudioConfig({ caseType: 'all', locked: false, prefill: null });
      setCurrentPage('dashboard');
    }
  }, [aiStudioConfig]);

  // Navigate helper with history push
  const handleNavigatePage = (page: NavPage) => {
    setEntryMode(null);
    if (page === 'vault') {
      handleOpenSettings('vault');
    } else {
      if (page === 'aistudio') {
        // Normal unlocked AI Studio
        setAiStudioConfig({ caseType: 'all', locked: false, prefill: null });
      }
      setCurrentPage(page);
      pushHistoryState({ page });
    }
  };

  // Mandatory First Launch: If no company registered, or chamber setup explicitly requested
  if (!activeUser || !activeCompany || companies.length === 0 || isChamberSetupOpen) {
    return (
      <LaunchScreen
        onClose={isChamberSetupOpen && companies.length > 0 ? () => setIsChamberSetupOpen(false) : undefined}
      />
    );
  }

  const viewingCase = activeCompany.cases.find(c => c.id === viewingCaseId) || null;
  const chainDeedCase = activeCompany.cases.find(c => c.id === chainDeedCaseId) || null;

  const getCaseCount = (type: CaseType) => {
    return activeCompany?.cases.filter(c => c.type === type).length || 0;
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col justify-center bg-white dark:bg-slate-950 overflow-hidden font-sans app-shell-bg">
      <div className="relative flex h-[90dvh] my-[5dvh] sm:h-screen sm:my-0 w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden border-y border-slate-200/80 dark:border-slate-800 sm:border-y-0 app-shell-bg">
        {/* Toast Notification Container */}
        <Toast />

      {/* Case Dossier Detail Modal */}
      <CaseDetailModal
        caseItem={viewingCase}
        onClose={() => setViewingCaseId(null)}
        onEdit={c => {
          setViewingCaseId(null);
          handleEditCase(c);
        }}
        onOpenChainDeed={c => {
          setChainDeedCaseId(c.id);
          pushHistoryState({ modal: 'chain-deed', id: c.id });
        }}
        onOpenAiDraft={handleOpenAiDraft}
      />

      {/* Dedicated Chain Deed Modal */}
      <ChainDeedModal
        caseItem={chainDeedCase}
        isOpen={!!chainDeedCaseId}
        onClose={() => setChainDeedCaseId(null)}
      />

      {/* Preferences / Backup / Vault Modal */}
      <BackupModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsTab}
      />

      {/* Display & Viewing Options Modal */}
      <ViewingOptionsModal />

      {/* Backup Path Configuration & Manual Confirmation Modal */}
      <BackupPathModal />

      {/* Desktop and Mobile Exit Confirmation Modal with Auto-Backup */}
      <ExitConfirmationModal
        isOpen={isExitConfirmOpen || isMobileExitConfirmOpen}
        onClose={() => {
          setIsExitConfirmOpen(false);
          setIsMobileExitConfirmOpen(false);
        }}
        onConfirm={confirmAppExit}
        isMobileTrigger={isMobileExitConfirmOpen}
      />

      {/* Collapsible Sidebar for Desktop & Tablets */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigatePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={handleOpenSettings}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Top Bar with Mobile Back button & Responsive layout */}
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          isSidebarOpen={sidebarOpen}
          onOpenSettings={() => handleOpenSettings('branding')}
          onOpenShareCalculator={() => handleNavigatePage('sharecalculator')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          canGoBack={canGoBack}
          onGoBack={handleGoBack}
        />

        {/* Dynamic Viewport with responsive bottom padding for mobile navigation bar */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8">
          {entryMode ? (
            <CaseEntryForm
              type={entryMode}
              editingCase={editingCase}
              onBack={() => {
                setEntryMode(null);
                setEditingCase(null);
              }}
              onSaved={handleCaseSaved}
              onOpenAiDraft={handleOpenAiDraft}
            />
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <Dashboard
                  onNavigate={handleNavigatePage}
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onOpenChainDeed={c => {
                    setChainDeedCaseId(c.id);
                    pushHistoryState({ modal: 'chain-deed', id: c.id });
                  }}
                  onOpenSettings={handleOpenSettings}
                />
              )}

              {currentPage === 'case-mutation' && (
                <CaseDashboard
                  type="mutation"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onEditCase={handleEditCase}
                  onOpenChainDeed={c => {
                    setChainDeedCaseId(c.id);
                    pushHistoryState({ modal: 'chain-deed', id: c.id });
                  }}
                />
              )}

              {currentPage === 'case-misc' && (
                <CaseDashboard
                  type="misc"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onEditCase={handleEditCase}
                  onOpenChainDeed={c => {
                    setChainDeedCaseId(c.id);
                    pushHistoryState({ modal: 'chain-deed', id: c.id });
                  }}
                  onOpenAiDraft={handleOpenAiDraft}
                />
              )}

              {currentPage === 'case-lrappeal' && (
                <CaseDashboard
                  type="lrappeal"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onEditCase={handleEditCase}
                  onOpenChainDeed={c => {
                    setChainDeedCaseId(c.id);
                    pushHistoryState({ modal: 'chain-deed', id: c.id });
                  }}
                  onOpenAiDraft={handleOpenAiDraft}
                />
              )}

              {currentPage === 'case-firstappeal' && (
                <CaseDashboard
                  type="firstappeal"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onEditCase={handleEditCase}
                  onOpenAiDraft={handleOpenAiDraft}
                />
              )}

              {currentPage === 'case-rti' && (
                <CaseDashboard
                  type="rti"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onEditCase={handleEditCase}
                  onOpenAiDraft={handleOpenAiDraft}
                />
              )}

              {currentPage === 'case-lrtt' && (
                <CaseDashboard
                  type="lrtt"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onEditCase={handleEditCase}
                  onOpenChainDeed={c => {
                    setChainDeedCaseId(c.id);
                    pushHistoryState({ modal: 'chain-deed', id: c.id });
                  }}
                  onOpenAiDraft={handleOpenAiDraft}
                />
              )}

              {currentPage === 'case-conversion' && (
                <CaseDashboard
                  type="conversion"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onEditCase={handleEditCase}
                  onOpenChainDeed={c => {
                    setChainDeedCaseId(c.id);
                    pushHistoryState({ modal: 'chain-deed', id: c.id });
                  }}
                  onOpenAiDraft={handleOpenAiDraft}
                />
              )}

              {currentPage === 'case-certcopy' && (
                <CaseDashboard
                  type="certcopy"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onEditCase={handleEditCase}
                  onOpenChainDeed={c => {
                    setChainDeedCaseId(c.id);
                    pushHistoryState({ modal: 'chain-deed', id: c.id });
                  }}
                  onOpenAiDraft={handleOpenAiDraft}
                />
              )}

              {currentPage === 'case-rorpi' && (
                <CaseDashboard
                  type="rorpi"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => {
                    setViewingCaseId(id);
                    pushHistoryState({ modal: 'case-detail', id });
                  }}
                  onEditCase={handleEditCase}
                  onOpenChainDeed={c => {
                    setChainDeedCaseId(c.id);
                    pushHistoryState({ modal: 'chain-deed', id: c.id });
                  }}
                  onOpenAiDraft={handleOpenAiDraft}
                />
              )}

              {currentPage === 'causelist' && <CauseList />}

              {currentPage === 'sharecalculator' && <ShareCalculator />}

              {currentPage === 'aistudio' && (
                <AiStudio
                  initialCaseType={aiStudioConfig.caseType}
                  lockCaseType={aiStudioConfig.locked}
                  prefilledCase={aiStudioConfig.prefill}
                  onBack={handleAiStudioBack}
                />
              )}

              {currentPage === 'parties' && <PartyRegistry />}

              {currentPage === 'users' && <TeamRoles />}

              {currentPage === 'wblract' && <StatutoryLibrary />}

              {currentPage === 'vault' && (
                <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
                    <Archive className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Document Vault &amp; Samples Shifted to Settings
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      All legal sample drafts, deed templates, chain master samples, and uploaded vault documents are now centralized under Chamber Settings.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenSettings('vault')}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Open Document Vault &amp; Samples in Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {currentPage === 'timeline' && <CaseDiary />}

              {currentPage === 'messages' && <CommunicationCenter />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Sub-Menu Sheet for Case Categories with 3D Design & 2x Bigger Icons */}
      {mobileCasesSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileCasesSheetOpen(false)}
          />
          <div className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-t-3xl border-t-2 border-slate-200 dark:border-slate-700 p-4 shadow-[0_-20px_50px_rgba(15,23,42,0.25)] space-y-3 max-h-[82vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-600" />
                <span>Land Case Menus (মামলার মেনুসমূহ)</span>
              </h3>
              <button
                type="button"
                onClick={() => setMobileCasesSheetOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMobileCasesSheetOpen(false);
                  handleNavigatePage('case-mutation');
                }}
                className={`p-3 rounded-2xl border border-b-4 text-center flex flex-col items-center justify-between gap-1.5 shadow-sm transition-all ${
                  currentPage === 'case-mutation'
                    ? 'border-blue-600 border-b-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800/80'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">Mutation</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {getCaseCount('mutation')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCasesSheetOpen(false);
                  handleNavigatePage('case-misc');
                }}
                className={`p-3 rounded-2xl border border-b-4 text-center flex flex-col items-center justify-between gap-1.5 shadow-sm transition-all ${
                  currentPage === 'case-misc'
                    ? 'border-purple-600 border-b-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800/80'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                  <FolderGit2 className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">Misc Case</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {getCaseCount('misc')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCasesSheetOpen(false);
                  handleNavigatePage('case-lrappeal');
                }}
                className={`p-3 rounded-2xl border border-b-4 text-center flex flex-col items-center justify-between gap-1.5 shadow-sm transition-all ${
                  currentPage === 'case-lrappeal'
                    ? 'border-emerald-600 border-b-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800/80'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <Send className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">LR Appeal</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {getCaseCount('lrappeal')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCasesSheetOpen(false);
                  handleNavigatePage('case-firstappeal');
                }}
                className={`p-3 rounded-2xl border border-b-4 text-center flex flex-col items-center justify-between gap-1.5 shadow-sm transition-all ${
                  currentPage === 'case-firstappeal'
                    ? 'border-indigo-600 border-b-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800/80'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                  <Gavel className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">First Appeal</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {getCaseCount('firstappeal')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCasesSheetOpen(false);
                  handleNavigatePage('case-rti');
                }}
                className={`p-3 rounded-2xl border border-b-4 text-center flex flex-col items-center justify-between gap-1.5 shadow-sm transition-all ${
                  currentPage === 'case-rti'
                    ? 'border-teal-600 border-b-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800/80'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner">
                  <FileSearch className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">RTI Query</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {getCaseCount('rti')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCasesSheetOpen(false);
                  handleNavigatePage('case-conversion');
                }}
                className={`p-3 rounded-2xl border border-b-4 text-center flex flex-col items-center justify-between gap-1.5 shadow-sm transition-all ${
                  currentPage === 'case-conversion'
                    ? 'border-amber-600 border-b-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800/80'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">Conversion</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {getCaseCount('conversion')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileCasesSheetOpen(false);
                  handleNavigatePage('case-lrtt');
                }}
                className={`col-span-2 p-3 rounded-2xl border border-b-4 text-center flex flex-col items-center justify-between gap-1.5 shadow-sm transition-all ${
                  currentPage === 'case-lrtt'
                    ? 'border-cyan-600 border-b-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 bg-white dark:bg-slate-800/80'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-inner">
                  <Building className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">WBLRTT Land Tribunal</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {getCaseCount('lrtt')}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Thumb-Friendly Bottom Navigation Bar for Mobile inside 90% screen container */}
      <nav className="lg:hidden absolute bottom-0 left-0 right-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => handleNavigatePage('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'dashboard' && !entryMode
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileCasesSheetOpen(prev => !prev)}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            mobileCasesSheetOpen || currentPage.startsWith('case-')
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderGit2 className="w-5 h-5" />
          <span className="text-[10px]">Cases</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigatePage('sharecalculator')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'sharecalculator'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px]">Share Calc</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigatePage('causelist')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'causelist'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Cause List</span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenSettings('vault')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            settingsOpen
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </nav>

      {/* Floating Action Button (FAB) Menu - positioned cleanly above mobile nav */}
      <div className="absolute bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        {fabOpen && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl space-y-1 w-52 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={() => {
                setFabOpen(false);
                handleOpenNewCase('mutation');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>+ New Mutation</span>
            </button>

            <button
              onClick={() => {
                setFabOpen(false);
                handleOpenNewCase('misc');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 text-purple-600" />
              <span>+ New Misc Case</span>
            </button>

            <button
              onClick={() => {
                setFabOpen(false);
                handleOpenNewCase('lrappeal');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-600" />
              <span>+ New LR Appeal</span>
            </button>

            <button
              onClick={() => {
                setFabOpen(false);
                handleOpenNewCase('firstappeal');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 cursor-pointer"
            >
              <Gavel className="w-4 h-4 text-indigo-600" />
              <span>+ New First Appeal</span>
            </button>

            <button
              onClick={() => {
                setFabOpen(false);
                handleOpenNewCase('rti');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 cursor-pointer"
            >
              <FileSearch className="w-4 h-4 text-teal-600" />
              <span>+ New RTI Query</span>
            </button>

            <button
              onClick={() => {
                setFabOpen(false);
                handleNavigatePage('causelist');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Daily Cause List</span>
            </button>

            <button
              onClick={() => {
                setFabOpen(false);
                handleNavigatePage('sharecalculator');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Share Calculator</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="w-13 h-13 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white shadow-xl shadow-blue-700/30 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          title="Quick Actions"
        >
          {fabOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
