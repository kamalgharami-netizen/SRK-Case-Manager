import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, ChevronDown, LayoutTemplate } from 'lucide-react';

const TEMPLATE_LAYOUTS = [
  { style: '3d', name: 'Reference 3D', nameBn: 'রেফারেন্স 3D', detail: 'Raised dashboard cards' },
  { style: 'modern', name: 'Modern Workspace', nameBn: 'মডার্ন ওয়ার্কস্পেস', detail: 'Clean modular panels' },
  { style: 'glass', name: 'Layered Command', nameBn: 'লেয়ারড কমান্ড', detail: 'Layered translucent panels' },
  { style: 'classic', name: 'Classic Chamber', nameBn: 'ক্লাসিক চেম্বার', detail: 'Formal office arrangement' },
  { style: 'executive', name: 'Executive Suite', nameBn: 'এক্সিকিউটিভ স্যুট', detail: 'Premium executive layout' },
  { style: 'royal', name: 'Royal Chamber', nameBn: 'রয়্যাল চেম্বার', detail: 'Wide royal navigation' },
  { style: 'compact', name: 'Compact Case Desk', nameBn: 'কমপ্যাক্ট কেস ডেস্ক', detail: 'Dense work-first layout' },
  { style: 'soft', name: 'Balanced Workspace', nameBn: 'ব্যালান্সড ওয়ার্কস্পেস', detail: 'Spacious rounded panels' },
  { style: 'midnight', name: 'Midnight Docket', nameBn: 'মিডনাইট ডকেট', detail: 'Narrow navigation and docket rows' },
  { style: 'ocean', name: 'Ocean Command', nameBn: 'ওশান কমান্ড', detail: 'Rounded command surfaces' },
  { style: 'emerald', name: 'Emerald Chamber', nameBn: 'এমেরাল্ড চেম্বার', detail: 'Balanced green workspace' },
  { style: 'copper', name: 'Copper Heritage', nameBn: 'কপার হেরিটেজ', detail: 'Formal framed panels' },
  { style: 'architect', name: 'Architect Desk', nameBn: 'আর্কিটেক্ট ডেস্ক', detail: 'Split navigation with wide workspace' },
  { style: 'dashboard', name: 'Command Dashboard', nameBn: 'কমান্ড ড্যাশবোর্ড', detail: 'Large metric-first dashboard' },
  { style: 'ribbon', name: 'Ribbon Workspace', nameBn: 'রিবন ওয়ার্কস্পেস', detail: 'Top action ribbon and grouped tools' },
  { style: 'split', name: 'Split Panel Office', nameBn: 'স্প্লিট প্যানেল অফিস', detail: 'Two-column working canvas' },
  { style: 'docket', name: 'Court Docket', nameBn: 'কোর্ট ডকেট', detail: 'Hearing-list focused layout' },
  { style: 'editorial', name: 'Editorial Legal', nameBn: 'এডিটোরিয়াল লিগ্যাল', detail: 'Typography-led reading layout' },
  { style: 'command', name: 'Command Centre', nameBn: 'কমান্ড সেন্টার', detail: 'Compact command tiles and shortcuts' },
  { style: 'sidebar', name: 'Wide Sidebar Suite', nameBn: 'ওয়াইড সাইডবার স্যুট', detail: 'Wide persistent navigation rail' },
  { style: 'matrix', name: 'Matrix Workspace', nameBn: 'ম্যাট্রিক্স ওয়ার্কস্পেস', detail: 'Tight multi-column information grid' },
  { style: 'dossier', name: 'Case Dossier', nameBn: 'কেস ডসিয়ার', detail: 'Document dossier and record panels' },
  { style: 'ledger', name: 'Land Ledger', nameBn: 'ল্যান্ড লেজার', detail: 'Ledger-style tables and rows' },
  { style: 'minimal', name: 'Minimal Chamber', nameBn: 'মিনিমাল চেম্বার', detail: 'Quiet flat surfaces and clean spacing' }
] as const;

