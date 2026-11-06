import React from 'react';
import { useApp } from '../context/AppContext';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  Type,
  Sparkles,
  Check,
  RotateCcw,
  X,
  Scale,
  Eye,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ThemeDropdown } from './ThemeDropdown';

export const ViewingOptionsModal: React.FC = () => {
  const {
    isViewModalOpen,
    closeViewModal,
    theme,
    setTheme,
    viewDensity,
    setViewDensity,
    viewMode,
    setViewMode,
    uiStyle,
    setUIStyle,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    resetViewPreferences,
    showToast,
    language,
    t
  } = useApp();

  if (!isViewModalOpen) return null;

  const handleApply = () => {
    showToast(
      language === 'bn'
        ? 'ভিউ সেটিংস সফলভাবে প্রয়োগ করা হয়েছে'
        : 'Display preferences applied successfully',
      'success'
    );
    closeViewModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#102B4C] text-slate-50 rounded-2xl shadow-[0_18px_45px_rgba(3,20,45,.55)] border border-blue-400/50 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-[#0A2340]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-50 flex items-center gap-2">
                <span>{t.displayPreferences}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  SRK View
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                {language === 'bn'
                  ? 'কোর্টরুম থিম, ফন্ট সাইজ ও তথ্য ঘনত্ব আপনার পছন্দমতো সাজান'
                  : 'Customize courtroom theme, reading typography, and information density'}
              </p>
            </div>
          </div>
          <button
            onClick={closeViewModal}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-blue-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* UI TEMPLATE LIBRARY — layout and deep palette are selected together */}
          <section className="space-y-3 rounded-2xl border border-sky-500/60 bg-[#102943] p-3 sm:p-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-extrabold text-slate-100">
                <LayoutGrid className="h-4 w-4 text-sky-300" />
                {language === 'bn' ? 'UI Template লাইব্রেরি' : 'UI Template Library'}
              </label>
              <p className="mt-1 text-xs font-medium text-slate-300">
                {language === 'bn'
                  ? '২০টির বেশি সম্পূর্ণ ডিজাইন থেকে বেছে নিন। প্রতিটি Template-এর নিজস্ব ডিপ কালার ও UI বিন্যাস রয়েছে।'
                  : 'Choose from more than 20 complete designs. Every template includes its own deep colours and interface layout.'}
              </p>
            </div>
            <ThemeDropdown variant="full" className="w-full" />
            <p className="text-[10px] font-semibold text-slate-400">
              {language === 'bn' ? 'আলাদা Colour Theme বা Colour Change অপশন নেই; Template নির্বাচন করলেই রং ও ডিজাইন একসঙ্গে বদলাবে।' : 'There is no separate colour or theme switch; selecting a template changes the layout and palette together.'}
            </p>
          </section>

          {/* SECTION 3: Information Density */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-blue-500" />
                <span>{t.viewDensity}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {viewDensity === 'comfortable' ? t.comfortable : t.compact}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setViewDensity('comfortable')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  viewDensity === 'comfortable'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.comfortable}</span>
                  </div>
                  {viewDensity === 'comfortable' && (
                    <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn'
                    ? 'খোলামেলা কার্ড, পূর্ণ বিবরণ ও স্পষ্ট ব্যাজ'
                    : 'Spacious cards, badges, full dossier details'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setViewDensity('compact')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  viewDensity === 'compact'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                    <Minimize2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t.compact}</span>
                  </div>
                  {viewDensity === 'compact' && (
                    <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn'
                    ? 'সংক্ষিপ্ত টেবিল, দ্রুত কার্যতালিকা দেখার উপযোগী'
                    : 'Condensed rows for rapid courtroom docket review'}
                </p>
              </button>
            </div>
          </div>

          {/* SECTION 4: Case Layout (Grid vs Table) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-emerald-500" />
                <span>{language === 'bn' ? 'মামলা উপস্থাপনা' : 'Case Layout Mode'}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {viewMode === 'grid' ? t.cardGridView : t.tabularListView}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  viewMode === 'grid'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/30 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-600" />
                  <span>{t.cardGridView}</span>
                </div>
                {viewMode === 'grid' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  viewMode === 'table'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/30 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-indigo-600" />
                  <span>{t.tabularListView}</span>
                </div>
                {viewMode === 'table' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* SECTION 5: Typography & Reading Scale */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-purple-500" />
                <span>{t.readingFontSize}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {fontSize === 'large' ? t.fontLarge : t.fontStandard}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  fontSize === 'normal'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/30 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold">100%</span>
                  <span>{t.fontStandard}</span>
                </div>
                {fontSize === 'normal' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  fontSize === 'large'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/30 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-blue-600">115%</span>
                  <span>{t.fontLarge}</span>
                </div>
                {fontSize === 'large' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* SECTION 6: High-Contrast Toggle */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t.highContrastMode}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'কাগজে প্রিন্টের মতো অতিরিক্ত স্পষ্ট বর্ডার ও বৈসাদৃশ্য'
                  : 'Sharper borders and deep black text for high-contrast reading'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                highContrast ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* SECTION 7: Interactive Live Visual Preview */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'bn' ? 'লাইভ প্রিভিউ (Live Preview)' : 'Interactive Live Preview'}</span>
            </div>

            <div className={`p-4 rounded-xl border transition-all ${
              theme === 'sepia'
                ? 'bg-[#FBF5E8] text-[#291A08] border-[#E2D2BA]'
                : theme === 'azure'
                ? 'bg-[#F0F7FF] text-[#0C4A6E] border-[#BAE6FD]'
                : theme === 'mint'
                ? 'bg-[#F0FDF4] text-[#064E3B] border-[#BBF7D0]'
                : theme === 'light'
                ? 'bg-slate-50 text-slate-900 border-slate-200'
                : 'bg-white text-slate-900 border-slate-200 shadow-xs'
            } ${highContrast ? 'border-2 border-slate-900' : ''}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div className={`font-extrabold ${fontSize === 'large' ? 'text-base' : 'text-xs sm:text-sm'}`}>
                    FA/104/2024 · Subrata Roy vs State of WB
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                  Argument Board
                </span>
              </div>
              <div className={`text-slate-500 ${fontSize === 'large' ? 'text-xs' : 'text-[11px]'} flex flex-wrap gap-x-4 gap-y-1`}>
                <span><strong>Court:</strong> DL&amp;LRO Chamber</span>
                <span><strong>Next Date:</strong> 24 Oct 2024</span>
                <span><strong>Category:</strong> Section 54 First Appeal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetViewPreferences}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetDefaults}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeViewModal}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t.applyPreferences}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
