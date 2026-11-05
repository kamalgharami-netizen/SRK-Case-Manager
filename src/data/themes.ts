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
  { id: 'white', name: 'Pure White + Royal Blue', nameBn: 'পিওর হোয়াইট + রয়্যাল ব্লু', category: 'Light', bgHex: '#DCEBFA', accentHex: '#0757B8', dotColor: 'bg-blue-100 border-2 border-blue-700', tagline: 'Bright blue frame, crisp white cards', description: 'A strong royal-blue frame, white work panels and dark navy text', descriptionBn: 'গাঢ় রয়্যাল ব্লু কাঠামো, সাদা কাজের প্যানেল ও স্পষ্ট নেভি লেখা' },
  { id: 'light', name: 'Soft Slate + Blue', nameBn: 'সফট স্লেট + ব্লু', category: 'Light', bgHex: '#C9D6E5', accentHex: '#245A9B', dotColor: 'bg-slate-300 border-2 border-blue-700', tagline: 'Steel-blue workspace with clear panels', description: 'Visible slate-blue surfaces, bright panels and deep readable text', descriptionBn: 'স্পষ্ট স্লেট-নীল পটভূমি, উজ্জ্বল প্যানেল ও গাঢ় লেখা' },
  { id: 'sepia', name: 'Warm Parchment + Bronze', nameBn: 'ওয়ার্ম পার্চমেন্ট + ব্রোঞ্জ', category: 'Light', bgHex: '#E8D1A4', accentHex: '#8A4318', dotColor: 'bg-amber-200 border-2 border-amber-800', tagline: 'Warm gold paper with bronze details', description: 'Rich parchment colour, dark brown text and clear bronze highlights', descriptionBn: 'গাঢ় সোনালি কাগজের রং, বাদামি লেখা ও ব্রোঞ্জ হাইলাইট' },
  { id: 'azure', name: 'Courtroom Blue', nameBn: 'কোর্টরুম ব্লু', category: 'Light', bgHex: '#A8D4F5', accentHex: '#075A91', dotColor: 'bg-sky-300 border-2 border-sky-800', tagline: 'Confident blue with deep-blue navigation', description: 'Clearly blue surfaces, white work panels and deep-blue navigation', descriptionBn: 'স্পষ্ট নীল পটভূমি, সাদা প্যানেল ও গাঢ় নীল মেনু' },
  { id: 'mint', name: 'Land Record Green', nameBn: 'ল্যান্ড রেকর্ড গ্রিন', category: 'Light', bgHex: '#A9D8B7', accentHex: '#17613E', dotColor: 'bg-emerald-300 border-2 border-emerald-800', tagline: 'Land-office green with forest accents', description: 'Recognisable green surfaces, clean panels and forest-green highlights', descriptionBn: 'স্পষ্ট সবুজ পটভূমি, পরিষ্কার প্যানেল ও ফরেস্ট-গ্রিন হাইলাইট' },
  { id: 'navy', name: 'Midnight Navy', nameBn: 'মিডনাইট নেভি', category: 'Dark', bgHex: '#081A2E', accentHex: '#48A4FF', dotColor: 'bg-[#081A2E] border-2 border-blue-400', tagline: 'Default theme · Deep navy + electric blue', description: 'Deep navy workspace, raised blue panels and bright readable text', descriptionBn: 'গাঢ় নেভি কর্মক্ষেত্র, উজ্জ্বল নীল প্যানেল ও স্পষ্ট লেখা' },
  { id: 'charcoal', name: 'Graphite Charcoal', nameBn: 'গ্রাফাইট চারকোল', category: 'Dark', bgHex: '#303B4B', accentHex: '#B8D0F0', dotColor: 'bg-slate-700 border-2 border-slate-300', tagline: 'Graphite surfaces with silver-blue details', description: 'Rich graphite surfaces, silver-blue highlights and clear white text', descriptionBn: 'গাঢ় গ্রাফাইট পটভূমি, সিলভার-নীল হাইলাইট ও সাদা লেখা' },
  { id: 'emerald', name: 'Forest Emerald', nameBn: 'ফরেস্ট এমেরাল্ড', category: 'Dark', bgHex: '#145C47', accentHex: '#72E2B4', dotColor: 'bg-emerald-800 border-2 border-emerald-300', tagline: 'Deep forest green + bright mint', description: 'Deep forest-green panels with bright mint highlights and clear text', descriptionBn: 'গাঢ় ফরেস্ট-গ্রিন প্যানেল, উজ্জ্বল মিন্ট হাইলাইট ও স্পষ্ট লেখা' },
  { id: 'indigo', name: 'Royal Indigo', nameBn: 'রয়্যাল ইন্ডিগো', category: 'Dark', bgHex: '#342B69', accentHex: '#C4B5FD', dotColor: 'bg-violet-900 border-2 border-violet-300', tagline: 'Rich indigo with lavender highlights', description: 'Rich indigo surfaces, visible lavender accents and bright text', descriptionBn: 'গাঢ় ইন্ডিগো পটভূমি, ল্যাভেন্ডার হাইলাইট ও উজ্জ্বল লেখা' }
];
