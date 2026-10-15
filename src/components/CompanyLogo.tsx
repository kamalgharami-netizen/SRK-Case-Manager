import React from 'react';
import { Company } from '../types';
import {
  Scale,
  Landmark,
  Gavel,
  Shield,
  BookOpen,
  Award
} from 'lucide-react';

interface CompanyLogoProps {
  company?: Company | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
}

export const BADGE_ICONS = {
  scales: Scale,
  pillar: Landmark,
  gavel: Gavel,
  shield: Shield,
  book: BookOpen,
  ashoka: Award
};

export const BADGE_OPTIONS: { id: keyof typeof BADGE_ICONS; label: string; bengali: string }[] = [
  { id: 'scales', label: 'Scales of Justice', bengali: 'ন্যায়দণ্ড (Scales)' },
  { id: 'pillar', label: 'High Court Pillar', bengali: 'আদালত স্তম্ভ (Pillars)' },
  { id: 'gavel', label: 'Judicial Gavel', bengali: 'বিচারিক হাতুড়ি (Gavel)' },
  { id: 'shield', label: 'Legal Shield', bengali: 'আইনি শিল্ড (Shield)' },
  { id: 'book', label: 'Law Book & Code', bengali: 'আইন গ্রন্থ (Code)' },
  { id: 'ashoka', label: 'State Emblem', bengali: 'অশোক স্তম্ভ (Emblem)' }
];

export const COLOR_OPTIONS: { id: string; label: string; bg: string; text: string }[] = [
  { id: '#2563EB', label: 'Royal Blue', bg: 'from-blue-600 to-indigo-700', text: 'text-white' },
  { id: '#4F46E5', label: 'Regal Indigo', bg: 'from-indigo-600 to-purple-700', text: 'text-white' },
  { id: '#D97706', label: 'Golden Amber', bg: 'from-amber-500 to-amber-700', text: 'text-slate-950' },
  { id: '#059669', label: 'Emerald Green', bg: 'from-emerald-600 to-teal-800', text: 'text-white' },
  { id: '#DC2626', label: 'Crimson Red', bg: 'from-red-600 to-rose-800', text: 'text-white' },
  { id: '#0F172A', label: 'Executive Slate', bg: 'from-slate-800 to-slate-950', text: 'text-amber-400' }
];

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company,
  size = 'md',
  className = '',
  showBorder = true
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', icon: 'w-3.5 h-3.5', text: 'text-[9px]', radius: 'rounded-md' },
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-xs', radius: 'rounded-lg' },
    md: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-sm', radius: 'rounded-xl' },
    lg: { box: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base', radius: 'rounded-xl' },
    xl: { box: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-xl', radius: 'rounded-2xl' },
    '2xl': { box: 'w-20 h-20', icon: 'w-10 h-10', text: 'text-2xl', radius: 'rounded-2xl' }
  }[size];

  // If company has uploaded a custom image logo (like Vyapar app)
  if (company?.logoUrl) {
    return (
      <div
        className={`relative ${sizeMap.box} ${sizeMap.radius} overflow-hidden shrink-0 shadow-sm ${
          showBorder ? 'ring-2 ring-blue-500/30 dark:ring-blue-400/30' : ''
        } ${className}`}
      >
        <img
          src={company.logoUrl}
          alt={company.name || 'Company Logo'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Selected or default insignia
  const badgeKey = (company?.logoBadge && BADGE_ICONS[company.logoBadge]
    ? company.logoBadge
    : 'scales') as keyof typeof BADGE_ICONS;
  const BadgeIcon = BADGE_ICONS[badgeKey] || Scale;

  const matchedColor = COLOR_OPTIONS.find(c => c.id === company?.logoColor) || COLOR_OPTIONS[0];

  return (
    <div
      className={`relative ${sizeMap.box} ${sizeMap.radius} bg-gradient-to-tr ${matchedColor.bg} flex items-center justify-center shrink-0 shadow-md ${
        showBorder ? 'ring-2 ring-white/20 shadow-blue-600/20' : ''
      } ${className}`}
      title={company?.name || 'Chamber Logo'}
    >
      <BadgeIcon className={`${sizeMap.icon} ${matchedColor.text}`} />
      
      {/* Vyapar style small golden corner accent */}
      {size !== 'xs' && (
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 ring-1 ring-white/50" />
      )}
    </div>
  );
};
