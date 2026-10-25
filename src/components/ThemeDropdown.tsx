import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { THEME_OPTIONS, ThemeOption } from '../data/themes';
import { ChevronDown, Check, Palette, Sun } from 'lucide-react';

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

  const activeTheme = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const lightThemes = THEME_OPTIONS;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Dropdown Trigger Button */}
      {variant === 'sidebar' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:border-blue-500 transition-all cursor-pointer shadow-2xs"
          title="Choose Light Theme"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300 shadow-2xs"
              style={{ backgroundColor: activeTheme.bgHex }}
            />
            <span className="truncate font-bold">
              {language === 'bn' ? activeTheme.nameBn : activeTheme.name}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 hover:border-blue-400"
          title={`Active Theme: ${activeTheme.name} (${activeTheme.tagline}).`}
        >
          <span
            className="w-3 h-3 rounded-full shrink-0 border border-slate-400 shadow-2xs"
            style={{ backgroundColor: activeTheme.bgHex }}
          />
          <span className="hidden md:inline truncate max-w-[110px]">
            {language === 'bn' ? activeTheme.nameBn : activeTheme.name}
          </span>
          <span className="md:hidden">Theme</span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>
      )}

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={`absolute right-0 z-50 mt-1.5 w-72 sm:w-80 rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${
            variant === 'sidebar' ? 'left-0 right-auto sm:left-0 sm:right-auto bottom-full mb-2' : ''
          }`}
        >
          {/* Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'bn' ? 'থিম নির্বাচন (Light Themes)' : 'Courtroom Light Themes'}</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
              {THEME_OPTIONS.length} Themes
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
            {lightThemes.map(item => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTheme(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: item.bgHex }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs truncate flex items-center gap-1">
                        <span>{language === 'bn' ? item.nameBn : item.name}</span>
                        {item.id === 'white' && (
                          <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-600 font-mono">
                            #FFF
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {item.tagline}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
