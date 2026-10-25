export type AppTheme = 'white' | 'light' | 'sepia' | 'azure' | 'mint';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  nameBn: string;
  category: 'Light';
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
    id: 'azure',
    name: 'Courtroom Azure',
    nameBn: 'কোর্টরুম এজুর ব্লু',
    category: 'Light',
    bgHex: '#F0F7FF',
    accentHex: '#0284C7',
    dotColor: 'bg-sky-100 border-2 border-sky-300',
    tagline: 'Fresh sky daylight tone',
    description: 'Crisp daylight sky-blue tint with deep oceanic accents for high-clarity document handling',
    descriptionBn: 'স্বচ্ছ আকাশী নীল আভা ও স্পষ্ট রিডিং কনট্রাস্ট'
  },
  {
    id: 'mint',
    name: 'Land Revenue Mint',
    nameBn: 'ভূমি রাজস্ব মিন্ট পেপার',
    category: 'Light',
    bgHex: '#F0FDF4',
    accentHex: '#059669',
    dotColor: 'bg-emerald-100 border-2 border-emerald-300',
    tagline: 'Pastel emerald paper',
    description: 'Soothing pastel land record parchment tint, ideal for survey map verification and Khatian entry',
    descriptionBn: 'চোখের জন্য স্নিগ্ধ হালকা সবুজ কাগজের আভা ও রাজস্ব রেকর্ড ফিল'
  }
];
