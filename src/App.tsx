import React, { useState } from 'react';
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
import { Toast } from './components/Toast';
import { CaseType, CaseItem } from './types';
import { Plus, FileText, Send, Calendar, Brain, X, Gavel, FileSearch } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeUser, activeCompany } = useApp();

  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Case Entry Form state
  const [entryMode, setEntryMode] = useState<CaseType | null>(null);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);

  // Case Detail Modal state
  const [viewingCaseId, setViewingCaseId] = useState<string | null>(null);

  // FAB Menu state
  const [fabOpen, setFabOpen] = useState(false);

  // If not logged in, render the LaunchScreen
  if (!activeUser || !activeCompany) {
    return <LaunchScreen />;
  }

  const handleOpenNewCase = (type: CaseType) => {
    setEditingCase(null);
    setEntryMode(type);
  };

  const handleEditCase = (c: CaseItem) => {
    setEditingCase(c);
    setEntryMode(c.type);
  };

  const handleCaseSaved = (c: CaseItem) => {
    setEntryMode(null);
    setEditingCase(null);
    // Navigate to that case's dashboard
    setCurrentPage(`case-${c.type}` as NavPage);
  };

  const viewingCase = activeCompany.cases.find(c => c.id === viewingCaseId) || null;

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
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
      />

      {/* Preferences / Backup Modal */}
      <BackupModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Collapsible Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={page => {
          setEntryMode(null);
          setCurrentPage(page);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Top Bar Contract */}
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          isSidebarOpen={sidebarOpen}
          onOpenSettings={() => setSettingsOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {entryMode ? (
            <CaseEntryForm
              type={entryMode}
              editingCase={editingCase}
              onBack={() => setEntryMode(null)}
              onSaved={handleCaseSaved}
            />
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <Dashboard
                  onNavigate={setCurrentPage}
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => setViewingCaseId(id)}
                />
              )}

              {currentPage === 'case-mutation' && (
                <CaseDashboard
                  type="mutation"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => setViewingCaseId(id)}
                  onEditCase={handleEditCase}
                />
              )}

              {currentPage === 'case-misc' && (
                <CaseDashboard
                  type="misc"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => setViewingCaseId(id)}
                  onEditCase={handleEditCase}
                />
              )}

              {currentPage === 'case-lrappeal' && (
                <CaseDashboard
                  type="lrappeal"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => setViewingCaseId(id)}
                  onEditCase={handleEditCase}
                />
              )}

              {currentPage === 'case-firstappeal' && (
                <CaseDashboard
                  type="firstappeal"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => setViewingCaseId(id)}
                  onEditCase={handleEditCase}
                />
              )}

              {currentPage === 'case-rti' && (
                <CaseDashboard
                  type="rti"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => setViewingCaseId(id)}
                  onEditCase={handleEditCase}
                />
              )}

              {currentPage === 'case-lrtt' && (
                <CaseDashboard
                  type="lrtt"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => setViewingCaseId(id)}
                  onEditCase={handleEditCase}
                />
              )}

              {currentPage === 'case-conversion' && (
                <CaseDashboard
                  type="conversion"
                  onOpenNewCase={handleOpenNewCase}
                  onViewCaseDetail={id => setViewingCaseId(id)}
                  onEditCase={handleEditCase}
                />
              )}

              {currentPage === 'causelist' && <CauseList />}

              {currentPage === 'sharecalculator' && <ShareCalculator />}

              {currentPage === 'aistudio' && <AiStudio />}

              {currentPage === 'parties' && <PartyRegistry />}

              {currentPage === 'users' && <TeamRoles />}

              {currentPage === 'wblract' && <StatutoryLibrary />}

              {currentPage === 'vault' && <DocumentVault />}

              {currentPage === 'timeline' && <CaseDiary />}

              {currentPage === 'messages' && <CommunicationCenter />}
            </>
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) Menu */}
      <div className="fixed bottom-6 right-6 z-40">
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
                setCurrentPage('causelist');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Daily Cause List</span>
            </button>

            <button
              onClick={() => {
                setFabOpen(false);
                setCurrentPage('aistudio');
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 cursor-pointer"
            >
              <Brain className="w-4 h-4 text-violet-600" />
              <span>AI Drafting Studio</span>
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
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