const PALETTES = [
  { theme: 'navy', name: 'Deep Blue', nameBn: 'গাঢ় নীল', bg: '#081A2E', panel: '#193653', accent: '#48A4FF' },
  { theme: 'white', name: 'Dark Blue', nameBn: 'গাঢ় নীলচে', bg: '#0B1E35', panel: '#1B3858', accent: '#43A5FF' },
  { theme: 'light', name: 'Charcoal Grey', nameBn: 'গাঢ় ধূসর', bg: '#17283D', panel: '#294562', accent: '#82B7FF' },
  { theme: 'mint', name: 'Dark Green', nameBn: 'গাঢ় সবুজ', bg: '#0B2B23', panel: '#195141', accent: '#55D69B' },
  { theme: 'azure', name: 'Ocean Blue', nameBn: 'সমুদ্র নীল', bg: '#0A263D', panel: '#194968', accent: '#48B9F0' },
  { theme: 'charcoal', name: 'Slate Grey', nameBn: 'স্লেট ধূসর', bg: '#171D26', panel: '#303C4B', accent: '#B8D0F0' },
  { theme: 'emerald', name: 'Forest Green', nameBn: 'বন সবুজ', bg: '#0B2B23', panel: '#1D5540', accent: '#72E2B4' },
  { theme: 'indigo', name: 'Deep Purple', nameBn: 'গাঢ় বেগুনি', bg: '#19162F', panel: '#393064', accent: '#C4B5FD' },
  { theme: 'sepia', name: 'Dark Brown', nameBn: 'গাঢ় বাদামি', bg: '#261D16', panel: '#493526', accent: '#D6A85D' }
] as const;

// 24 distinct layout templates, each paired with a deep, high-contrast palette.
const UI_TEMPLATES = TEMPLATE_LAYOUTS.map((layout, index) => ({
  ...layout,
  palette: PALETTES[index % PALETTES.length],
  id: layout.style
}));

interface ThemeDropdownProps { variant?: 'compact' | 'full' | 'sidebar'; className?: string; }

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ variant = 'compact', className = '' }) => {
  const { theme, setTheme, uiStyle, setUIStyle, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const selected = UI_TEMPLATES.find(item => item.style === uiStyle && item.palette.theme === theme) || UI_TEMPLATES[0];
  const applyTemplate = (item: typeof UI_TEMPLATES[number]) => {
    setUIStyle(item.style as typeof uiStyle);
    setTheme(item.palette.theme as typeof theme);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${variant === 'compact' ? 'inline-block' : 'block w-full'} ${className}`}>
      <button type="button" onClick={() => setIsOpen(v => !v)} aria-haspopup="listbox" aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-sky-500/70 bg-[#0A2038] px-3 py-3 text-left text-xs font-bold text-slate-100 hover:bg-[#123454] ${variant === 'compact' ? 'max-w-[260px]' : ''}`}>
        <span className="flex min-w-0 items-center gap-2"><LayoutTemplate className="h-4 w-4 shrink-0 text-sky-300" /><span className="truncate">{language === 'bn' ? selected.nameBn : selected.name}</span></span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="absolute right-0 z-[90] mt-2 max-h-[70vh] w-[min(94vw,720px)] overflow-y-auto rounded-2xl border border-sky-500/60 bg-[#07182B] p-3 shadow-[0_18px_40px_rgba(0,0,0,.7)]">
        <div className="mb-3 flex items-center justify-between gap-2 px-1 text-slate-100">
          <span className="text-sm font-extrabold">{language === 'bn' ? 'UI Template নির্বাচন করুন' : 'Choose a UI Template'}</span>
          <span className="rounded-lg bg-[#183653] px-2 py-1 text-[10px] font-bold text-sky-200">{UI_TEMPLATES.length} templates</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {UI_TEMPLATES.map((item, index) => {
            const active = selected.id === item.id && selected.palette.theme === item.palette.theme;
            return <button key={item.id} type="button" onClick={() => applyTemplate(item)} aria-pressed={active}
              className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${active ? 'border-sky-300 bg-[#183653]' : 'border-[#294663] bg-[#102943] hover:border-sky-500'}`}>
              <span className="flex h-12 w-14 shrink-0 flex-col justify-between overflow-hidden rounded-lg border border-slate-500/50 p-1" style={{ backgroundColor: item.palette.bg }}>
                <span className="h-2 w-full rounded-sm" style={{ backgroundColor: item.palette.accent }} />
                <span className="grid grid-cols-2 gap-1"><i className="h-3 rounded-sm" style={{ backgroundColor: item.palette.panel }} /><i className="h-3 rounded-sm" style={{ backgroundColor: item.palette.accent, opacity: .75 }} /></span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-extrabold text-slate-100">{language === 'bn' ? item.nameBn : item.name}</span>
                <span className="mt-1 block truncate text-[10px] text-slate-300">{language === 'bn' ? item.palette.nameBn : item.palette.name}</span>
                <span className="mt-1 block truncate text-[10px] text-slate-400">{item.detail}</span>
              </span>
              {active && <Check className="h-4 w-4 shrink-0 text-sky-300" />}
            </button>;
          })}
        </div>
        <p className="mt-3 border-t border-[#294663] pt-3 text-[10px] text-slate-300">{language === 'bn' ? 'প্রতিটি Template-এ UI বিন্যাস ও ডিপ কালার একসঙ্গে প্রয়োগ হয়।' : 'Every template applies its layout and deep colour palette together.'}</p>
      </div>}
    </div>
  );
};
