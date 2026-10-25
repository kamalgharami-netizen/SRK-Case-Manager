import React from 'react';
import { useApp } from '../context/AppContext';
import {
  SlidersHorizontal,
  Sun,
  Moon,
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
  Palette
} from 'lucide-react';
import { THEME_OPTIONS } from '../data/themes';
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
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{t.displayPreferences}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  SRK View
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'কোর্টরুম থিম, ফন্ট সাইজ ও তথ্য ঘনত্ব আপনার পছন্দমতো সাজান'
                  : 'Customize courtroom theme, reading typography, and information density'}
              </p>
            </div>
          </div>
          <button
            onClick={closeViewModal}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* SECTION 1: Theme Mode */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{t.themeMode}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {theme === 'white'
                  ? language === 'bn'
                    ? 'পিওর সাদা (Pure White)'
                    : 'Pure White (#FFFFFF)'
                  : theme === 'light'
                  ? t.lightTheme
                  : t.darkTheme}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {/* Pure White */}
              <button
                type="button"
                onClick={() => setTheme('white')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  theme === 'white'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-900 flex items-center justify-center font-bold shadow-2xs">
                    <Sun className="w-4 h-4 text-amber-500" />
                  </div>
                  {theme === 'white' && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {language === 'bn' ? 'সাদা' : 'White'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  #FFFFFF paper
                </div>
              </button>

              {/* Soft Light */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center font-bold">
                    <Sun className="w-4 h-4 text-blue-600" />
                  </div>
                  {theme === 'light' && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {language === 'bn' ? 'স্লেট লাইট' : 'Soft Light'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Daylight slate
                </div>
              </button>

              {/* Warm Sepia */}
              <button
                type="button"
                onClick={() => setTheme('sepia')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  theme === 'sepia'
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 bg-[#FBF5E8] hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F4E9D4] text-amber-800 flex items-center justify-center font-bold">
                    <Sun className="w-4 h-4 text-amber-700" />
                  </div>
                  {theme === 'sepia' && (
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {language === 'bn' ? 'সেপিয়া' : 'Sepia'}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Warm parchment
                </div>
              </button>

              {/* Courtroom Azure */}
              <button
                type="button"
                onClick={() => setTheme('azure')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  theme === 'azure'
                    ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-500/30 shadow-xs'
                    : 'border-slate-200 bg-[#F0F7FF] hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <Sun className="w-4 h-4 text-sky-600" />
                  </div>
                  {theme === 'azure' && (
                    <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {language === 'bn' ? 'এজুর ব্লু' : 'Azure'}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Sky daylight
                </div>
              </button>

              {/* Land Revenue Mint */}
              <button
                type="button"
                onClick={() => setTheme('mint')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  theme === 'mint'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30 shadow-xs'
                    : 'border-slate-200 bg-[#F0FDF4] hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Sun className="w-4 h-4 text-emerald-600" />
                  </div>
                  {theme === 'mint' && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {language === 'bn' ? 'মিন্ট গ্রিন' : 'Mint Paper'}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Land record mint
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: Information Density */}
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

          {/* SECTION 3: Case Layout (Grid vs Table) */}
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

          {/* SECTION 4: Typography & Reading Scale */}
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

          {/* SECTION 5: High-Contrast Toggle */}
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

          {/* SECTION 6: Interactive Live Visual Preview */}
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
