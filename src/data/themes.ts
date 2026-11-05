export type AppTheme = 'white' | 'light' | 'sepia' | 'azure' | 'mint' | 'navy' | 'charcoal' | 'emerald' | 'indigo';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  nameBn: string;
  category: 'Light' | 'Dark';
  bgHex: string;
  accentHex: string;
  dotColor: string;
  tagline: string;
  description: string;
  descriptionBn: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'white', name: 'Pure White', nameBn: 'পিওর সাদা', category: 'Light', bgHex: '#FFFFFF', accentHex: '#2563EB', dotColor: 'bg-white border-2 border-slate-300', tagline: 'Bright paper', description: 'Pure white paper with dark readable text', descriptionBn: 'সাদা কাগজের মতো উজ্জ্বল ব্যাকগ্রাউন্ড ও গাঢ় লেখা' },
  { id: 'light', name: 'Soft Slate', nameBn: 'সফট স্লেট', category: 'Light', bgHex: '#E9EEF5', accentHex: '#1D4ED8', dotColor: 'bg-slate-200 border-2 border-slate-400', tagline: 'Balanced grey-blue', description: 'Soft cool grey surfaces with strong navy text', descriptionBn: 'হালকা ধূসর-নীল ব্যাকগ্রাউন্ড ও স্পষ্ট গাঢ় লেখা' },
  { id: 'sepia', name: 'Warm Parchment', nameBn: 'ওয়ার্ম পার্চমেন্ট', category: 'Light', bgHex: '#F3E8D2', accentHex: '#92400E', dotColor: 'bg-amber-100 border-2 border-amber-400', tagline: 'Warm legal paper', description: 'Warm parchment background with dark brown text', descriptionBn: 'উষ্ণ কাগজের রং ও গাঢ় বাদামি লেখা' },
  { id: 'azure', name: 'Courtroom Blue', nameBn: 'কোর্টরুম ব্লু', category: 'Light', bgHex: '#DCEBFA', accentHex: '#075985', dotColor: 'bg-sky-100 border-2 border-sky-400', tagline: 'Clear blue surfaces', description: 'Calm blue surfaces with high-contrast navy text', descriptionBn: 'শান্ত নীল ব্যাকগ্রাউন্ড ও গাঢ় নেভি লেখা' },
  { id: 'mint', name: 'Land Record Green', nameBn: 'ল্যান্ড রেকর্ড গ্রিন', category: 'Light', bgHex: '#DDF1E5', accentHex: '#065F46', dotColor: 'bg-emerald-100 border-2 border-emerald-400', tagline: 'Soft revenue green', description: 'Muted green paper with deep forest text', descriptionBn: 'হালকা সবুজ ব্যাকগ্রাউন্ড ও গাঢ় সবুজ লেখা' },
  { id: 'navy', name: 'Midnight Navy', nameBn: 'মিডনাইট নেভি', category: 'Dark', bgHex: '#101D33', accentHex: '#60A5FA', dotColor: 'bg-[#101D33] border-2 border-blue-400', tagline: 'Premium dark blue', description: 'Deep navy panels, clear white text and blue highlights', descriptionBn: 'গাঢ় নেভি ব্যাকগ্রাউন্ড, সাদা লেখা ও নীল হাইলাইট' },
  { id: 'charcoal', name: 'Graphite Charcoal', nameBn: 'গ্রাফাইট চারকোল', category: 'Dark', bgHex: '#20252D', accentHex: '#A5B4FC', dotColor: 'bg-[#20252D] border-2 border-slate-400', tagline: 'Neutral dark mode', description: 'Balanced charcoal surfaces with soft white text', descriptionBn: 'চারকোল ধূসর ব্যাকগ্রাউন্ড ও পরিষ্কার হালকা লেখা' },
  { id: 'emerald', name: 'Forest Emerald', nameBn: 'ফরেস্ট এমেরাল্ড', category: 'Dark', bgHex: '#102A26', accentHex: '#6EE7B7', dotColor: 'bg-[#102A26] border-2 border-emerald-400', tagline: 'Deep green mode', description: 'Deep green workspace with mint accents', descriptionBn: 'গাঢ় সবুজ কর্মক্ষেত্র ও মিন্ট হাইলাইট' },
  { id: 'indigo', name: 'Royal Indigo', nameBn: 'রয়্যাল ইন্ডিগো', category: 'Dark', bgHex: '#211D3A', accentHex: '#C4B5FD', dotColor: 'bg-[#211D3A] border-2 border-violet-400', tagline: 'Elegant violet mode', description: 'Rich indigo surfaces with bright lavender accents', descriptionBn: 'গাঢ় ইন্ডিগো ব্যাকগ্রাউন্ড ও উজ্জ্বল ল্যাভেন্ডার হাইলাইট' }
];
