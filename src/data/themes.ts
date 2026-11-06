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
  { id: 'white', name: 'Deep Sapphire', nameBn: 'ডিপ স্যাফায়ার', category: 'Dark', bgHex: '#102B4C', accentHex: '#43A5FF', dotColor: 'bg-[#102B4C] border-2 border-blue-400', tagline: 'Deep sapphire + electric blue', description: 'Deep sapphire work surfaces with high-contrast blue accents', descriptionBn: 'গাঢ় স্যাফায়ার পটভূমি ও স্পষ্ট নীল হাইলাইট' },
  { id: 'light', name: 'Steel Graphite', nameBn: 'স্টিল গ্রাফাইট', category: 'Dark', bgHex: '#263A55', accentHex: '#82B7FF', dotColor: 'bg-[#263A55] border-2 border-blue-300', tagline: 'Graphite blue + ice blue accents', description: 'Dark graphite-blue surfaces with readable cool-blue accents', descriptionBn: 'গাঢ় গ্রাফাইট-নীল পটভূমি ও স্পষ্ট হালকা নীল হাইলাইট' },
  { id: 'sepia', name: 'Bronze Chamber', nameBn: 'ব্রোঞ্জ চেম্বার', category: 'Dark', bgHex: '#3D2C1C', accentHex: '#D6A85D', dotColor: 'bg-[#3D2C1C] border-2 border-amber-400', tagline: 'Dark bronze + antique gold', description: 'Deep brown surfaces with clear bronze-gold highlights', descriptionBn: 'গাঢ় ব্রাউন পটভূমি ও ব্রোঞ্জ-গোল্ড হাইলাইট' },
  { id: 'azure', name: 'Deep Courtroom Blue', nameBn: 'ডিপ কোর্টরুম ব্লু', category: 'Dark', bgHex: '#123A5A', accentHex: '#48B9F0', dotColor: 'bg-[#123A5A] border-2 border-sky-300', tagline: 'Deep court blue + aqua', description: 'Dark courtroom-blue surfaces with vivid aqua accents', descriptionBn: 'গাঢ় কোর্টরুম ব্লু পটভূমি ও উজ্জ্বল অ্যাকোয়া হাইলাইট' },
  { id: 'mint', name: 'Deep Land Record Green', nameBn: 'ডিপ ল্যান্ড রেকর্ড গ্রিন', category: 'Dark', bgHex: '#123D32', accentHex: '#55D69B', dotColor: 'bg-[#123D32] border-2 border-emerald-300', tagline: 'Forest green + vivid mint', description: 'Deep forest-green surfaces with clear mint highlights', descriptionBn: 'গাঢ় ফরেস্ট-গ্রিন পটভূমি ও স্পষ্ট মিন্ট হাইলাইট' },
  { id: 'navy', name: 'Midnight Navy', nameBn: 'মিডনাইট নেভি', category: 'Dark', bgHex: '#081A2E', accentHex: '#48A4FF', dotColor: 'bg-[#081A2E] border-2 border-blue-400', tagline: 'Default theme · Deep navy + electric blue', description: 'Deep navy workspace, raised blue panels and bright readable text', descriptionBn: 'গাঢ় নেভি কর্মক্ষেত্র, উজ্জ্বল নীল প্যানেল ও স্পষ্ট লেখা' },
  { id: 'charcoal', name: 'Graphite Charcoal', nameBn: 'গ্রাফাইট চারকোল', category: 'Dark', bgHex: '#303B4B', accentHex: '#B8D0F0', dotColor: 'bg-slate-700 border-2 border-slate-300', tagline: 'Graphite surfaces with silver-blue details', description: 'Rich graphite surfaces, silver-blue highlights and clear white text', descriptionBn: 'গাঢ় গ্রাফাইট পটভূমি, সিলভার-নীল হাইলাইট ও সাদা লেখা' },
  { id: 'emerald', name: 'Forest Emerald', nameBn: 'ফরেস্ট এমেরাল্ড', category: 'Dark', bgHex: '#145C47', accentHex: '#72E2B4', dotColor: 'bg-emerald-800 border-2 border-emerald-300', tagline: 'Deep forest green + bright mint', description: 'Deep forest-green panels with bright mint highlights and clear text', descriptionBn: 'গাঢ় ফরেস্ট-গ্রিন প্যানেল, উজ্জ্বল মিন্ট হাইলাইট ও স্পষ্ট লেখা' },
  { id: 'indigo', name: 'Royal Indigo', nameBn: 'রয়্যাল ইন্ডিগো', category: 'Dark', bgHex: '#342B69', accentHex: '#C4B5FD', dotColor: 'bg-violet-900 border-2 border-violet-300', tagline: 'Rich indigo with lavender highlights', description: 'Rich indigo surfaces, visible lavender accents and bright text', descriptionBn: 'গাঢ় ইন্ডিগো পটভূমি, ল্যাভেন্ডার হাইলাইট ও উজ্জ্বল লেখা' }
];
