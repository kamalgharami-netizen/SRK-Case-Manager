import React, { useMemo, useState } from 'react';
import { statutoryProvisions, StatutoryProvision } from '../data/statutoryData';
import {
  BookOpen,
  Search,
  Scale,
  Copy,
  Check,
  Sparkles,
  Printer,
  Languages,
  BookMarked,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { safePrintHtml } from '../utils/printDoc';

const CHAPTER_LABELS: Record<
  string,
  { en: string; bn: string; category: 'wblract' | 'wblrmanual' }
> = {
  preliminary: {
    en: 'Ch. I: Preliminary (Sec 1–3A)',
    bn: 'অধ্যায় ১: প্রারম্ভিক (ধারা ১–৩ক)',
    category: 'wblract'
  },
  raiyats: {
    en: 'Ch. II: Raiyats, 4C & 8 (Sec 4–14)',
    bn: 'অধ্যায় ২: রায়ত, ৪গ ও ৮ (ধারা ৪–১৪)',
    category: 'wblract'
  },
  tribal: {
    en: 'Ch. IIA: ST Land (Sec 14A–14I)',
    bn: 'অধ্যায় ২ক: তপশিলি উপজাতি জমি (ধারা ১৪ক–১৪ঝ)',
    category: 'wblract'
  },
  ceiling: {
    en: 'Ch. IIB: Ceiling & 14Y (Sec 14J–14Z)',
    bn: 'অধ্যায় ২খ: সিলিং ও ১৪য় (ধারা ১৪ঞ–১৪য)',
    category: 'wblract'
  },
  bargadar: {
    en: 'Ch. III: Bargadars (Sec 15–21E)',
    bn: 'অধ্যায় ৩: বর্গাদার (ধারা ১৫–২১ঙ)',
    category: 'wblract'
  },
  revenue: {
    en: 'Ch. IV–VI: Revenue & Consol. (22–48D)',
    bn: 'অধ্যায় ৪–৬: রাজস্ব ও সংহতকরণ (২২–৪৮ঘ)',
    category: 'wblract'
  },
  vested: {
    en: 'Ch. VII: Vested & Patta (Sec 49–49A)',
    bn: 'অধ্যায় ৭: ন্যস্ত জমি ও পাট্টা (ধারা ৪৯–৪৯ক)',
    category: 'wblract'
  },
  ror: {
    en: 'Ch. VIIA: ROR & Mutation (Sec 50–51D)',
    bn: 'অধ্যায় ৭ক: খতিয়ান ও নামজারি (ধারা ৫০–৫১ঘ)',
    category: 'wblract'
  },
  appeal: {
    en: 'Ch. VIII: Appeals & Suits (Sec 52–63)',
    bn: 'অধ্যায় ৮: আপিল ও দেওয়ানি বারণ (ধারা ৫২–৬৩)',
    category: 'wblract'
  },
  'manual-admin': {
    en: 'Man. Ch. I–II: Setup & Officers (1–20)',
    bn: 'ম্যানুয়াল অধ্যায় ১–২: প্রশাসন ও আধিকারিক (১–২০)',
    category: 'wblrmanual'
  },
  'manual-ror': {
    en: 'Man. Ch. III & V: ROR & 10000 Share',
    bn: 'ম্যানুয়াল অধ্যায় ৩ ও ৫: খতিয়ান ও ১০০০০ অংশ',
    category: 'wblrmanual'
  },
  'manual-mutation': {
    en: 'Man. Ch. IV: Mutation (Rules 41–54)',
    bn: 'ম্যানুয়াল অধ্যায় ৪: মিউটেশন (বিধি ৪১–৫৪)',
    category: 'wblrmanual'
  },
  'manual-conversion': {
    en: 'Man. Ch. VI: Conversion (Rules 69–82)',
    bn: 'ম্যানুয়াল অধ্যায় ৬: শ্রেণি পরিবর্তন (বিধি ৬৯–৮২)',
    category: 'wblrmanual'
  },
  'manual-barga-ceiling': {
    en: 'Man. Ch. VII–VIII: Barga & Ceiling',
    bn: 'ম্যানুয়াল অধ্যায় ৭–৮: বর্গা ও সিলিং',
    category: 'wblrmanual'
  },
  'manual-patta-sairati': {
    en: 'Man. Ch. IX–XI: Patta, Lease & Sairati',
    bn: 'ম্যানুয়াল অধ্যায় ৯–১১: পাট্টা, লিজ ও সায়রাতি',
    category: 'wblrmanual'
  },
  'manual-tribal-acq': {
    en: 'Man. Ch. XII–XIII: ST & Acquisition',
    bn: 'ম্যানুয়াল অধ্যায় ১২–১৩: উপজাতি জমি ও অধিগ্রহণ',
    category: 'wblrmanual'
  },
  'manual-rev-survey': {
    en: 'Man. Ch. XIV–XV & XIX: Khajna & Survey',
    bn: 'ম্যানুয়াল অধ্যায় ১৪–১৫ ও ১৯: খাজনা ও জরিপ',
    category: 'wblrmanual'
  },
  'manual-records-law': {
    en: 'Man. Ch. XVI–XXI: CC, Law Cell & Regs',
    bn: 'ম্যানুয়াল অধ্যায় ১৬–২১: সার্টিফাইড কপি ও আইন শাখা',
    category: 'wblrmanual'
  }
};

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const StatutoryLibrary: React.FC = () => {
  const { activeCompany, showToast, language, toggleLanguage } = useApp();
  const bn = language === 'bn';

  const [activeCategory, setActiveCategory] = useState<'all' | 'wblract' | 'wblrmanual'>('all');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [selectedProvisionId, setSelectedProvisionId] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const actCount = useMemo(
    () => statutoryProvisions.filter(p => p.category === 'wblract').length,
    []
  );
  const manualCount = useMemo(
    () => statutoryProvisions.filter(p => p.category === 'wblrmanual').length,
    []
  );

  const availableChapters = useMemo(() => {
    return Object.entries(CHAPTER_LABELS).filter(([, meta]) =>
      activeCategory === 'all' ? true : meta.category === activeCategory
    );
  }, [activeCategory]);

  // Options for the "Jump to Section / Rule" selector scoped to current category + chapter
  const jumpOptions = useMemo(() => {
    return statutoryProvisions.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchCh = chapterFilter === 'all' || p.chapter === chapterFilter;
      return matchCat && matchCh;
    });
  }, [activeCategory, chapterFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return statutoryProvisions.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchCh = chapterFilter === 'all' || p.chapter === chapterFilter;
      const matchSpecific = selectedProvisionId === 'all' || p.id === selectedProvisionId;
      if (!matchCat || !matchCh || !matchSpecific) return false;
      if (!q) return true;

      const haystack = [
        p.section,
        p.sectionBn,
        p.title,
        p.titleBn,
        p.chapterTitle,
        p.chapterTitleBn,
        p.amendedNote || '',
        p.amendedNoteBn || '',
        p.textEn,
        p.textBn,
        p.relevance,
        p.relevanceBn,
        ...(p.keyPoints || []),
        ...(p.keyPointsBn || []),
        ...(p.definitions || []).flatMap(d => [d.termEn, d.definitionEn, d.termBn, d.definitionBn])
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [activeCategory, chapterFilter, selectedProvisionId, search]);

  const handleCopyCitation = (p: StatutoryProvision) => {
    const actLabel = bn
      ? p.category === 'wblract'
        ? 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫'
        : 'পশ্চিমবঙ্গ ভূমি ও ভূমি সংস্কার ম্যানুয়াল, ১৯৯১'
      : p.category === 'wblract'
        ? 'West Bengal Land Reforms Act, 1955'
        : 'West Bengal Land & Land Reforms Manual, 1991';

    const sec = bn ? p.sectionBn : p.section;
    const title = bn ? p.titleBn : p.title;
    const body = bn ? p.textBn : p.textEn;
    const defs = (p.definitions || [])
      .map(d =>
        bn
          ? `• ${d.termBn}: ${d.definitionBn}`
          : `• ${d.termEn}: ${d.definitionEn}`
      )
      .join('\n');
    const points = (bn ? p.keyPointsBn : p.keyPoints).map(pt => `• ${pt}`).join('\n');
    const rel = bn ? p.relevanceBn : p.relevance;

    const cite = bn
      ? `${actLabel} — ${sec}: ${title}\n\nআইনগত বিধান:\n${body}\n\nগুরুত্বপূর্ণ সংজ্ঞা ও পরিভাষা:\n${defs}\n\nমামলা পরিচালনার গুরুত্বপূর্ণ দিক:\n${points}\n\nপ্রাসঙ্গিকতা:\n${rel}`
      : `${actLabel} — ${sec}: ${title}\n\nStatutory Provision:\n${body}\n\nKey Definitions & Legal Terms:\n${defs}\n\nPractical Litigation Points:\n${points}\n\nRelevance:\n${rel}`;

    navigator.clipboard?.writeText(cite);
    setCopiedId(p.id);
    showToast(bn ? `${sec} কপি করা হয়েছে` : `Copied ${sec} citation`, 'success');
    window.setTimeout(() => setCopiedId(prev => (prev === p.id ? null : prev)), 2000);
  };

  const handlePrintProvisions = (items: StatutoryProvision[], docTitle?: string) => {
    if (!items.length) {
      showToast(
        bn ? 'প্রিন্ট করার জন্য কোনো ধারা বা বিধি নির্বাচিত নেই।' : 'No sections or rules available to print.',
        'error'
      );
      return;
    }

    const headerTitle =
      docTitle ||
      (bn
        ? 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ ও ম্যানুয়াল, ১৯৯১ — আইনি সংকলন'
        : 'West Bengal Land Reforms Act, 1955 & Manual, 1991 — Statutory Reference');

    const printedOn = new Date().toLocaleDateString(bn ? 'bn-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const cardsHtml = items
      .map(p => {
        const catLabel = bn
          ? p.category === 'wblract'
            ? 'ডব্লিউ.বি.এল.আর. অ্যাক্ট ১৯৫৫'
            : 'ডব্লিউ.বি.এল.আর. ম্যানুয়াল ১৯৯১'
          : p.category === 'wblract'
            ? 'WBLR Act, 1955'
            : 'WBLR Manual, 1991';
        const ch = bn ? p.chapterTitleBn : p.chapterTitle;
        const sec = bn ? p.sectionBn : p.section;
        const title = bn ? p.titleBn : p.title;
        const amend = bn ? p.amendedNoteBn : p.amendedNote;
        const body = bn ? p.textBn : p.textEn;
        const pts = bn ? p.keyPointsBn : p.keyPoints;
        const rel = bn ? p.relevanceBn : p.relevance;
        const defs = p.definitions || [];

        return `
          <article class="provision-card">
            <div class="card-header">
              <div>
                <div class="chapter-tag">${escapeHtml(ch)}</div>
                <h2>${escapeHtml(sec)}: ${escapeHtml(title)}</h2>
                ${amend ? `<div class="amend-badge">${escapeHtml(amend)}</div>` : ''}
              </div>
              <span class="cat-badge">${escapeHtml(catLabel)}</span>
            </div>

            <div class="section-block">
              <div class="block-label">${bn ? 'আইনগত বিধান' : 'STATUTORY PROVISION'}</div>
              <p class="provision-text">${escapeHtml(body)}</p>
            </div>

            ${
              defs.length > 0
                ? `<div class="defs-block">
                    <div class="block-label">${
                      bn ? 'গুরুত্বপূর্ণ সংজ্ঞা ও আইনি পরিভাষা' : 'KEY DEFINITIONS & LEGAL TERMS'
                    }</div>
                    <dl class="defs-list">
                      ${defs
                        .map(
                          d => `<div class="def-item">
                            <dt>${escapeHtml(bn ? d.termBn : d.termEn)}</dt>
                            <dd>${escapeHtml(bn ? d.definitionBn : d.definitionEn)}</dd>
                          </div>`
                        )
                        .join('')}
                    </dl>
                  </div>`
                : ''
            }

            ${
              pts.length > 0
                ? `<div class="points-block">
                    <div class="block-label">${
                      bn ? 'মামলা পরিচালনার গুরুত্বপূর্ণ দিক' : 'PRACTICAL LITIGATION POINTS'
                    }</div>
                    <ul>
                      ${pts.map(pt => `<li>${escapeHtml(pt)}</li>`).join('')}
                    </ul>
                  </div>`
                : ''
            }

            <div class="relevance-row">
              <strong>${bn ? 'প্রাসঙ্গিকতা:' : 'Relevance:'}</strong> ${escapeHtml(rel)}
            </div>
          </article>
        `;
      })
      .join('');

    const chamberLine = activeCompany?.name
      ? `<div class="chamber-sub">${escapeHtml(activeCompany.name)}${
          activeCompany.barCouncil ? ` • ${escapeHtml(activeCompany.barCouncil)}` : ''
        }</div>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="${bn ? 'bn' : 'en'}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(headerTitle)}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: ${bn ? "'Noto Sans Bengali', 'Kohinoor Bangla', 'Hind Siliguri', sans-serif" : "'Georgia', 'Times New Roman', serif"};
      color: #0f172a;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.55;
    }
    .doc-header {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12px;
    }
    .doc-header h1 {
      margin: 0;
      font-size: 16px;
      color: #0f172a;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .chamber-sub {
      font-size: 10px;
      color: #475569;
      margin-top: 3px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .doc-meta {
      text-align: right;
      font-size: 10px;
      color: #475569;
      font-family: system-ui, -apple-system, sans-serif;
      white-space: nowrap;
    }
    .provision-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .chapter-tag {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #0f766e;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .card-header h2 {
      margin: 2px 0 0 0;
      font-size: 13px;
      color: #0f172a;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .amend-badge {
      display: inline-block;
      margin-top: 4px;
      font-size: 9px;
      font-weight: 600;
      background: #eef2ff;
      color: #3730a3;
      border: 1px solid #c7d2fe;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .cat-badge {
      font-size: 9px;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      padding: 3px 7px;
      border-radius: 4px;
      white-space: nowrap;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .block-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #0369a1;
      margin-bottom: 3px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .section-block {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 8px;
    }
    .provision-text {
      margin: 0;
      text-align: justify;
    }
    .defs-block {
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 8px;
    }
    .defs-block .block-label {
      color: #0f766e;
    }
    .defs-list {
      margin: 4px 0 0 0;
    }
    .def-item {
      margin-bottom: 4px;
    }
    .def-item:last-child {
      margin-bottom: 0;
    }
    .def-item dt {
      display: inline;
      font-weight: 700;
      color: #0f172a;
    }
    .def-item dt::after {
      content: ": ";
    }
    .def-item dd {
      display: inline;
      margin: 0;
      color: #334155;
    }
    .points-block {
      margin-bottom: 8px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .points-block ul {
      margin: 3px 0 0 0;
      padding-left: 16px;
    }
    .points-block li {
      margin-bottom: 2px;
      font-size: 10.5px;
      color: #334155;
    }
    .relevance-row {
      border-top: 1px dashed #cbd5e1;
      padding-top: 6px;
      font-size: 10px;
      color: #475569;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <header class="doc-header">
    <div>
      <h1>${escapeHtml(headerTitle)}</h1>
      ${chamberLine}
    </div>
    <div class="doc-meta">
      <div>${bn ? `মোট ধারা/বিধি: ${items.length}` : `Provisions Printed: ${items.length}`}</div>
      <div>${bn ? `তারিখ: ${printedOn}` : `Printed: ${printedOn}`}</div>
    </div>
  </header>
  ${cardsHtml}
</body>
</html>`;

    safePrintHtml(html, {
      title: headerTitle,
      orientation: 'portrait',
      paperSize: 'a4'
    });
  };

  const resetAllFilters = () => {
    setActiveCategory('all');
    setChapterFilter('all');
    setSelectedProvisionId('all');
    setSearch('');
  };

  const hasActiveFilters =
    activeCategory !== 'all' ||
    chapterFilter !== 'all' ||
    selectedProvisionId !== 'all' ||
    search.trim().length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600 shrink-0" />
            <span>
              {bn
                ? 'ভূমি আইন ও বিধিমালা সংগ্রহশালা'
                : 'Statutory Reference Library — Acts & Rules'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {bn
              ? 'সম্পূর্ণ পশ্চিমবঙ্গ ভূমি সংস্কার আইন, ১৯৫৫ (সংশোধিত ধারা ১–৬৩) এবং ডব্লিউ.বি.এল.আর. ম্যানুয়াল, ১৯৯১ (অধ্যায় ১–২১, বিধি ১–৪০০) — প্রতিটি ধারায় সংজ্ঞাসহ।'
              : 'Complete West Bengal Land Reforms Act, 1955 (Amended Sec 1–63) & WBLR Manual, 1991 (Ch. I–XXI, Rules 1–400) with legal definitions in every section.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Direct Language Switcher synced with global language */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors cursor-pointer"
            title={bn ? 'ইংরেজিতে দেখুন' : 'Switch to Bengali'}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{bn ? 'ভাষা: বাংলা (English এ যান)' : 'Language: English (বাংলা)'}</span>
          </button>

          {/* Category Tab Switch */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setChapterFilter('all');
                setSelectedProvisionId('all');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {bn ? `সব (${statutoryProvisions.length})` : `All (${statutoryProvisions.length})`}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('wblract');
                setChapterFilter('all');
                setSelectedProvisionId('all');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeCategory === 'wblract'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {bn ? `আইন ১৯৫৫ (${actCount})` : `WBLR Act 1955 (${actCount})`}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('wblrmanual');
                setChapterFilter('all');
                setSelectedProvisionId('all');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeCategory === 'wblrmanual'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {bn ? `ম্যানুয়াল ১৯৯১ (${manualCount})` : `WBLR Manual 1991 (${manualCount})`}
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Search, Section/Rule Jump, Print & Chapter Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={
                bn
                  ? 'ধারা, বিধি, সংজ্ঞা বা বিষয় খুঁজুন (যেমন: ১৪এম, ৪৯, বর্গাদার, পাট্টা, মিউটেশন)...'
                  : 'Search Acts, Rules, Definitions (e.g., 14M, 4C, 49, 53A, Patta, Mutation)...'
              }
              className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                title={bn ? 'খোঁজা মুছুন' : 'Clear search'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Jump to Section / Rule Dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedProvisionId}
              onChange={e => setSelectedProvisionId(e.target.value)}
              aria-label={bn ? 'নির্দিষ্ট ধারা বা বিধি নির্বাচন করুন' : 'Jump to Section or Rule'}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">
                {bn
                  ? `— সব ধারা / বিধি (${jumpOptions.length}) —`
                  : `— All Sections / Rules (${jumpOptions.length}) —`}
              </option>
              {jumpOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {bn ? `${opt.sectionBn}: ${opt.titleBn}` : `${opt.section}: ${opt.title}`}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Print Button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={() => handlePrintProvisions(filtered)}
              disabled={filtered.length === 0}
              className="w-full px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title={bn ? 'বর্তমান তালিকা প্রিন্ট বা PDF করুন' : 'Print or save shown Acts & Rules as PDF'}
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>{bn ? `প্রিন্ট (${filtered.length})` : `Print (${filtered.length})`}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>
            {bn
              ? `মোট ${statutoryProvisions.length}টি অধ্যায়ের মধ্যে ${filtered.length}টি ধারা/বিধি দেখানো হচ্ছে`
              : `Showing ${filtered.length} of ${statutoryProvisions.length} Statutory Groups (Sec 1–63 & Manual Ch. I–XXI)`}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-teal-700 dark:text-teal-400 hover:underline font-bold normal-case cursor-pointer"
            >
              {bn ? 'সব ফিল্টার রিসেট করুন' : 'Reset all filters'}
            </button>
          )}
        </div>

        {/* Chapter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setChapterFilter('all');
              setSelectedProvisionId('all');
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              chapterFilter === 'all'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {bn ? 'সব অধ্যায়' : 'All Chapters'}
          </button>
          {availableChapters.map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setChapterFilter(key);
                setSelectedProvisionId('all');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                chapterFilter === key
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {bn ? meta.bn : meta.en}
            </button>
          ))}
        </div>
      </div>

      {/* Provisions List — strictly active language only */}
      <div className="space-y-4">
        {filtered.map(p => {
          const chapterLabel = bn ? p.chapterTitleBn : p.chapterTitle;
          const sectionLabel = bn ? p.sectionBn : p.section;
          const titleLabel = bn ? p.titleBn : p.title;
          const amendLabel = bn ? p.amendedNoteBn : p.amendedNote;
          const provisionText = bn ? p.textBn : p.textEn;
          const pointsList = bn ? p.keyPointsBn : p.keyPoints;
          const relevanceText = bn ? p.relevanceBn : p.relevance;
          const categoryLabel = bn
            ? p.category === 'wblract'
              ? 'ডব্লিউ.বি.এল.আর. অ্যাক্ট ১৯৫৫'
              : 'ডব্লিউ.বি.এল.আর. ম্যানুয়াল ১৯৯১'
            : p.category === 'wblract'
              ? 'WBLR Act 1955'
              : 'WBLR Manual 1991';

          return (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    {chapterLabel}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {sectionLabel}: {titleLabel}
                  </h3>
                  {amendLabel && (
                    <div className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>{amendLabel}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      handlePrintProvisions([p], `${sectionLabel} — ${titleLabel}`)
                    }
                    className="px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-[10px] font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
                    title={bn ? 'এই ধারা/বিধি প্রিন্ট করুন' : 'Print this section or rule'}
                  >
                    <Printer className="w-3 h-3" />
                    <span>{bn ? 'প্রিন্ট' : 'Print'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCitation(p)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                    title={bn ? 'আইনি উদ্ধৃতি কপি করুন' : 'Copy statutory citation'}
                  >
                    {copiedId === p.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">
                          {bn ? 'কপি হয়েছে' : 'Copied'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{bn ? 'কপি' : 'Copy'}</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {categoryLabel}
                  </span>
                </div>
              </div>

              {/* Single-Language Statutory Provision Text */}
              <div
                className={`p-3.5 rounded-lg text-xs leading-relaxed border ${
                  bn
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/70 text-slate-800 dark:text-slate-200 font-serif'
                }`}
              >
                <span
                  className={`font-sans font-bold text-[10px] block mb-1 uppercase tracking-wider ${
                    bn ? 'text-amber-700 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {bn ? 'বাংলা আইনগত বিধান:' : 'STATUTORY PROVISION:'}
                </span>
                {provisionText}
              </div>

              {/* Key Definitions & Legal Terms for Understanding the Act / Rule */}
              {p.definitions && p.definitions.length > 0 && (
                <div className="p-3.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    <BookMarked className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {bn
                        ? 'গুরুত্বপূর্ণ সংজ্ঞা ও আইনি পরিভাষা'
                        : 'Key Definitions & Legal Terms'}
                    </span>
                  </div>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
                    {p.definitions.map((def, idx) => (
                      <div
                        key={`${p.id}-def-${idx}`}
                        className="p-2.5 rounded-md bg-white/80 dark:bg-slate-900/70 border border-teal-100 dark:border-teal-900/40"
                      >
                        <dt className="font-bold text-slate-900 dark:text-slate-100">
                          {bn ? def.termBn : def.termEn}
                        </dt>
                        <dd className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                          {bn ? def.definitionBn : def.definitionEn}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Practical Litigation Points */}
              {pointsList && pointsList.length > 0 && (
                <div className="pt-1 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {bn ? 'মামলা পরিচালনার গুরুত্বপূর্ণ দিক:' : 'Practical Litigation Points:'}
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {pointsList.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Relevance */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                <Scale className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{bn ? 'প্রাসঙ্গিকতা:' : 'Relevance:'}</strong> {relevanceText}
                </span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 text-xs space-y-3">
            <div>
              {bn
                ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো ধারা বা বিধি পাওয়া যায়নি।'
                : 'No statutory provisions found matching your query.'}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                {bn ? 'সব ধারা ও বিধি দেখুন' : 'Show all Acts & Rules'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
