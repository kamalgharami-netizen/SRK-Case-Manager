import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Download,
  Upload,
  Building2,
  Shield,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Trash2,
  Link as LinkIcon,
  Save,
  FileText,
  Archive,
  Plus,
  Search,
  Eye,
  Copy,
  Edit2,
  FileCode,
  Brain,
  Filter,
  Check
} from 'lucide-react';
import { CompanyLogo, BADGE_OPTIONS, COLOR_OPTIONS } from './CompanyLogo';
import { DEFAULT_CHAIN_SAMPLE_TEMPLATE } from '../data/chainSampleTemplate';
import { SampleDraftItem, VaultFile } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'branding' | 'vault' | 'chainSample' | 'backup';
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'branding'
}) => {
  const {
    activeCompany,
    exportCompanyJson,
    restoreCompany,
    updateCompanyDetails,
    showToast,
    sampleDrafts,
    addSampleDraft,
    updateSampleDraft,
    deleteSampleDraft,
    resetSampleDrafts,
    addVaultFile,
    deleteVaultFile
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const vaultUploadInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'branding' | 'vault' | 'chainSample' | 'backup'>(initialTab);
  const [chainSampleDraft, setChainSampleDraft] = useState('');

  // Vault Tab state
  const [vaultSubTab, setVaultSubTab] = useState<'samples' | 'files'>('samples');
  const [sampleCategoryFilter, setSampleCategoryFilter] = useState<string>('All');
  const [sampleSearch, setSampleSearch] = useState('');

  // Editing / Creating new Sample Draft in Vault
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState<SampleDraftItem['category']>('general');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftText, setDraftText] = useState('');

  // AI Draft Generator state inside Vault
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // File search & filter
  const [fileSearch, setFileSearch] = useState('');
  const [fileCategoryFilter, setFileCategoryFilter] = useState('All');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (activeCompany) {
      setChainSampleDraft(activeCompany.chainSampleTemplate || DEFAULT_CHAIN_SAMPLE_TEMPLATE);
    }
  }, [activeCompany]);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo image must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      updateCompanyDetails({ logoUrl: dataUrl });
      showToast('Dynamic custom logo updated!');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectBadge = (badgeId: string) => {
    updateCompanyDetails({
      logoBadge: badgeId as any,
      logoUrl: undefined // Switch back to insignia badge
    });
  };

  const handleSelectColor = (colorId: string) => {
    updateCompanyDetails({ logoColor: colorId });
  };

  const handleRemoveCustomLogo = () => {
    updateCompanyDetails({ logoUrl: undefined });
    showToast('Switched to dynamic insignia crest');
  };

  // Vault File Upload Handler
  const handleVaultFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;

    Array.from(uploaded).forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      let fType: 'pdf' | 'doc' | 'img' | 'other' = 'other';
      if (ext === 'pdf') fType = 'pdf';
      else if (['doc', 'docx'].includes(ext || '')) fType = 'doc';
      else if (['jpg', 'jpeg', 'png'].includes(ext || '')) fType = 'img';

      const sizeStr =
        f.size < 1024 * 1024
          ? (f.size / 1024).toFixed(1) + ' KB'
          : (f.size / (1024 * 1024)).toFixed(2) + ' MB';

      addVaultFile({
        name: f.name,
        size: sizeStr,
        type: fType,
        date: new Date().toISOString().slice(0, 10),
        category: fileCategoryFilter !== 'All' ? fileCategoryFilter : 'Registered Deeds',
        aiLearned: true
      });
    });
    showToast('Files saved in Document Vault');
  };

  // Save new or updated Sample Draft format in Vault
  const handleSaveSampleDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftText.trim()) {
      showToast('Title and Template Format text are required', 'error');
      return;
    }

    if (editingDraftId) {
      updateSampleDraft(editingDraftId, {
        title: draftTitle.trim(),
        category: draftCategory,
        description: draftDescription.trim(),
        templateText: draftText
      });
    } else {
      addSampleDraft({
        title: draftTitle.trim(),
        category: draftCategory,
        description: draftDescription.trim() || 'Custom user legal format for chamber drafting',
        templateText: draftText,
        aiAssisted: false
      });
    }

    setIsEditingDraft(false);
    setEditingDraftId(null);
    setDraftTitle('');
    setDraftDescription('');
    setDraftText('');
  };

  const handleOpenEditSampleDraft = (item: SampleDraftItem) => {
    setEditingDraftId(item.id);
    setDraftTitle(item.title);
    setDraftCategory(item.category);
    setDraftDescription(item.description);
    setDraftText(item.templateText);
    setIsEditingDraft(true);
  };

  // AI Draft Assistance inside Document Vault
  const handleGenerateAiFormat = () => {
    if (!aiPrompt.trim()) {
      showToast('Please enter what format or petition you want to generate', 'error');
      return;
    }

    setAiGenerating(true);
    setTimeout(() => {
      const generatedTemplate = `FORMAL LEGAL DRAFT / PETITION
BEFORE THE COMPETENT REVENUE AUTHORITY / COURT OF LAW
DISTRICT: {{DISTRICT}}, WEST BENGAL

Subject Matter: ${aiPrompt.trim()}

Case / Proceeding Ref: {{CASE_NO}}
In the Matter of:
{{PARTY}}
...Petitioner / Applicant

-VERSUS-
1. {{OPP}}
2. State of West Bengal.
...Opposite Parties

SCHEDULE OF PROPERTY:
Mouza: {{MOUZA}}, J.L. No: {{JL}}, Khatian No: {{KHATIAN}}, Plot / Dag No: {{DAG}}, Area: {{AREA}} {{UNIT}}, Classification: {{CLASSIFICATION}}.

GROUNDS & STATUTORY PROVISIONS:
1. That the applicant has valid right, title, and lawful possession over the subject property by virtue of Registered Deed No. {{DEED_NO}}.
2. That the opposing party / administrative inaction has caused legal prejudice to the applicant's rights under the West Bengal Land Reforms Act, 1955.
3. That the applicant has made representations which remain unredressed.

PRAYER:
In the premises aforesaid, the Petitioner respectfully prays that Your Honour may graciously be pleased to:
a) Pass an appropriate order granting requisite relief in accordance with law;
b) Direct immediate field spot enquiry;
And pass such further order or orders as may be just and proper.

Advocate for the Petitioner
Chamber: {{CHAMBER_NAME}}
Date: {{TODAY_DATE}}`;

      addSampleDraft({
        title: `AI Draft: ${aiPrompt.slice(0, 45)}...`,
        category: 'general',
        description: `Generated with AI Draft Assistant based on prompt: "${aiPrompt.trim()}"`,
        templateText: generatedTemplate,
        aiAssisted: true
      });

      setAiGenerating(false);
      setAiPromptOpen(false);
      setAiPrompt('');
      showToast('AI Legal Format generated and stored in Document Vault!');
    }, 700);
  };

  // Filtered sample drafts
  const filteredSamples = sampleDrafts.filter(s => {
    const matchCat =
      sampleCategoryFilter === 'All' ||
      s.category === sampleCategoryFilter ||
      (sampleCategoryFilter === 'chain' && s.category === 'chain');
    const q = sampleSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.templateText.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // Filtered vault files
  const vaultFiles = activeCompany.vaultFiles || [];
  const filteredFiles = vaultFiles.filter(f => {
    const matchCat = fileCategoryFilter === 'All' || f.category === fileCategoryFilter;
    const q = fileSearch.toLowerCase().trim();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const sampleCategories = [
    { id: 'All', label: 'All Formats' },
    { id: 'chain', label: 'Chain of Title' },
    { id: 'mutation', label: 'Mutation' },
    { id: 'misc', label: 'Misc Case' },
    { id: 'lrappeal', label: 'LR Appeal' },
    { id: 'lrtt', label: 'WBLRTT Tribunal' },
    { id: 'rti', label: 'RTI' },
    { id: 'conversion', label: 'Conversion' },
    { id: 'general', label: 'General & Custom' }
  ];

  const fileCategories = [
    'All',
    'Registered Deeds',
    'Court Orders',
    'Khatian Copies',
    'Certificates',
    'Pleadings & Petitions',
    'Draft Templates'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-4">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-850/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Chamber Settings &amp; Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage firm brand identity, Document Vault samples, master Chain Sample, and backups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CompanyLogo company={activeCompany} size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'branding'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Logo &amp; Brand</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'vault'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Archive className="w-4 h-4 text-indigo-500" />
            <span>Document Vault &amp; Samples</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chainSample')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'chainSample'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-blue-500" />
            <span>Chain Sample</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Data Backup</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: Logo & Branding */}
          {activeTab === 'branding' && (
            <div className="space-y-5">
              {/* Active Firm Profile with Dynamic Logo */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <CompanyLogo company={activeCompany} size="xl" />
                <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {activeCompany.name}
                  </div>
                  <div className="text-slate-500 font-mono">
                    Bar Reg: {activeCompany.barCouncil || 'WB/Chamber'}
                  </div>
                  <div className="text-slate-500 truncate">
                    {activeCompany.city}, West Bengal · {activeCompany.phone}
                  </div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-1">
                    Integrated Dynamic Logo displays automatically across Header, Sidebar, Dashboard &amp; Case Prints.
                  </div>
                </div>
              </div>

              {/* Custom Logo Upload (Vyapar App style) */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Upload Custom Chamber Logo Image (Vyapar App Style)</span>
                  </div>
                  {activeCompany.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveCustomLogo}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Custom Image</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload your law firm's official PNG, JPG, or SVG seal/emblem. It will be stored in your browser storage and rendered smoothly offline.
                </p>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>{activeCompany.logoUrl ? 'Change Custom Logo Image' : 'Upload Firm Logo Image'}</span>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>

              {/* Dynamic Legal Insignia Selector */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Or Select Pre-Designed Professional Legal Insignia
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BADGE_OPTIONS.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBadge(b.id)}
                      className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                        activeCompany.logoBadge === b.id && !activeCompany.logoUrl
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 ring-2 ring-blue-600 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-slate-900 dark:text-slate-100 font-semibold">{b.label}</div>
                      <div className="text-[10px] text-slate-500">{b.bengali}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Color Theme Palette */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chamber Brand Accent Theme</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectColor(c.id)}
                      className={`p-2 rounded-lg text-left border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        activeCompany.logoColor === c.id
                          ? 'border-blue-600 ring-2 ring-blue-600 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: c.id }}
                      />
                      <span className="text-[11px] truncate text-slate-800 dark:text-slate-200">
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Document Vault & Samples (Shifted to Settings!) */}
          {activeTab === 'vault' && (
            <div className="space-y-5">
              {/* Notice Banner */}
              <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Document Vault &amp; Sample Formats:</strong> Centralized repository stored in Settings. You can store, customize, or generate ANY type of legal format or deed for drafting with AI.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAiPromptOpen(!aiPromptOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>AI Format Generator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingDraftId(null);
                      setDraftTitle('');
                      setDraftCategory('general');
                      setDraftDescription('');
                      setDraftText('');
                      setIsEditingDraft(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Format</span>
                  </button>
                </div>
              </div>

              {/* AI Draft Prompt Drawer */}
              {aiPromptOpen && (
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span>Formulate Any Legal Format or Deed with AI</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAiPromptOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder="e.g., Draft an objection petition under Sec 50A for erroneous khatian recording, or Title Partition Deed format..."
                    className="w-full p-2.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={aiGenerating || !aiPrompt.trim()}
                      onClick={handleGenerateAiFormat}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{aiGenerating ? 'Formulating...' : 'Generate Format with AI & Save to Vault'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-Tabs: Sample Drafts vs Uploaded Documents */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setVaultSubTab('samples')}
                    className={`pb-1 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      vaultSubTab === 'samples'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Sample Drafts &amp; Formats ({sampleDrafts.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVaultSubTab('files')}
                    className={`pb-1 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      vaultSubTab === 'files'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Uploaded Vault Documents ({vaultFiles.length})</span>
                  </button>
                </div>

                {vaultSubTab === 'samples' && (
                  <button
                    type="button"
                    onClick={resetSampleDrafts}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Standard Templates</span>
                  </button>
                )}
              </div>

              {/* Subtab View 1: Sample Formats */}
              {vaultSubTab === 'samples' && (
                <div className="space-y-4">
                  {/* Category filters & Search */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {sampleCategories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSampleCategoryFilter(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            sampleCategoryFilter === cat.id
                              ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={sampleSearch}
                        onChange={e => setSampleSearch(e.target.value)}
                        placeholder="Search sample formats..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Add / Edit Format Modal Inline */}
                  {isEditingDraft && (
                    <form
                      onSubmit={handleSaveSampleDraft}
                      className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                          <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{editingDraftId ? 'Edit Format in Vault' : 'Add New Legal Format / Deed Template'}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsEditingDraft(false)}
                          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Format Title</label>
                          <input
                            type="text"
                            required
                            value={draftTitle}
                            onChange={e => setDraftTitle(e.target.value)}
                            placeholder="e.g., Section 50 Mutation Petition Format..."
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Category</label>
                          <select
                            value={draftCategory}
                            onChange={e => setDraftCategory(e.target.value as any)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value="chain">Chain of Title</option>
                            <option value="mutation">Mutation</option>
                            <option value="misc">Misc Case</option>
                            <option value="lrappeal">LR Appeal</option>
                            <option value="lrtt">WBLRTT Tribunal</option>
                            <option value="firstappeal">First Appeal</option>
                            <option value="rti">RTI</option>
                            <option value="conversion">Conversion</option>
                            <option value="general">General / Custom</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Description</label>
                        <input
                          type="text"
                          value={draftDescription}
                          onChange={e => setDraftDescription(e.target.value)}
                          placeholder="Brief description of this legal format..."
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Template Text &amp; Placeholders (use {'{{CASE_NO}}'}, {'{{PARTY}}'}, {'{{MOUZA}}'}, {'{{DAG}}'}, etc.)
                        </label>
                        <textarea
                          rows={8}
                          required
                          value={draftText}
                          onChange={e => setDraftText(e.target.value)}
                          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs leading-relaxed"
                          placeholder="Enter legal template text..."
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingDraft(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Format to Vault</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Sample formats list */}
                  <div className="grid grid-cols-1 gap-3">
                    {filteredSamples.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-indigo-500 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {item.title}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {item.category}
                              </span>
                              {item.aiAssisted && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> AI Generated
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.templateText);
                                showToast('Template format copied to clipboard!');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                              title="Copy Template"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditSampleDraft(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                              title="Edit Format"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {item.id.startsWith('sd_') && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete format "${item.title}"?`)) {
                                    deleteSampleDraft(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs cursor-pointer"
                                title="Delete Format"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Collapsible/Preview snippet */}
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                          {item.templateText.slice(0, 300)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab View 2: Uploaded Documents */}
              {vaultSubTab === 'files' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {fileCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFileCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            fileCategoryFilter === cat
                              ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => vaultUploadInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Documents</span>
                      </button>
                      <input
                        ref={vaultUploadInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleVaultFileUpload}
                      />
                    </div>
                  </div>

                  {filteredFiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredFiles.map(f => (
                        <div
                          key={f.id}
                          className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-500 transition-colors flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                              <Archive className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={f.name}>
                                {f.name}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {f.category} · {f.size}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Uploaded: {f.date}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => showToast(`Previewing ${f.name}`, 'info')}
                              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete "${f.name}" from Vault?`)) {
                                  deleteVaultFile(f.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-850/40">
                      No files in Vault under "{fileCategoryFilter}". Click "Upload Documents" to store registered deeds, orders, and khatians.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Chain Sample (Exclusive Master Draft configured in Settings) */}
          {activeTab === 'chainSample' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  <span>Chain Sample Master Draft (চেইন দলিল নমুনা খসড়া)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-200/80">
                  This master format serves as the template source for <strong>Mutation, Misc Case, LR Appeal, and LRTT</strong> case chain deed creation. It is exclusively stored in this Settings menu as "Chain Sample" and will not show in other menus. It binds dynamically with the particular case's information.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Master Template Text (নমুনা খসড়া ফরম্যাট)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setChainSampleDraft(DEFAULT_CHAIN_SAMPLE_TEMPLATE);
                      showToast('Reset to West Bengal Standard Sample Draft');
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default Sample</span>
                  </button>
                </div>

                <textarea
                  value={chainSampleDraft}
                  onChange={e => setChainSampleDraft(e.target.value)}
                  rows={14}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs leading-relaxed focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
                  placeholder="Enter chain deed template format..."
                />
              </div>

              {/* Dynamic Placeholders Helper */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Dynamic Placeholders Injected for Particular Case:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[10px]">
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{CASE_NO}}`} (Case No)
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{PARTY}}`} (Petitioner)
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{OPP}}`} (Opposite Party)
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{FORUM}}`} (BL&amp;LRO/Court)
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{MOUZA}}`} (Mouza Name)
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{JL}}`} (J.L. No)
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{KHATIAN}}`} (Khatian No)
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{DAG}}`} (Dag / Plot)
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{AREA}}`} (Quantum)
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{CHAIN_DEEDS_TABLE}}`}
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{CHAIN_DEED_NARRATIVE}}`}
                  </span>
                  <span className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {`{{CHAMBER_NAME}}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    updateCompanyDetails({ chainSampleTemplate: chainSampleDraft });
                    showToast('Chain Sample Master Draft saved in Settings!');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Chain Sample Template</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Data Backup & Restore */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Chamber Database Preservation &amp; Portability
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={exportCompanyJson}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition-all group cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Export Full Chamber Backup (.json)
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Download complete database including cases, parties, cause list, vault references, and sample formats.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-left transition-all group cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Restore Chamber from Backup
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Import a previously exported .json archive file to restore all chamber records instantly.
                    </div>
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
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Chamber: {activeCompany.name} · {activeCompany.city}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white cursor-pointer transition-colors shadow-xs"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
