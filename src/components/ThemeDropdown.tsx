import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { THEME_OPTIONS, ThemeOption } from '../data/themes';
import { ChevronDown, Check, Palette, Sun, Moon } from 'lucide-react';

interface ThemeDropdownProps {
  variant?: 'compact' | 'full' | 'sidebar';
  className?: string;
}

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const { theme, setTheme, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeTheme = THEME_OPTIONS.find(item => item.id === theme) || THEME_OPTIONS.find(item => item.id === 'navy')!;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const renderTheme = (item: ThemeOption) => {
    const selected = theme === item.id;
    const dark = item.category === 'Dark';
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => { setTheme(item.id); setIsOpen(false); }}
        aria-pressed={selected}
        className={`w-full min-w-0 overflow-hidden rounded-xl border-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${selected ? 'border-amber-400 ring-2 ring-amber-300/50 shadow-lg' : 'border-slate-300 hover:border-blue-500'}`}
        style={{ backgroundColor: item.bgHex, color: dark ? '#FFFFFF' : '#172033' }}
      >
        <div className="h-2.5 w-full" style={{ background: `linear-gradient(90deg, ${item.bgHex} 0%, ${item.accentHex} 100%)` }} />
        <div className="flex items-center gap-2 p-2.5">
          <span className="h-8 w-8 shrink-0 rounded-lg border-2 border-white/80 shadow-md" style={{ background: item.accentHex }} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-extrabold">{language === 'bn' ? item.nameBn : item.name}</span>
            <span className="mt-0.5 block truncate text-[10px] font-semibold opacity-85">{item.tagline}</span>
          </span>
          {selected && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow"><Check className="h-4 w-4 stroke-[3]" /></span>}
        </div>
      </button>
    );
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(value => !value)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={variant === 'sidebar'
          ? 'flex w-full items-center justify-between gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-xs font-bold text-white shadow-md hover:bg-white/20'
          : 'flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-blue-100'}
        title={`Active theme: ${activeTheme.name}`}
      >
        <span className="h-4 w-4 shrink-0 rounded-full border-2 border-white shadow" style={{ backgroundColor: activeTheme.bgHex }} />
        <span className="min-w-0 truncate">{language === 'bn' ? activeTheme.nameBn : activeTheme.name}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 z-[80] mt-2 w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-2xl ${variant === 'sidebar' ? 'bottom-full left-0 right-auto mb-2' : ''}`}>
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#082B52] to-[#0876D5] px-4 py-3 text-white">
            <div className="flex items-center gap-2 text-sm font-extrabold"><Palette className="h-4 w-4" />{language === 'bn' ? 'রঙিন থিম নির্বাচন' : 'Choose a Colour Theme'}</div>
            <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold">{THEME_OPTIONS.length} themes</span>
          </div>
          <div className="max-h-[65vh] space-y-3 overflow-y-auto p-3">
            <section>
              <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-700"><Sun className="h-4 w-4 text-amber-600" />{language === 'bn' ? 'উজ্জ্বল রঙের থিম' : 'Bright Colour Themes'}</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{THEME_OPTIONS.filter(item => item.category === 'Light').map(renderTheme)}</div>
            </section>
            <section>
              <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-700"><Moon className="h-4 w-4 text-indigo-700" />{language === 'bn' ? 'গাঢ় রঙের থিম' : 'Deep Colour Themes'}</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{THEME_OPTIONS.filter(item => item.category === 'Dark').map(renderTheme)}</div>
            </section>
          </div>
          <div className="border-t border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600">
            {language === 'bn' ? 'নির্বাচিত থিম সঙ্গে সঙ্গে পুরো অ্যাপে প্রয়োগ হবে।' : 'Your selection is applied across the app immediately.'}
          </div>
        </div>
      )}
    </div>
  );
};
