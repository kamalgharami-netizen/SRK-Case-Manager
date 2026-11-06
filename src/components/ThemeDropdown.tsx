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

interface ThemeDropdownProps { variant?: 'compact' | 'full' | 'sidebar'; className?: string; }

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ variant = 'compact', className = '' }) => {
  const { uiStyle, setUIStyle, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const selected = TEMPLATE_LAYOUTS.find(item => item.style === uiStyle) || TEMPLATE_LAYOUTS[0];
  const applyTemplate = (item: typeof TEMPLATE_LAYOUTS[number]) => {
    // Layout selection must never alter the user's currently selected colour theme.
    setUIStyle(item.style as typeof uiStyle);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${variant === 'compact' ? 'inline-block' : 'block w-full'} ${className}`}>
      <button type="button" onClick={() => setIsOpen(v => !v)} aria-haspopup="listbox" aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-[#DCE7F3] bg-white px-3 py-3 text-left text-xs font-bold text-[#0A2540] hover:bg-[#F6FAFD] ${variant === 'compact' ? 'max-w-[260px]' : ''}`}>
        <span className="flex min-w-0 items-center gap-2"><LayoutTemplate className="h-4 w-4 shrink-0 text-[#1976D2]" /><span className="truncate">{language === 'bn' ? selected.nameBn : selected.name}</span></span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#5A6B82] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="absolute right-0 z-[90] mt-2 max-h-[70vh] w-[min(94vw,720px)] overflow-y-auto rounded-2xl border border-[#DCE7F3] bg-white p-3 shadow-[0_18px_40px_rgba(8,50,101,.18)]">
        <div className="mb-3 flex items-center justify-between gap-2 px-1 text-[#0A2540]">
          <span className="text-sm font-extrabold">{language === 'bn' ? 'UI Template নির্বাচন করুন' : 'Choose a UI Template'}</span>
          <span className="rounded-lg bg-[#EBF3FB] px-2 py-1 text-[10px] font-bold text-[#1976D2]">{TEMPLATE_LAYOUTS.length} templates</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TEMPLATE_LAYOUTS.map((item, index) => {
            const active = selected.style === item.style;
            return <button key={item.style} type="button" onClick={() => applyTemplate(item)} aria-pressed={active}
              className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${active ? 'border-[#1976D2] bg-[#EBF3FB]' : 'border-[#DCE7F3] bg-white hover:border-[#1976D2] hover:bg-[#F6FAFD]'}`}>
              <span className="flex h-12 w-14 shrink-0 flex-col justify-between overflow-hidden rounded-lg border border-[#DCE7F3] bg-[#EBF3FB] p-1">
                <span className="h-2 w-full rounded-sm bg-[#083265]" />
                <span className="grid grid-cols-2 gap-1"><i className={`h-3 rounded-sm ${index % 3 === 0 ? 'bg-[#10B981]' : 'bg-[#1976D2]'}`} /><i className="h-3 rounded-sm bg-[#F97316]" /></span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-extrabold text-[#0A2540]">{language === 'bn' ? item.nameBn : item.name}</span>
                <span className="mt-1 block truncate text-[10px] text-[#5A6B82]">{item.detail}</span>
                <span className="mt-1 block truncate text-[10px] font-semibold text-[#1976D2]">{language === 'bn' ? 'বর্তমান রং বজায় থাকবে' : 'Keeps current colours'}</span>
              </span>
              {active && <Check className="h-4 w-4 shrink-0 text-[#1976D2]" />}
            </button>;
          })}
        </div>
        <p className="mt-3 border-t border-[#DCE7F3] pt-3 text-[10px] text-[#5A6B82]">{language === 'bn' ? 'Template নির্বাচন করলে শুধু UI বিন্যাস নির্বাচন হবে; বর্তমান Colour Combination পরিবর্তন হবে না।' : 'Selecting a template changes the layout preference only; your current colour combination remains unchanged.'}</p>
      </div>}
    </div>
  );
};
