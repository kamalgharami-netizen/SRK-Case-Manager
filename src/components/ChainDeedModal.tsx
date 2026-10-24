import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CaseItem, ChainLink, WB_DEED_TYPES } from '../types';
import { DEFAULT_CHAIN_SAMPLE_TEMPLATE, generateChainDeedText } from '../data/chainSampleTemplate';
import { safePrintHtml } from '../utils/printDoc';
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
  ArrowRight,
  Scroll,
  Users,
  UserCheck,
  Languages,
  Loader2
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
  const { activeCompany, updateCase, showToast, language, sampleDrafts } = useApp();

  const [chainLinks, setChainLinks] = useState<ChainLink[]>([]);
  const [draftText, setDraftText] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [docLang, setDocLang] = useState<'bn' | 'en'>('bn');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // New/Edit deed & warish fields
  const [linkType, setLinkType] = useState<'deed' | 'warish'>('deed');
  const [deedNo, setDeedNo] = useState('');
  const [deedDate, setDeedDate] = useState('');
  const [deedYear, setDeedYear] = useState('');
  const [deedType, setDeedType] = useState<string>('সাফ কোবালা (Sale / Kobala)');
  const [vendors, setVendors] = useState<string[]>(['']);
  const [purchasers, setPurchasers] = useState<string[]>(['']);
  const [warishNames, setWarishNames] = useState<string[]>(['']);
  const [deceasedName, setDeceasedName] = useState('');
  const [area, setArea] = useState('');
  const [consideration, setConsideration] = useState('');
  const [sro, setSro] = useState('');
  const [certificateRef, setCertificateRef] = useState('');
  const [warishDetails, setWarishDetails] = useState('');

  // Active view tab: 'editor' | 'preview'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

  useEffect(() => {
    if (caseItem && isOpen) {
      const initialLinks = (caseItem.chainLinks || []).map(l => ({
        ...l,
        vendors: l.vendors && l.vendors.length > 0 ? l.vendors : (l.vendor ? [l.vendor] : ['']),
        purchasers: l.purchasers && l.purchasers.length > 0 ? l.purchasers : (l.purchaser ? [l.purchaser] : ['']),
        warishNames: l.warishNames && l.warishNames.length > 0 ? l.warishNames : (l.purchaser ? [l.purchaser] : [''])
      }));
      setChainLinks(initialLinks);

      if (caseItem.chainDeedDraft) {
        setDraftText(caseItem.chainDeedDraft);
      } else {
        // Auto-generate using Bengali or English initial text
        generateInitialText(caseItem, initialLinks, docLang);
      }
    }
  }, [caseItem, isOpen, activeCompany]);

  if (!isOpen || !caseItem) return null;

  function generateInitialText(cItem: CaseItem, links: ChainLink[], lang: 'bn' | 'en') {
    const s = cItem.landSchedules?.[0] || {
      district: '—',
      block: '—',
      mouza: '—',
      jl: '—',
      khatian: '—',
      dag: '—',
      area: '—',
      unit: 'Satak',
      classification: 'Bastu'
    };

    if (lang === 'bn') {
      let table = `| ক্রমিক | হস্তান্তরের ধরন | দলিল / সনদপত্র নং | সাল / তারিখ | হস্তান্তরকারী (দাতা) | গ্রহীতা (ক্রেতা / ওয়ারিশ) | অফিস |\n|---|---|---|---|---|---|---|\n`;
      links.forEach((l, idx) => {
        const type = l.linkType === 'warish' ? 'ওয়ারিশান সূত্রে' : (l.deedType || 'সাফ কোবালা');
        const doc = l.linkType === 'warish' ? (l.certificateRef || 'ওয়ারিশান সনদ') : (l.deedNo || '—');
        const yr = l.deedYear || l.deedDate || '—';
        const from = l.vendors && l.vendors.length > 0 ? l.vendors.filter(Boolean).join(', ') : (l.vendor || '—');
        const to = l.linkType === 'warish'
          ? (l.warishNames && l.warishNames.length > 0 ? l.warishNames.filter(Boolean).join(', ') : l.purchaser)
          : (l.purchasers && l.purchasers.length > 0 ? l.purchasers.filter(Boolean).join(', ') : l.purchaser);
        table += `| ${idx + 1} | ${type} | ${doc} | ${yr} | ${from} | ${to} | ${l.registrationOffice || '—'} |\n`;
      });

      let recitals = '';
      links.forEach((l, idx) => {
        if (l.linkType === 'warish') {
          const heirs = l.warishNames && l.warishNames.length > 0 ? l.warishNames.filter(Boolean).join(', ') : l.purchaser;
          recitals += `\n(${idx + 1}) পূর্ববর্তী স্বত্বাধিকারী ${l.vendor} মৃত্যুবরণ করিলে তাহার ওয়ারিশান হিসাবে ${heirs} স্থানীয় কর্তৃপক্ষ কর্তৃক প্রদত্ত সনদপত্র (স্মারক: ${l.certificateRef || '—'}) মূলে উত্তরাধিকারসূত্রে মালিকানা ও দখল প্রাপ্ত হন।\n`;
        } else {
          const sellers = l.vendors && l.vendors.length > 0 ? l.vendors.filter(Boolean).join(', ') : l.vendor;
          const buyers = l.purchasers && l.purchasers.length > 0 ? l.purchasers.filter(Boolean).join(', ') : l.purchaser;
          recitals += `\n(${idx + 1}) তৎপর ${sellers} হইতে ${buyers} ${l.registrationOffice || 'রেজিস্ট্রি অফিস'}-এ রেজিস্ট্রিকৃত ${l.deedType || 'সাফ কোবালা'} দলিল (দলিল নং ${l.deedNo || '—'}, সাল ${l.deedYear || '—'}) মূলে নির্ধারিত পণ গ্রহণান্তে জমি হস্তান্তর ও দখল প্রদান করেন।\n`;
        }
      });

      const bnText = `ধারাবাহিক স্বত্ব ও হস্তান্তরের প্রামাণ্য বিবরণী
(CHRONOLOGICAL CHAIN OF TITLE STATEMENT)

বিজ্ঞ সমক্ষে: ${cItem.forum}
মিউটেশন কেস নং: ${cItem.caseNo}
মিউটেশন আবেদন নং: ${cItem.appNo || '—'}
বিষয়: মূল মালিক হইতে বর্তমান আবেদনকারী পর্যন্ত অবিচ্ছিন্ন ধারাবাহিক স্বত্ব বিবরণী।

১. মামলার সংক্ষিপ্ত বিবরণ:
• বর্তমান আবেদনকারী: ${cItem.party}
• আবেদনকারীর পিতার / স্বামীর নাম: ${cItem.applicants?.[0]?.father || '—'}
• আবেদনকারীর ঠিকানা: ${cItem.applicants?.[0]?.address || '—'}
• আবেদনকারীর দলিল নং: ${cItem.applicantDeedNo || '—'} (সাল: ${cItem.applicantDeedYear || '—'}, ধরন: ${cItem.applicantDeedType || '—'}, অফিস: ${cItem.applicantAdsr || '—'})
• প্রতিপক্ষ / নোটিশ প্রাপক: ${cItem.opp || '—'}

২. সম্পত্তির তপশীল বিবরণ:
• জেলা: ${s.district} | ব্লক: ${s.block}
• মৌজা: ${s.mouza} (জে.এল. নং: ${s.jl})
• খতিয়ান নং: ${s.khatian} | দাগ নং: ${s.dag}
• শ্রেণি: ${s.classification} | পরিমাণ: ${s.area} ${s.unit}

৩. ধারাবাহিক চেইন দলিল ও ওয়ারিশান হস্তান্তরের সূচি:
${table}

৪. পর্যায়ক্রমিক স্বত্ব হস্তান্তরের ধারাবাহিক ইতিহাস:
(ক) মূল স্বত্ব: উপরোক্ত তপশীল বর্ণিত ভূমি পশ্চিমবঙ্গ সরকারের আওতাধীন রেকর্ড অনুযায়ী আদি রেকর্ডীয় স্বত্বাধিকারীর নামে বৈধভাবে নথিবদ্ধ ও দখলে ছিল।
${recitals}
(খ) বর্তমান আবেদনকারী ${cItem.party}-এর বৈধ স্বত্ব ও দখল:
উক্ত ধারাবাহিক রেজিস্টার্ড দলিলসমূহ ও ওয়ারিশান পরম্পরায় হস্তান্তর সূত্রে বর্তমান আবেদনকারী ${cItem.party} তফসিল বর্ণিত ভূমির নিরঙ্কুশ, বৈধ স্বত্বাধিকারী ও শান্তিপূর্ণ দখলদার হইয়াছেন। উক্ত জমি সরকারের নিকট কোনো প্রকার খাস বা ১২(২)/১৪জেড সিলিং লঙ্ঘিত নহে।

অতএব, উপরোক্ত অবিচ্ছিন্ন ধারাবাহিক স্বত্ব বিবেচনায় বিজ্ঞ রাজস্ব আধিকারিক সমীপে আবেদনকারীর নামে এল.আর. খতিয়ানে নির্ভুল মিউটেশন রেকর্ড মঞ্জুরের প্রার্থনা জানানো হইতেছে।

তারিখ: ${new Date().toLocaleDateString('bn-BD')}`;
      setDraftText(bnText);
    } else {
      const template = activeCompany?.chainSampleTemplate || DEFAULT_CHAIN_SAMPLE_TEMPLATE;
      const generated = generateChainDeedText(cItem, template, '', '', '');
      // Strip any lawyer firm branding from generated text to keep purely case-related
      const cleaned = generated
        .replace(/Chamber:\s*\{\{CHAMBER_NAME\}\}.*$/s, '')
        .replace(/Advocate for the Petitioner.*$/s, 'Submitted by Petitioner / Transferee')
        .trim();
      setDraftText(cleaned);
    }
  }

  // Title gap detection
  const gapWarnings: string[] = [];
  for (let i = 1; i < chainLinks.length; i++) {
    const prevPurchaser = (chainLinks[i - 1].purchasers?.join(', ') || chainLinks[i - 1].purchaser || '').trim().toLowerCase();
    const currentVendor = (chainLinks[i].vendors?.join(', ') || chainLinks[i].vendor || '').trim().toLowerCase();
    if (prevPurchaser && currentVendor && !currentVendor.includes(prevPurchaser) && !prevPurchaser.includes(currentVendor)) {
      gapWarnings.push(
        `Step #${i} to Step #${i + 1}: Predecessor/Transferee "${chainLinks[i - 1].purchaser}" does not directly match subsequent Transferor/Vendor "${chainLinks[i].vendor}". (Verify Warishan Succession or intermediate conveyance).`
      );
    }
  }

  const resetFormFields = () => {
    setEditingLinkId(null);
    setLinkType('deed');
    setDeedNo('');
    setDeedDate('');
    setDeedYear('');
    setDeedType('সাফ কোবালা (Sale / Kobala)');
    setVendors(['']);
    setPurchasers(['']);
    setWarishNames(['']);
    setDeceasedName('');
    setArea('');
    setConsideration('');
    setSro('');
    setCertificateRef('');
    setWarishDetails('');
  };

  const handleAddOrUpdateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVendors = vendors.map(v => v.trim()).filter(Boolean);
    const cleanPurchasers = purchasers.map(p => p.trim()).filter(Boolean);
    const cleanWarishes = warishNames.map(w => w.trim()).filter(Boolean);

    if (linkType === 'deed') {
      if (!deedNo.trim() && !deedYear.trim()) {
        showToast('Deed number or year is required', 'error');
        return;
      }
      if (cleanPurchasers.length === 0) {
        showToast('At least one buyer is required', 'error');
        return;
      }
    } else {
      if (!deceasedName.trim()) {
        showToast('Deceased owner name is required', 'error');
        return;
      }
      if (cleanWarishes.length === 0) {
        showToast('At least one warish name is required', 'error');
        return;
      }
    }

    const payload: ChainLink = {
      id: editingLinkId || 'link_' + Date.now(),
      linkType,
      deedNo: deedNo.trim(),
      deedDate,
      deedYear: deedYear.trim(),
      deedType: linkType === 'deed' ? deedType : undefined,
      vendor: linkType === 'warish' ? deceasedName.trim() : (cleanVendors.join(', ') || '—'),
      purchaser: linkType === 'warish' ? cleanWarishes.join(', ') : cleanPurchasers.join(', '),
      vendors: linkType === 'deed' ? cleanVendors : [deceasedName.trim()],
      purchasers: linkType === 'deed' ? cleanPurchasers : cleanWarishes,
      warishNames: linkType === 'warish' ? cleanWarishes : undefined,
      area: area.trim(),
      consideration: consideration.trim(),
      registrationOffice: sro.trim(),
      certificateRef: certificateRef.trim(),
      warishDetails: warishDetails.trim()
    };

    if (editingLinkId) {
      setChainLinks(prev => prev.map(item => (item.id === editingLinkId ? payload : item)));
      showToast('Chain step updated');
    } else {
      setChainLinks(prev => [...prev, payload]);
      showToast(linkType === 'warish' ? 'Warishan step added' : 'Chain deed added');
    }

    resetFormFields();
  };

  const handleEditLink = (l: ChainLink) => {
    setEditingLinkId(l.id);
    setLinkType(l.linkType || 'deed');
    setDeedNo(l.deedNo || '');
    setDeedDate(l.deedDate || '');
    setDeedYear(l.deedYear || '');
    setDeedType(l.deedType || 'সাফ কোবালা (Sale / Kobala)');
    setDeceasedName(l.linkType === 'warish' ? l.vendor : '');
    setVendors(l.vendors && l.vendors.length > 0 ? l.vendors : (l.vendor ? [l.vendor] : ['']));
    setPurchasers(l.purchasers && l.purchasers.length > 0 ? l.purchasers : (l.purchaser ? [l.purchaser] : ['']));
    setWarishNames(l.warishNames && l.warishNames.length > 0 ? l.warishNames : (l.purchaser ? [l.purchaser] : ['']));
    setArea(l.area || '');
    setConsideration(l.consideration || '');
    setSro(l.registrationOffice || '');
    setCertificateRef(l.certificateRef || '');
    setWarishDetails(l.warishDetails || '');
    setActiveTab('editor');
  };

  const handleDeleteLink = (id: string) => {
    setChainLinks(prev => prev.filter(l => l.id !== id));
    showToast('Chain step removed');
  };

  // AI Generation & Translation to Bengali/English using Data Vault
  const handleAiGenerateChain = async (targetLanguage: 'bn' | 'en') => {
    setIsAiGenerating(true);
    setDocLang(targetLanguage);
    showToast(`Analyzing Vault samples & generating ${targetLanguage === 'bn' ? 'Bengali' : 'English'} Chain Deed...`, 'info');

    try {
      const response = await fetch('/api/ai/chain-deed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseItem: {
            ...caseItem,
            chainLinks
          },
          targetLang: targetLanguage,
          vaultSamples: sampleDrafts || []
        })
      });

      const data = await response.json();
      if (data.success && data.draftText) {
        setDraftText(data.draftText);
        setActiveTab('preview');
        showToast(`Chain Deed generated in ${targetLanguage === 'bn' ? 'Bengali' : 'English'}!`);
      } else {
        generateInitialText(caseItem, chainLinks, targetLanguage);
        setActiveTab('preview');
        showToast('Generated using statutory title engine');
      }
    } catch {
      generateInitialText(caseItem, chainLinks, targetLanguage);
      setActiveTab('preview');
      showToast('Generated using statutory title engine');
    } finally {
      setIsAiGenerating(false);
    }
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

    showToast('Chain of Title statement saved to case!');
  };

  // Pure case-only print (strictly excludes chamber, advocate, or firm branding as requested in Requirement 20)
  const handlePrint = () => {
    safePrintHtml(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Chain of Title Statement - ${caseItem.caseNo}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; font-size: 13.5px; }
            h2, h3 { margin: 0 0 4px 0; color: #1E3A8A; text-align: center; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 12px 0 16px 0; }
            pre { font-family: inherit; white-space: pre-wrap; word-break: break-word; font-size: 13px; line-height: 1.6; }
            .header-box { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1E3A8A; padding-bottom: 12px; }
            .case-badge { display: inline-block; padding: 2px 10px; background: #EEF2F6; border: 1px solid #CBD5E1; border-radius: 4px; font-weight: bold; font-size: 12px; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <h2>CHRONOLOGICAL CHAIN OF TITLE STATEMENT</h2>
            <div style="font-size: 13px; font-weight: bold; color: #333;">Competent Forum: ${caseItem.forum}</div>
            <div class="case-badge">Case No: ${caseItem.caseNo} | Application No: ${caseItem.appNo || '—'}</div>
          </div>
          <pre>${draftText}</pre>
          <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px;">
            <div>Verified & Submitted by Transferee / Applicant: ___________________</div>
            <div style="text-align: right;">Revenue Authority Seal & Date: ___________________</div>
          </div>
        </body>
      </html>
    `);
  };

  // Case-only Word doc download
  const handleDownloadWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Chain Deed - ${caseItem.caseNo}</title>
    <style>body{font-family:'Times New Roman',serif; font-size: 12pt; line-height: 1.5;} pre{white-space: pre-wrap; font-family:'Times New Roman',serif;}</style>
    </head><body>
    <div style="text-align:center;font-weight:bold;font-size:16pt;color:#1E3A8A;">CHRONOLOGICAL CHAIN OF TITLE STATEMENT</div>
    <div style="text-align:center;font-size:11pt;margin-top:4px;">Forum: ${caseItem.forum} · Case No: ${caseItem.caseNo} · App No: ${caseItem.appNo || '—'}</div>
    <hr/>
    <pre>${draftText}</pre>
    <div style="margin-top:40pt;display:flex;justify-content:space-between;font-size:10pt;">
      <div>Submitted by Applicant: ___________________</div>
      <div>Revenue Authority Seal: ___________________</div>
    </div>
    </body></html>`;

    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chain_Deed_${caseItem.caseNo.replace(/[^a-zA-Z0-9]/g, '_')}_Case_Only.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chain Deed downloaded (Case-Only)');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    showToast('Chain Deed text copied to clipboard!');
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
                  ধারাবাহিক চেইন দলিল মেকার (Chain of Title Deed Maker)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                  {caseItem.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Case: <strong className="text-blue-600 dark:text-blue-400 font-mono">{caseItem.caseNo}</strong> · App No: <strong className="font-mono">{caseItem.appNo || '—'}</strong> · Applicant: <strong>{caseItem.party}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Case-Only Clean Print
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* AI & Data Vault Action Strip */}
        <div className="px-4 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              Sourced &amp; synthesized from <strong>Data Vault Samples</strong> chronologically from original title down to applicant.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isAiGenerating}
              onClick={() => handleAiGenerateChain('bn')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Generate / Translate to formal Bengali with AI"
            >
              {isAiGenerating && docLang === 'bn' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Languages className="w-3.5 h-3.5" />
              )}
              <span>AI বাংলায় তৈরি / অনুবাদ</span>
            </button>

            <button
              type="button"
              disabled={isAiGenerating}
              onClick={() => handleAiGenerateChain('en')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Generate in English with AI"
            >
              {isAiGenerating && docLang === 'en' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>AI English Draft</span>
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
              <span>Chain Recital Statement</span>
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
              <span>Chain Steps ({chainLinks.length})</span>
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
              title="Download Word doc with purely case-related information"
            >
              <Download className="w-3.5 h-3.5" /> Word (.doc)
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print purely case-related statement (No firm or advocate data)"
            >
              <Printer className="w-3.5 h-3.5" /> Print Case Statement
            </button>
            <button
              type="button"
              onClick={handleSaveToCase}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Continuity Visualizer Bar */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max text-xs">
              <div className="px-2.5 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Origin of Title</span>
              </div>

              {chainLinks.map((cl, i) => (
                <React.Fragment key={cl.id}>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <div
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 ${
                      cl.linkType === 'warish'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200'
                        : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {cl.linkType === 'warish' ? (
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <Scroll className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>
                      Step {i + 1}: {cl.purchaser || (cl.linkType === 'warish' ? 'Warishan' : 'Buyer')}
                      {cl.deedYear ? ` (${cl.deedYear})` : ''}
                    </span>
                  </div>
                </React.Fragment>
              ))}

              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

              <div className="px-2.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Applicant: {caseItem.party}</span>
              </div>
            </div>
          </div>

          {/* Title Gap Warnings if any */}
          {gapWarnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Title Continuity Notice:</span>
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
                <span className="flex items-center gap-2">
                  <span>Case-Only Chain Statement ({docLang === 'bn' ? 'বাংলা' : 'English'})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                    No chamber/advocate branding
                  </span>
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
              {/* Form to Add / Edit Chain link */}
              <form
                onSubmit={handleAddOrUpdateLink}
                className={`p-4 rounded-xl border space-y-3 ${
                  linkType === 'warish'
                    ? 'border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20'
                    : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      {linkType === 'warish' ? (
                        <>
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          <span>{editingLinkId ? 'Edit Warishan Succession' : 'Add Warish Succession (ওয়ারিশান সূত্রে হস্তান্তর)'}</span>
                        </>
                      ) : (
                        <>
                          <Scroll className="w-3.5 h-3.5 text-blue-600" />
                          <span>{editingLinkId ? 'Edit Chain Buyer Deed' : 'Add Chain Buyer Deed (দলিলমূলে চেইন ক্রেতা)'}</span>
                        </>
                      )}
                    </span>
                    <select
                      value={linkType}
                      onChange={e => setLinkType(e.target.value as 'deed' | 'warish')}
                      className="text-[11px] font-bold px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer"
                    >
                      <option value="deed">Deed / Conveyance</option>
                      <option value="warish">Warish / Inheritance</option>
                    </select>
                  </div>

                  {editingLinkId && (
                    <button
                      type="button"
                      onClick={resetFormFields}
                      className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {linkType === 'deed' ? (
                  /* DEED INPUT FIELDS with Multiple Sellers/Donors & Multiple Buyers */
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Deed No. (দলিল নং) *
                        </label>
                        <input
                          type="text"
                          value={deedNo}
                          onChange={e => setDeedNo(e.target.value)}
                          placeholder="e.g. 1045 / I-241"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Year of Deed (দলিল বছর) *
                        </label>
                        <input
                          type="text"
                          value={deedYear}
                          onChange={e => setDeedYear(e.target.value)}
                          placeholder="e.g. 1984 / 2005"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Type of Deed (দলিলের ধরন) *
                        </label>
                        <select
                          value={deedType}
                          onChange={e => setDeedType(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {WB_DEED_TYPES.map(dt => (
                            <option key={dt} value={dt}>
                              {dt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Sub-Registry (ADSR / SRO)
                        </label>
                        <input
                          type="text"
                          value={sro}
                          onChange={e => setSro(e.target.value)}
                          placeholder="e.g. ADSR Office"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Multiple Sellers / Donors */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                          Seller(s) / Donor(s) / Transferor(s) (দাতা / বিক্রেতা - একাধিক যোগ করা যাবে)
                        </label>
                        <button
                          type="button"
                          onClick={() => setVendors(prev => [...prev, ''])}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> + Add Saler / Donor
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {vendors.map((v, vIdx) => (
                          <div key={vIdx} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={v}
                              onChange={e => {
                                const val = e.target.value;
                                setVendors(prev => prev.map((item, idx) => (idx === vIdx ? val : item)));
                              }}
                              placeholder={`Seller / Donor #${vIdx + 1}`}
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            />
                            {vendors.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setVendors(prev => prev.filter((_, idx) => idx !== vIdx))}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Multiple Buyers / Transferees */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                          Chain Buyer(s) / Transferee(s) (গ্রহীতা / ক্রেতা - একাধিক যোগ করা যাবে) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setPurchasers(prev => [...prev, ''])}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> + Add Buyer
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {purchasers.map((p, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={p}
                              onChange={e => {
                                const val = e.target.value;
                                setPurchasers(prev => prev.map((item, idx) => (idx === pIdx ? val : item)));
                              }}
                              placeholder={`Buyer #${pIdx + 1}`}
                              className="w-full px-2.5 py-1.5 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 font-semibold text-blue-800 dark:text-blue-200 text-xs"
                            />
                            {purchasers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setPurchasers(prev => prev.filter((_, idx) => idx !== pIdx))}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Registration Date (রেজিস্ট্রি তারিখ)
                        </label>
                        <input
                          type="date"
                          value={deedDate}
                          onChange={e => setDeedDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Transferred Area (পরিমাণ)
                        </label>
                        <input
                          type="text"
                          value={area}
                          onChange={e => setArea(e.target.value)}
                          placeholder="e.g. 0.08 Acre"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Consideration (পণ মূল্য)
                        </label>
                        <input
                          type="text"
                          value={consideration}
                          onChange={e => setConsideration(e.target.value)}
                          placeholder="₹ 15,00,000"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* WARISH INPUT FIELDS with Multiple Warish Names */
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1">
                          Deceased Owner (মৃত পূর্ববর্তী ব্যক্তি) *
                        </label>
                        <input
                          type="text"
                          required
                          value={deceasedName}
                          onChange={e => setDeceasedName(e.target.value)}
                          placeholder="e.g. Late Haripada Mondal"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1">
                          Year of Demise / Warish (সাল)
                        </label>
                        <input
                          type="text"
                          value={deedYear}
                          onChange={e => setDeedYear(e.target.value)}
                          placeholder="e.g. 1998"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1">
                          Warishan Cert Ref (সনদপত্র নং)
                        </label>
                        <input
                          type="text"
                          value={certificateRef}
                          onChange={e => setCertificateRef(e.target.value)}
                          placeholder="Cert No. 240/GP"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1">
                          Issuing Authority (কর্তৃপক্ষ)
                        </label>
                        <input
                          type="text"
                          value={sro}
                          onChange={e => setSro(e.target.value)}
                          placeholder="Pradhan / Chairman"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    {/* Multiple Warishes (ওয়ারিশানদের নাম - একাধিক যোগ করার সুবিধা) */}
                    <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-purple-200 dark:border-purple-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                          Names of Warishes (ওয়ারিশানদের নাম - একাধিক যোগ করুন) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setWarishNames(prev => [...prev, ''])}
                          className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> + Add Warish Name
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {warishNames.map((w, wIdx) => (
                          <div key={wIdx} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={w}
                              onChange={e => {
                                const val = e.target.value;
                                setWarishNames(prev => prev.map((item, idx) => (idx === wIdx ? val : item)));
                              }}
                              placeholder={`Warish #${wIdx + 1} Name`}
                              className="w-full px-2.5 py-1.5 rounded border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 font-bold text-purple-800 dark:text-purple-200 text-xs"
                            />
                            {warishNames.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setWarishNames(prev => prev.filter((_, idx) => idx !== wIdx))}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingLinkId ? 'Update Step' : (linkType === 'warish' ? 'Save Warish Succession' : 'Save Chain Deed')}</span>
                  </button>
                </div>
              </form>

              {/* Table of Existing Chain Links */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                  Chronological Title Chain ({chainLinks.length} Steps)
                </h4>

                {chainLinks.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                    No registered via deeds or warish transitions recorded yet. Add steps using the form above.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Deed / Cert No</th>
                          <th className="p-2.5">Year / Date</th>
                          <th className="p-2.5">Transferor(s) / Deceased</th>
                          <th className="p-2.5">Buyer(s) / Warish(es)</th>
                          <th className="p-2.5">Office</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {chainLinks.map((link, idx) => {
                          const from = link.vendors && link.vendors.length > 0 ? link.vendors.join(', ') : link.vendor;
                          const to = link.linkType === 'warish'
                            ? (link.warishNames && link.warishNames.length > 0 ? link.warishNames.join(', ') : link.purchaser)
                            : (link.purchasers && link.purchasers.length > 0 ? link.purchasers.join(', ') : link.purchaser);
                          return (
                            <tr
                              key={link.id}
                              className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                link.linkType === 'warish' ? 'bg-purple-50/20 dark:bg-purple-950/10' : ''
                              }`}
                            >
                              <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    link.linkType === 'warish'
                                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                      : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                  }`}
                                >
                                  {link.linkType === 'warish' ? 'Warish' : (link.deedType || 'Deed')}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold font-mono text-blue-600 dark:text-blue-400">
                                {link.linkType === 'warish' ? (link.certificateRef || 'Warishan Cert.') : (link.deedNo || '—')}
                              </td>
                              <td className="p-2.5 font-mono">{link.deedYear || link.deedDate || '—'}</td>
                              <td className="p-2.5 font-medium">{from || '—'}</td>
                              <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{to || '—'}</td>
                              <td className="p-2.5 text-slate-500">{link.registrationOffice || '—'}</td>
                              <td className="p-2.5 text-right space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditLink(link)}
                                  className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                  title="Edit Step"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLink(link.id)}
                                  className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                  title="Delete Step"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
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
            Case: <strong>{caseItem.caseNo}</strong> · Purely case-related title chain.
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
              <span>Save &amp; Update Case</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
