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
  { id: 'white', name: 'Pure White', nameBn: 'পিওর সাদা', category: 'Light', bgHex: '#F4F7FC', accentHex: '#2563EB', dotColor: 'bg-white border-2 border-blue-500', tagline: 'Clean legal paper', description: 'Crisp white panels with a calm blue frame and deep readable text', descriptionBn: 'পরিষ্কার সাদা প্যানেল, নীল কাঠামো ও স্পষ্ট গাঢ় লেখা' },
  { id: 'light', name: 'Soft Slate', nameBn: 'সফট স্লেট', category: 'Light', bgHex: '#EAF0F7', accentHex: '#3478C8', dotColor: 'bg-slate-200 border-2 border-blue-500', tagline: 'Balanced workspace', description: 'Soft grey-blue canvas with bright cards and strong contrast', descriptionBn: 'হালকা ধূসর-নীল পটভূমি, উজ্জ্বল কার্ড ও স্পষ্ট লেখা' },
  { id: 'sepia', name: 'Warm Parchment', nameBn: 'ওয়ার্ম পার্চমেন্ট', category: 'Light', bgHex: '#F5EBDD', accentHex: '#A45B24', dotColor: 'bg-amber-100 border-2 border-amber-700', tagline: 'Traditional legal paper', description: 'Warm parchment surfaces with dark brown text and bronze accents', descriptionBn: 'উষ্ণ কাগজের রং, গাঢ় বাদামি লেখা ও ব্রোঞ্জ হাইলাইট' },
  { id: 'azure', name: 'Courtroom Blue', nameBn: 'কোর্টরুম ব্লু', category: 'Light', bgHex: '#E7F2FC', accentHex: '#0D6EAA', dotColor: 'bg-sky-100 border-2 border-sky-600', tagline: 'Clear and calm', description: 'Cool blue surfaces with crisp white panels and deep blue navigation', descriptionBn: 'শান্ত নীল পটভূমি, সাদা প্যানেল ও গাঢ় নীল মেনু' },
  { id: 'mint', name: 'Land Record Green', nameBn: 'ল্যান্ড রেকর্ড গ্রিন', category: 'Light', bgHex: '#E8F4EC', accentHex: '#21845B', dotColor: 'bg-emerald-100 border-2 border-emerald-700', tagline: 'Revenue office calm', description: 'Muted green canvas with clean white cards and forest accents', descriptionBn: 'হালকা সবুজ পটভূমি, সাদা কার্ড ও গাঢ় সবুজ হাইলাইট' },
  { id: 'navy', name: 'Midnight Navy', nameBn: 'মিডনাইট নেভি', category: 'Dark', bgHex: '#081A2E', accentHex: '#48A4FF', dotColor: 'bg-[#081A2E] border-2 border-blue-400', tagline: 'Premium default theme', description: 'Deep navy workspace, lifted blue panels and bright readable text', descriptionBn: 'গাঢ় নেভি কর্মক্ষেত্র, উঁচু নীল প্যানেল ও উজ্জ্বল স্পষ্ট লেখা' },
  { id: 'charcoal', name: 'Graphite Charcoal', nameBn: 'গ্রাফাইট চারকোল', category: 'Dark', bgHex: '#171F2A', accentHex: '#9BB4D8', dotColor: 'bg-[#171F2A] border-2 border-slate-400', tagline: 'Neutral dark workspace', description: 'Graphite surfaces with cool silver-blue accents and soft white text', descriptionBn: 'গ্রাফাইট পটভূমি, রুপালি-নীল হাইলাইট ও হালকা লেখা' },
  { id: 'emerald', name: 'Forest Emerald', nameBn: 'ফরেস্ট এমেরাল্ড', category: 'Dark', bgHex: '#10251F', accentHex: '#56D6A2', dotColor: 'bg-[#10251F] border-2 border-emerald-400', tagline: 'Deep green workspace', description: 'Forest-green panels with mint accents and clear light text', descriptionBn: 'গাঢ় সবুজ প্যানেল, মিন্ট হাইলাইট ও স্পষ্ট হালকা লেখা' },
  { id: 'indigo', name: 'Royal Indigo', nameBn: 'রয়্যাল ইন্ডিগো', category: 'Dark', bgHex: '#1D1B35', accentHex: '#B7A5FF', dotColor: 'bg-[#1D1B35] border-2 border-violet-400', tagline: 'Elegant violet workspace', description: 'Rich indigo surfaces with lavender highlights and bright text', descriptionBn: 'গাঢ় ইন্ডিগো প্যানেল, ল্যাভেন্ডার হাইলাইট ও উজ্জ্বল লেখা' }
];
