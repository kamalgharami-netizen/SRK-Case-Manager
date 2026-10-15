import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CaseItem, ChainLink } from '../types';
import { DEFAULT_CHAIN_SAMPLE_TEMPLATE, generateChainDeedText } from '../data/chainSampleTemplate';
import { CompanyLogo } from './CompanyLogo';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Save,
  ArrowRight
} from 'lucide-react';

interface ChainDeedModalProps {
  caseItem: CaseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCase?: (updatedCase: CaseItem) => void;
}

export const ChainDeedModal: React.FC<ChainDeedModalProps> = ({
  caseItem,
  isOpen,
  onClose,
  onSaveCase
}) => {
  const { activeCompany, updateCase, showToast, language } = useApp();

  const [chainLinks, setChainLinks] = useState<ChainLink[]>([]);
  const [draftText, setDraftText] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // New/Edit deed fields
  const [deedNo, setDeedNo] = useState('');
  const [deedDate, setDeedDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [purchaser, setPurchaser] = useState('');
  const [area, setArea] = useState('');
  const [consideration, setConsideration] = useState('');
  const [sro, setSro] = useState('');

  // Active view tab: 'editor' | 'preview'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

  useEffect(() => {
    if (caseItem && isOpen) {
      const initialLinks = caseItem.chainLinks || [];
      setChainLinks(initialLinks);

      if (caseItem.chainDeedDraft) {
        setDraftText(caseItem.chainDeedDraft);
      } else {
        const template = activeCompany?.chainSampleTemplate || DEFAULT_CHAIN_SAMPLE_TEMPLATE;
        const generated = generateChainDeedText(
          caseItem,
          template,
          activeCompany?.name || 'SRK Legal Chamber',
          activeCompany?.barCouncil || 'WB/Chamber',
          activeCompany?.city || 'Kolkata'
        );
        setDraftText(generated);
      }
    }
  }, [caseItem, isOpen, activeCompany]);

  if (!isOpen || !caseItem) return null;

  // Title gap detection
  const sortedLinks = [...chainLinks].sort((a, b) => {
    if (!a.deedDate) return 1;
    if (!b.deedDate) return -1;
    return new Date(a.deedDate).getTime() - new Date(b.deedDate).getTime();
  });

  const gapWarnings: string[] = [];
  for (let i = 1; i < sortedLinks.length; i++) {
    const prevPurchaser = sortedLinks[i - 1].purchaser.trim().toLowerCase();
    const currentVendor = sortedLinks[i].vendor.trim().toLowerCase();
    if (prevPurchaser && currentVendor && prevPurchaser !== currentVendor) {
      gapWarnings.push(
        `Gap Alert between Deed #${sortedLinks[i - 1].deedNo} and Deed #${sortedLinks[i].deedNo}: Purchaser "${sortedLinks[i - 1].purchaser}" does not match subsequent Vendor "${sortedLinks[i].vendor}". (Verify Farayez / Inheritance link).`
      );
    }
  }

  const handleAddOrUpdateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deedNo.trim()) {
      showToast('Deed number is required', 'error');
      return;
    }

    if (editingLinkId) {
      setChainLinks(prev =>
        prev.map(item =>
          item.id === editingLinkId
            ? {
                ...item,
                deedNo: deedNo.trim(),
                deedDate,
                vendor: vendor.trim(),
                purchaser: purchaser.trim(),
                area: area.trim(),
                consideration: consideration.trim(),
                registrationOffice: sro.trim()
              }
            : item
        )
      );
      setEditingLinkId(null);
      showToast('Chain Deed link updated');
    } else {
      const newLink: ChainLink = {
        id: 'link_' + Date.now(),
        deedNo: deedNo.trim(),
        deedDate,
        vendor: vendor.trim(),
        purchaser: purchaser.trim(),
        area: area.trim(),
        consideration: consideration.trim(),
        registrationOffice: sro.trim()
      };
      setChainLinks(prev => [...prev, newLink]);
      showToast('Chain Deed link added');
    }

    // Reset inputs
    setDeedNo('');
    setDeedDate('');
    setVendor('');
    setPurchaser('');
    setArea('');
    setConsideration('');
    setSro('');
  };

  const handleEditLink = (l: ChainLink) => {
    setEditingLinkId(l.id);
    setDeedNo(l.deedNo);
    setDeedDate(l.deedDate);
    setVendor(l.vendor);
    setPurchaser(l.purchaser);
    setArea(l.area);
    setConsideration(l.consideration);
    setSro(l.registrationOffice || '');
    setActiveTab('editor');
  };

  const handleDeleteLink = (id: string) => {
    setChainLinks(prev => prev.filter(l => l.id !== id));
    showToast('Deed link removed');
  };

  const handleRegenerateFromSample = () => {
    const updatedCaseItem: CaseItem = {
      ...caseItem,
      chainLinks
    };
    const template = activeCompany?.chainSampleTemplate || DEFAULT_CHAIN_SAMPLE_TEMPLATE;
    const generated = generateChainDeedText(
      updatedCaseItem,
      template,
      activeCompany?.name || 'SRK Legal Chamber',
      activeCompany?.barCouncil || 'WB/Chamber',
      activeCompany?.city || 'Kolkata'
    );
    setDraftText(generated);
    setActiveTab('preview');
    showToast('Chain Deed draft regenerated from Settings Sample!');
  };

  const handleSaveToCase = () => {
    const updated: CaseItem = {
      ...caseItem,
      chainLinks,
      chainDeedDraft: draftText
    };

    updateCase(caseItem.id, {
      chainLinks,
      chainDeedDraft: draftText
    });

    if (onSaveCase) {
      onSaveCase(updated);
    }

    showToast('Chain Deed statement saved to Case Details!');
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Chain of Title Deed - ${caseItem.caseNo}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; font-size: 13.5px; }
            h2, h3 { margin: 0 0 6px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 12px 0 16px 0; }
            pre { font-family: inherit; white-space: pre-wrap; word-break: break-word; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12.5px; }
            th, td { border: 1px solid #666; padding: 6px 8px; text-align: left; }
            th { background: #EEF2F6; font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'SRK Legal Chamber'}</h2>
            <div>${activeCompany?.address || ''}, ${activeCompany?.city || 'Kolkata'}, West Bengal</div>
            <div style="font-size: 12px; color: #555;">Bar Council Registration: ${activeCompany?.barCouncil || 'WB/Chamber'}</div>
          </div>
          <hr />
          <pre>${draftText}</pre>
          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div>Verified By: ___________________</div>
            <div style="text-align: right;">Advocate Seal & Signature: ___________________</div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  const handleDownloadWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Chain Deed - ${caseItem.caseNo}</title>
    <style>body{font-family:'Times New Roman',serif; font-size: 12pt; line-height: 1.5;} pre{white-space: pre-wrap; font-family:'Times New Roman',serif;}</style>
    </head><body>
    <div style="text-align:center;font-weight:bold;font-size:16pt;color:#1E3A8A;">${activeCompany?.name || 'SRK Legal Chamber'}</div>
    <div style="text-align:center;font-size:10pt;">${activeCompany?.city || 'West Bengal'} · Bar Council Reg: ${activeCompany?.barCouncil || ''}</div>
    <hr/>
    <pre>${draftText}</pre>
    </body></html>`;

    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chain_Deed_${caseItem.caseNo.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chain Deed downloaded as Word (.doc)');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    showToast('Chain Deed draft copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-4">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-850/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 shadow-xs">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {caseItem.type === 'mutation'
                    ? (language === 'bn' ? 'মিউটেশন কেস ধারাবাহিক চেইন দলিল মেকার' : 'Mutation Case Chain Deed Maker')
                    : caseItem.type === 'misc'
                    ? (language === 'bn' ? 'মিস কেস ধারাবাহিক চেইন দলিল মেকার' : 'Misc Case Chain Deed Maker')
                    : caseItem.type === 'lrappeal'
                    ? (language === 'bn' ? 'এল.আর. আপিল কেস চেইন দলিল মেকার' : 'LR Appeal Case Chain Deed Maker')
                    : (language === 'bn' ? 'ট্রাইব্যুনাল কেস চেইন দলিল মেকার' : 'WBLRTT Case Chain Deed Maker')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                  {caseItem.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Particular Case Info: <strong className="text-blue-600 dark:text-blue-400 font-mono">{caseItem.caseNo}</strong> · Party: <strong>{caseItem.party}</strong> · Forum: {caseItem.forum}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CompanyLogo company={activeCompany} size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Source from Setting Notice banner: Clean & Isolated to this particular case */}
        <div className="px-4 py-2 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Format sourced from <strong>Settings &gt; Chain Sample</strong>. Exclusively isolated to particular case <strong>{caseItem.caseNo}</strong>. No other matter is shown on this page.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerateFromSample}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
              title="Regenerate format using latest Settings Chain Sample and current case info"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Regenerate from Sample</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Draft &amp; Legal Statement</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Deed Links Manager ({chainLinks.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            <button
              type="button"
              onClick={handleDownloadWord}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Word (.doc)
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={handleSaveToCase}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save to Case
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Title Gap Warnings if any */}
          {gapWarnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Title Chain Break / Succession Notice:</span>
              </div>
              {gapWarnings.map((gw, idx) => (
                <div key={idx} className="pl-5 text-[11px] leading-relaxed">
                  • {gw}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'preview' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Customizable West Bengal Title Chain Statement for{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{caseItem.caseNo}</strong>:
                </span>
                <span className="text-[11px] font-mono">
                  Characters: {draftText.length}
                </span>
              </div>

              <textarea
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                rows={18}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs leading-relaxed focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
                placeholder="Chain Deed draft text..."
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form to Add / Edit Chain Deed link */}
              <form
                onSubmit={handleAddOrUpdateLink}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>{editingLinkId ? 'Edit Via Deed Link' : 'Add Registered Via Deed'}</span>
                  </h4>
                  {editingLinkId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLinkId(null);
                        setDeedNo('');
                        setDeedDate('');
                        setVendor('');
                        setPurchaser('');
                        setArea('');
                        setConsideration('');
                        setSro('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Deed No. (দলিল নং) *
                    </label>
                    <input
                      type="text"
                      value={deedNo}
                      onChange={e => setDeedNo(e.target.value)}
                      placeholder="e.g. 1045/1984"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Deed Registration Date (তারিখ)
                    </label>
                    <input
                      type="date"
                      value={deedDate}
                      onChange={e => setDeedDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Registry Office (SRO / ADSR)
                    </label>
                    <input
                      type="text"
                      value={sro}
                      onChange={e => setSro(e.target.value)}
                      placeholder="e.g. ADSR Canning"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Vendor / Transferor (দাতা)
                    </label>
                    <input
                      type="text"
                      value={vendor}
                      onChange={e => setVendor(e.target.value)}
                      placeholder="Name of vendor"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Purchaser / Transferee (গ্রহীতা)
                    </label>
                    <input
                      type="text"
                      value={purchaser}
                      onChange={e => setPurchaser(e.target.value)}
                      placeholder="Name of purchaser"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Area (পরিমাণ)
                      </label>
                      <input
                        type="text"
                        value={area}
                        onChange={e => setArea(e.target.value)}
                        placeholder="10 Satak"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Consideration
                      </label>
                      <input
                        type="text"
                        value={consideration}
                        onChange={e => setConsideration(e.target.value)}
                        placeholder="Rs. 1,50,000"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingLinkId ? 'Update Deed' : 'Add to Chain'}</span>
                  </button>
                </div>
              </form>

              {/* Table of Existing Chain Links */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                  Chronological Deed Chain for Case #{caseItem.caseNo} ({chainLinks.length} deeds)
                </h4>

                {chainLinks.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                    No registered via deeds recorded for this case yet. Add the consecutive deeds using the form above.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Deed No.</th>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">SRO Office</th>
                          <th className="p-2.5">Vendor (দাতা)</th>
                          <th className="p-2.5">Purchaser (গ্রহীতা)</th>
                          <th className="p-2.5">Area</th>
                          <th className="p-2.5">Price</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {sortedLinks.map((link, idx) => (
                          <tr
                            key={link.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 font-bold font-mono text-blue-600 dark:text-blue-400">
                              {link.deedNo}
                            </td>
                            <td className="p-2.5">{link.deedDate || '—'}</td>
                            <td className="p-2.5 text-slate-500">{link.registrationOffice || 'SRO'}</td>
                            <td className="p-2.5 font-medium">{link.vendor || '—'}</td>
                            <td className="p-2.5 font-medium">{link.purchaser || '—'}</td>
                            <td className="p-2.5">{link.area || '—'}</td>
                            <td className="p-2.5">{link.consideration || '—'}</td>
                            <td className="p-2.5 text-right space-x-1">
                              <button
                                type="button"
                                onClick={() => handleEditLink(link)}
                                className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Edit Deed"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLink(link.id)}
                                className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Delete Deed"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Dedicated for <strong>Mutation, Misc Case, LR Appeal &amp; LRTT</strong> only.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveToCase}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save &amp; Update Case Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
