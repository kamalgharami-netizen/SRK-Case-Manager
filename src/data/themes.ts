export type AppTheme =
  | 'white'
  | 'light'
  | 'dark'
  | 'navy'
  | 'emerald'
  | 'sepia'
  | 'charcoal'
  | 'indigo';

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
  {
    id: 'white',
    name: 'Pure White',
    nameBn: 'পিওর সাদা',
    category: 'Light',
    bgHex: '#FFFFFF',
    accentHex: '#2563EB',
    dotColor: 'bg-white border-2 border-slate-300',
    tagline: 'Pure paper #FFFFFF',
    description: 'Crisp #FFFFFF clean paper background for maximum courtroom clarity and mobile daylight viewing',
    descriptionBn: 'উজ্জ্বল সাদা ব্যাকগ্রাউন্ড, সর্বোচ্চ স্পষ্টতা ও আরামদায়ক রিডিং'
  },
  {
    id: 'light',
    name: 'Soft Light',
    nameBn: 'হালকা স্লেট',
    category: 'Light',
    bgHex: '#F8FAFC',
    accentHex: '#3B82F6',
    dotColor: 'bg-slate-100 border-2 border-slate-300',
    tagline: 'Daylight slate & blue',
    description: 'Gentle daylight slate background with classic professional legal blue accents',
    descriptionBn: 'চোখের জন্য আরামদায়ক হালকা স্লেট ব্যাকগ্রাউন্ড ও ব্লু অ্যাকসেন্ট'
  },
  {
    id: 'sepia',
    name: 'Warm Parchment / Sepia',
    nameBn: 'আইনি পার্চমেন্ট (সেপিয়া)',
    category: 'Light',
    bgHex: '#FBF5E8',
    accentHex: '#D97706',
    dotColor: 'bg-[#F4E9D4] border-2 border-[#D4C3A3]',
    tagline: 'Vintage legal paper tone',
    description: 'Vintage deed & law treatise warm tone, reduces blue-light strain during marathon drafting',
    descriptionBn: 'পুরোনো দলিল ও বইয়ের উষ্ণ আভা, দীর্ঘ সময়ের ড্রাফটিংয়ে আরাম'
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    nameBn: 'মিডনাইট ডার্ক',
    category: 'Dark',
    bgHex: '#020617',
    accentHex: '#60A5FA',
    dotColor: 'bg-slate-950 border-2 border-slate-700',
    tagline: 'Midnight courtroom slate',
    description: 'Deep midnight slate with balanced contrast, soft on eyes during evening work',
    descriptionBn: 'গভীর কালো ও স্লেটের কম্বিনেশন, রাতের কাজের জন্য আদর্শ'
  },
  {
    id: 'navy',
    name: 'High Court Navy',
    nameBn: 'হাইকোর্ট নেভি ব্লু',
    category: 'Dark',
    bgHex: '#071326',
    accentHex: '#38BDF8',
    dotColor: 'bg-[#0A192F] border-2 border-[#1E3A8A]',
    tagline: 'Prestigious bar library navy',
    description: 'Prestigious bar association deep navy with gold and cyan contrast lines',
    descriptionBn: 'অভিজাত বার লাইব্রেরি ও হাইকোর্টের প্রফেশনাল ডিপ নেভি ব্লু'
  },
  {
    id: 'emerald',
    name: 'Land Revenue Emerald',
    nameBn: 'ভূমি রাজস্ব মরকত সবুজ',
    category: 'Dark',
    bgHex: '#022019',
    accentHex: '#34D399',
    dotColor: 'bg-[#032B22] border-2 border-[#059669]',
    tagline: 'BL&LRO forest revenue',
    description: 'Dedicated Land & Land Reforms record green theme with mint emerald highlights',
    descriptionBn: 'বিএলঅ্যান্ডএলআরও ও ভূমি রাজস্ব দপ্তরের ক্ল্যাসিক সবুজ থিম'
  },
  {
    id: 'charcoal',
    name: 'Obsidian OLED Noir',
    nameBn: 'অ্যাবসোলিউট ব্ল্যাক (OLED)',
    category: 'Dark',
    bgHex: '#000000',
    accentHex: '#F43F5E',
    dotColor: 'bg-black border-2 border-zinc-700',
    tagline: 'True black #000000',
    description: 'Absolute true pitch black for OLED/AMOLED screens with zero battery drain',
    descriptionBn: 'সম্পূর্ণ খাঁটি কালো ব্যাকগ্রাউন্ড ও সর্বোচ্চ ব্যাটারি সাশ্রয়'
  },
  {
    id: 'indigo',
    name: 'Chamber Royal Indigo',
    nameBn: 'রয়্যাল চেম্বার ইন্ডিগো',
    category: 'Dark',
    bgHex: '#0F0D26',
    accentHex: '#A78BFA',
    dotColor: 'bg-[#151238] border-2 border-[#6366F1]',
    tagline: 'Senior chamber purple/indigo',
    description: 'Senior counsel chamber indigo with rich royal violet and lavender accents',
    descriptionBn: 'অ্যাডভোকেট চেম্বারের রাজকীয় ইন্ডিগো আভা ও ভায়োলেট অ্যাকসেন্ট'
  }
];
