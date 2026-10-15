import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  Plus,
  Trash2,
  Printer,
  RefreshCw,
  Building,
  CheckCircle2,
  Scale,
  ArrowRightLeft,
  Info,
  ShieldCheck,
  Percent,
  Layers,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';

// ==========================================
// WEST BENGAL STATUTORY & REVENUE CONSTANTS
// ==========================================

// 1. Traditional Area in Sq. Ft.
export const WB_AREA_SQFT = {
  acre: 43560,
  satak: 435.6,
  decimal: 435.6,
  bigha: 14400, // 20 Katha = 14,400 Sq.Ft.
  katha: 720, // 16 Chittak = 720 Sq.Ft.
  chittak: 45, // 20 Ganda = 45 Sq.Ft.
  ganda: 2.25, // 4 Kara = 2.25 Sq.Ft.
  kara: 0.5625, // 3 Kranti = 0.5625 Sq.Ft.
  kranti: 0.1875, // 4 Pai = 0.1875 Sq.Ft.
  pai: 0.046875, // 1 Pai = 0.046875 Sq.Ft. (and 20 Til = 1 Kranti => 1 Til = 0.009375 Sq.Ft.)
  til: 0.009375,
  sqft: 1,
  hectare: 107639
};

export const UNIT_LABELS: Record<string, string> = {
  acre: 'Acre (একর - ১০০ শতক)',
  satak: 'Satak / Decimal (শতক / ডেসিমেল)',
  bigha: 'Bigha (বিঘা - ২০ কাঠা)',
  katha: 'Katha (কাঠা - ১৬ ছটাক)',
  chittak: 'Chittak (ছটাক - ২০ গণ্ডা)',
  sqft: 'Square Feet (বর্গফুট)'
};

// ==========================================
// MATHEMATICAL HELPER FUNCTIONS (WEST BENGAL)
// ==========================================

/**
 * Converts 16-Ana traditional share (আনা, গণ্ডা, কড়া, ক্রান্তি, পাই, তিল) to a fractional proportion (0 to 1.0)
 * 16 Ana = 1.000000 (Full Property / 10000 Share)
 */
export function wbShareToFraction(
  ana: number = 0,
  ganda: number = 0,
  kara: number = 0,
  kranti: number = 0,
  pai: number = 0,
  til: number = 0
): number {
  return (
    (ana || 0) * (1 / 16) +
    (ganda || 0) * (1 / 320) +
    (kara || 0) * (1 / 1280) +
    (kranti || 0) * (1 / 3840) +
    (pai || 0) * (1 / 15360) +
    (til || 0) * (1 / 76800)
  );
}

/**
 * Converts a fractional proportion (0.0 to 1.0) into West Bengal Ana-Ganda-Kara-Kranti-Pai representation
 */
export function fractionToWbShare(frac: number): {
  ana: number;
  ganda: number;
  kara: number;
  kranti: number;
  pai: number;
  til: number;
  formatted: string;
} {
  if (frac <= 0.00000001) {
    return { ana: 0, ganda: 0, kara: 0, kranti: 0, pai: 0, til: 0, formatted: '০ আনা ০ গণ্ডা' };
  }

  // Guard against float precision issues near 1
  const f = Math.min(1, Math.max(0, frac)) + 1e-9;

  const totalAna = f * 16;
  const ana = Math.floor(totalAna);
  let rem = totalAna - ana;

  const totalGanda = rem * 20;
  const ganda = Math.floor(totalGanda);
  rem = totalGanda - ganda;

  const totalKara = rem * 4;
  const kara = Math.floor(totalKara);
  rem = totalKara - kara;

  const totalKranti = rem * 3;
  const kranti = Math.floor(totalKranti);
  rem = totalKranti - kranti;

  const totalPai = rem * 4;
  const pai = Math.floor(totalPai);
  rem = totalPai - pai;

  const til = Math.min(19, Math.round(rem * 5));

  const parts: string[] = [];
  if (ana > 0) parts.push(`${ana} আনা`);
  if (ganda > 0) parts.push(`${ganda} গণ্ডা`);
  if (kara > 0) parts.push(`${kara} কড়া`);
  if (kranti > 0) parts.push(`${kranti} ক্রান্তি`);
  if (pai > 0) parts.push(`${pai} পাই`);
  if (til > 0 && parts.length < 3) parts.push(`${til} তিল`);

  const formatted = parts.length > 0 ? parts.join(' ') : '০ আনা';

  return { ana, ganda, kara, kranti, pai, til, formatted };
}

/**
 * Converts traditional West Bengal land units into total square feet
 */
export function wbAreaToSqft(params: {
  bigha?: number;
  katha?: number;
  chittak?: number;
  ganda?: number;
  kara?: number;
  kranti?: number;
  pai?: number;
  sqft?: number;
  satak?: number;
}): number {
  return (
    (params.bigha || 0) * WB_AREA_SQFT.bigha +
    (params.katha || 0) * WB_AREA_SQFT.katha +
    (params.chittak || 0) * WB_AREA_SQFT.chittak +
    (params.ganda || 0) * WB_AREA_SQFT.ganda +
    (params.kara || 0) * WB_AREA_SQFT.kara +
    (params.kranti || 0) * WB_AREA_SQFT.kranti +
    (params.pai || 0) * WB_AREA_SQFT.pai +
    (params.satak || 0) * WB_AREA_SQFT.satak +
    (params.sqft || 0)
  );
}

/**
 * Converts total square feet into complete breakdown of West Bengal units
 * (Bigha, Katha, Chittak, Ganda, Kara, Kranti, Pai, Satak)
 */
export function sqftToWbArea(totalSqft: number): {
  bigha: number;
  katha: number;
  chittak: number;
  ganda: number;
  kara: number;
  kranti: number;
  pai: number;
  satak: number;
  formatted: string;
  formattedShort: string;
} {
  if (totalSqft <= 0.001) {
    return {
      bigha: 0,
      katha: 0,
      chittak: 0,
      ganda: 0,
      kara: 0,
      kranti: 0,
      pai: 0,
      satak: 0,
      formatted: '০ কাঠা ০ ছটাক',
      formattedShort: '০ কাঠা'
    };
  }

  const satak = totalSqft / WB_AREA_SQFT.satak;

  let rem = totalSqft + 1e-7;
  const bigha = Math.floor(rem / WB_AREA_SQFT.bigha);
  rem = rem % WB_AREA_SQFT.bigha;

  const katha = Math.floor(rem / WB_AREA_SQFT.katha);
  rem = rem % WB_AREA_SQFT.katha;

  const chittak = Math.floor(rem / WB_AREA_SQFT.chittak);
  rem = rem % WB_AREA_SQFT.chittak;

  const ganda = Math.floor(rem / WB_AREA_SQFT.ganda);
  rem = rem % WB_AREA_SQFT.ganda;

  const kara = Math.floor(rem / WB_AREA_SQFT.kara);
  rem = rem % WB_AREA_SQFT.kara;

  const kranti = Math.floor(rem / WB_AREA_SQFT.kranti);
  rem = rem % WB_AREA_SQFT.kranti;

  const pai = Math.round(rem / WB_AREA_SQFT.pai);

  const parts: string[] = [];
  if (bigha > 0) parts.push(`${bigha} বিঘা`);
  if (katha > 0) parts.push(`${katha} কাঠা`);
  if (chittak > 0) parts.push(`${chittak} ছটাক`);
  if (ganda > 0) parts.push(`${ganda} গণ্ডা`);
  if (kara > 0) parts.push(`${kara} কড়া`);
  if (kranti > 0) parts.push(`${kranti} ক্রান্তি`);
  if (pai > 0) parts.push(`${pai} পাই`);

  const formatted = parts.length > 0 ? parts.join(' ') : `${(totalSqft).toFixed(1)} বর্গফুট`;

  // Short label for badges
  const shortParts: string[] = [];
  if (bigha > 0) shortParts.push(`${bigha} বি.`);
  if (katha > 0 || bigha > 0) shortParts.push(`${katha} কা.`);
  if (chittak > 0) shortParts.push(`${chittak} ছ.`);
  if (ganda > 0) shortParts.push(`${ganda} গ.`);
  const formattedShort = shortParts.length > 0 ? shortParts.join(' ') : `${katha} কা. ${chittak} ছ.`;

  return {
    bigha,
    katha,
    chittak,
    ganda,
    kara,
    kranti,
    pai,
    satak,
    formatted,
    formattedShort
  };
}

// ==========================================
// COMPONENT INTERFACES
// ==========================================

export interface WbCoSharerPortion {
  id: string;
  label: string;
  mode: 'area' | 'share'; // Land area vs 16-Ana share

  // Land Area inputs (জমির পরিমাণ হিসেবে ইনপুট)
  bigha: number;
  katha: number;
  chittak: number;
  gandaArea: number;
  karaArea: number;
  krantiArea: number;
  paiArea: number;
  satak: number;
  sqft: number;

  // Share inputs (১৬ আনা হিস্যা হিসেবে ইনপুট)
  ana: number;
  gandaShare: number;
  karaShare: number;
  krantiShare: number;
  paiShare: number;
  share10000Input?: number; // Direct 10,000 share entry if desired
}

export const ShareCalculator: React.FC = () => {
  const { activeCompany, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'share' | 'converter' | 'farayez'>('share');

  // =========================================================
  // TAB 1: 10000 SHARE & 16-ANA WEST BENGAL PORTION CALCULATOR
  // =========================================================
  const [totalArea, setTotalArea] = useState<string>('1');
  const [totalUnit, setTotalUnit] = useState<string>('bigha');

  // Co-sharers portions
  const [portions, setPortions] = useState<WbCoSharerPortion[]>([
    {
      id: 'p_1',
      label: 'Co-Sharer A (অংশীদার ১)',
      mode: 'share',
      bigha: 0,
      katha: 0,
      chittak: 0,
      gandaArea: 0,
      karaArea: 0,
      krantiArea: 0,
      paiArea: 0,
      satak: 0,
      sqft: 0,
      ana: 8,
      gandaShare: 0,
      karaShare: 0,
      krantiShare: 0,
      paiShare: 0
    },
    {
      id: 'p_2',
      label: 'Co-Sharer B (অংশীদার ২)',
      mode: 'area',
      bigha: 0,
      katha: 10,
      chittak: 0,
      gandaArea: 0,
      karaArea: 0,
      krantiArea: 0,
      paiArea: 0,
      satak: 0,
      sqft: 0,
      ana: 0,
      gandaShare: 0,
      karaShare: 0,
      krantiShare: 0,
      paiShare: 0
    }
  ]);

  const [shareResult, setShareResult] = useState<any>(null);

  // Add new portion
  const addPortion = () => {
    setPortions(prev => [
      ...prev,
      {
        id: 'p_' + Date.now(),
        label: `Co-Sharer ${String.fromCharCode(65 + prev.length)}`,
        mode: 'area',
        bigha: 0,
        katha: 0,
        chittak: 0,
        gandaArea: 0,
        karaArea: 0,
        krantiArea: 0,
        paiArea: 0,
        satak: 0,
        sqft: 0,
        ana: 0,
        gandaShare: 0,
        karaShare: 0,
        krantiShare: 0,
        paiShare: 0
      }
    ]);
  };

  const removePortion = (idx: number) => {
    setPortions(prev => prev.filter((_, i) => i !== idx));
  };

  const updatePortion = (idx: number, field: keyof WbCoSharerPortion, val: any) => {
    setPortions(prev =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    );
  };

  // Perform West Bengal 10000-Share & Traditional Unit Calculation
  const calculateWbShare = () => {
    const totalVal = parseFloat(totalArea) || 0;
    if (totalVal <= 0) {
      showToast('Enter valid total land area (মোট জমির পরিমাণ লিখুন)', 'error');
      return;
    }
    if (portions.length === 0) {
      showToast('Add at least one co-sharer portion', 'error');
      return;
    }

    const totalSqft = totalVal * (WB_AREA_SQFT[totalUnit as keyof typeof WB_AREA_SQFT] || WB_AREA_SQFT.bigha);
    const totalWbBreakdown = sqftToWbArea(totalSqft);

    let sumPortionsSqft = 0;
    let sumShare10000 = 0;
    let sumFraction = 0;

    const computedPortions = portions.map(p => {
      let portionSqft = 0;
      let portionFraction = 0;

      if (p.mode === 'share') {
        // Calculate based on Ana, Ganda, Kara, Kranti, Pai
        if (p.share10000Input && p.share10000Input > 0) {
          portionFraction = p.share10000Input / 10000;
        } else {
          portionFraction = wbShareToFraction(
            p.ana,
            p.gandaShare,
            p.karaShare,
            p.krantiShare,
            p.paiShare
          );
        }
        portionSqft = portionFraction * totalSqft;
      } else {
        // Calculate based on West Bengal Land Area: Katha, Chittak, Ganda, Kara, Kranti, Pai, Bigha, Satak, Sqft
        portionSqft = wbAreaToSqft({
          bigha: p.bigha,
          katha: p.katha,
          chittak: p.chittak,
          ganda: p.gandaArea,
          kara: p.karaArea,
          kranti: p.krantiArea,
          pai: p.paiArea,
          satak: p.satak,
          sqft: p.sqft
        });
        portionFraction = totalSqft > 0 ? portionSqft / totalSqft : 0;
      }

      sumPortionsSqft += portionSqft;
      sumFraction += portionFraction;
      const share10000 = portionFraction * 10000;
      sumShare10000 += share10000;
      const pct = portionFraction * 100;

      const wbShareBreakdown = fractionToWbShare(portionFraction);
      const wbAreaBreakdown = sqftToWbArea(portionSqft);

      return {
        ...p,
        computedSqft: portionSqft,
        portionFraction,
        share10000,
        pct,
        wbShareBreakdown,
        wbAreaBreakdown
      };
    });

    const residualSqft = Math.max(0, totalSqft - sumPortionsSqft);
    const residualFraction = totalSqft > 0 ? residualSqft / totalSqft : 0;
    const residualShare = residualFraction * 10000;
    const residualPct = residualFraction * 100;
    const residualWbShare = fractionToWbShare(residualFraction);
    const residualWbArea = sqftToWbArea(residualSqft);

    // Sum WB Share
    const totalWbShare = fractionToWbShare(sumFraction);

    setShareResult({
      totalVal,
      totalUnit,
      totalSqft,
      totalWbBreakdown,
      computedPortions,
      sumPortionsSqft,
      sumShare10000,
      sumFraction,
      totalWbShare,
      residualSqft,
      residualShare,
      residualPct,
      residualWbShare,
      residualWbArea,
      isBalanced: Math.abs(sumShare10000 - 10000) < 0.05
    });

    showToast('West Bengal 10000-Share & Ana/Ganda calculation completed');
  };

  // =========================================================
  // TAB 2: LIVE UNIT CONVERTER STATE (WEST BENGAL)
  // =========================================================
  const [convKatha, setConvKatha] = useState<number>(1);
  const [convChittak, setConvChittak] = useState<number>(0);
  const [convGanda, setConvGanda] = useState<number>(0);
  const [convKara, setConvKara] = useState<number>(0);
  const [convKranti, setConvKranti] = useState<number>(0);
  const [convPai, setConvPai] = useState<number>(0);

  const convTotalSqft = useMemo(() => {
    return wbAreaToSqft({
      katha: convKatha,
      chittak: convChittak,
      ganda: convGanda,
      kara: convKara,
      kranti: convKranti,
      pai: convPai
    });
  }, [convKatha, convChittak, convGanda, convKara, convKranti, convPai]);

  const convWbArea = useMemo(() => {
    return sqftToWbArea(convTotalSqft);
  }, [convTotalSqft]);

  // Converter for 16-Ana Share to 10000 Share
  const [convAna, setConvAna] = useState<number>(4);
  const [convGandaShare, setConvGandaShare] = useState<number>(0);
  const [convKaraShare, setConvKaraShare] = useState<number>(0);
  const [convKrantiShare, setConvKrantiShare] = useState<number>(0);
  const [convPaiShare, setConvPaiShare] = useState<number>(0);

  const convShareFraction = useMemo(() => {
    return wbShareToFraction(convAna, convGandaShare, convKaraShare, convKrantiShare, convPaiShare);
  }, [convAna, convGandaShare, convKaraShare, convKrantiShare, convPaiShare]);

  const convShare10000 = convShareFraction * 10000;
  const convSharePct = convShareFraction * 100;

  // =========================================================
  // TAB 3: MUSLIM FARAYEZ STATE (WITH WB UNITS & 16-ANA)
  // =========================================================
  const [farayezTotal, setFarayezTotal] = useState<string>('1');
  const [farayezUnit, setFarayezUnit] = useState<string>('Bigha');
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
  const [husbandCount, setHusbandCount] = useState<number>(0);
  const [wifeCount, setWifeCount] = useState<number>(1);
  const [sonsCount, setSonsCount] = useState<number>(2);
  const [daughtersCount, setDaughtersCount] = useState<number>(1);
  const [fatherAlive, setFatherAlive] = useState<boolean>(false);
  const [motherAlive, setMotherAlive] = useState<boolean>(true);
  const [farayezResult, setFarayezResult] = useState<any[] | null>(null);

  // Farayez calculation
  const calculateFarayez = () => {
    const totalVal = parseFloat(farayezTotal) || 0;
    if (totalVal <= 0) {
      showToast('Enter total property value or land quantity', 'error');
      return;
    }

    const hasChildren = sonsCount > 0 || daughtersCount > 0;
    let shares: any[] = [];
    let totalFixedFraction = 0;

    // 1. Spousal share
    if (deceasedGender === 'female' && husbandCount > 0) {
      const hFrac = hasChildren ? { num: 1, den: 4, label: '১/৪ (1/4)' } : { num: 1, den: 2, label: '১/২ (1/2)' };
      const fracVal = hFrac.num / hFrac.den;
      totalFixedFraction += fracVal;
      shares.push({
        heir: 'Husband (স্বামী)',
        count: 1,
        fraction: hFrac.label,
        fracVal,
        num: hFrac.num,
        den: hFrac.den,
        shareVal: totalVal * fracVal,
        totalVal: totalVal * fracVal
      });
    } else if (deceasedGender === 'male' && wifeCount > 0) {
      const wFrac = hasChildren ? { num: 1, den: 8, label: '১/৮ (1/8)' } : { num: 1, den: 4, label: '১/৪ (1/4)' };
      const fracVal = wFrac.num / wFrac.den;
      totalFixedFraction += fracVal;
      const totalWifeAmt = totalVal * fracVal;
      shares.push({
        heir: `Wife (স্ত্রী) ${wifeCount > 1 ? `[${wifeCount} জন স্ত্রী]` : ''}`,
        count: wifeCount,
        fraction: `${wFrac.label} মোট`,
        fracVal,
        num: wFrac.num,
        den: wFrac.den * wifeCount,
        shareVal: totalWifeAmt / wifeCount,
        totalVal: totalWifeAmt
      });
    }

    // 2. Mother's share
    if (motherAlive) {
      const mFrac = hasChildren ? { num: 1, den: 6, label: '১/৬ (1/6)' } : { num: 1, den: 3, label: '১/৩ (1/3)' };
      const fracVal = mFrac.num / mFrac.den;
      totalFixedFraction += fracVal;
      shares.push({
        heir: 'Mother (মাতা)',
        count: 1,
        fraction: mFrac.label,
        fracVal,
        num: mFrac.num,
        den: mFrac.den,
        shareVal: totalVal * fracVal,
        totalVal: totalVal * fracVal
      });
    }

    // 3. Father's share
    if (fatherAlive) {
      if (hasChildren) {
        const fFrac = { num: 1, den: 6, label: '১/৬ (1/6)' };
        totalFixedFraction += 1 / 6;
        shares.push({
          heir: 'Father (পিতা - নির্ধারিত অংশ)',
          count: 1,
          fraction: fFrac.label,
          fracVal: 1 / 6,
          num: fFrac.num,
          den: fFrac.den,
          shareVal: totalVal * (1 / 6),
          totalVal: totalVal * (1 / 6)
        });
      }
    }

    // 4. Children / Residuaries (Asaba)
    const residue = Math.max(0, 1 - totalFixedFraction);

    if (sonsCount > 0) {
      const totalParts = sonsCount * 2 + daughtersCount * 1;
      const partVal = (residue * totalVal) / totalParts;
      const sonFrac = (residue * 2) / totalParts;

      shares.push({
        heir: `Son (পুত্র) ${sonsCount > 1 ? `[${sonsCount} জন পুত্র]` : ''}`,
        count: sonsCount,
        fraction: `অবশিষ্ট (প্রতি পুত্রের ২ অংশ)`,
        fracVal: sonFrac,
        num: 2,
        den: totalParts,
        shareVal: partVal * 2,
        totalVal: partVal * 2 * sonsCount
      });

      if (daughtersCount > 0) {
        const dFrac = residue / totalParts;
        shares.push({
          heir: `Daughter (কন্যা) ${daughtersCount > 1 ? `[${daughtersCount} জন কন্যা]` : ''}`,
          count: daughtersCount,
          fraction: `অবশিষ্ট (প্রতি কন্যার ১ অংশ)`,
          fracVal: dFrac,
          num: 1,
          den: totalParts,
          shareVal: partVal * 1,
          totalVal: partVal * 1 * daughtersCount
        });
      }
    } else if (daughtersCount > 0) {
      const dFrac = daughtersCount === 1 ? { num: 1, den: 2, label: '১/২ (1/2)' } : { num: 2, den: 3, label: '২/৩ (2/3)' };
      const fracVal = dFrac.num / dFrac.den;
      const totalDaughterAmt = totalVal * fracVal;
      shares.push({
        heir: `Daughter (কন্যা) [${daughtersCount} জন]`,
        count: daughtersCount,
        fraction: `${dFrac.label} বণ্টিত`,
        fracVal: fracVal / daughtersCount,
        num: dFrac.num,
        den: dFrac.den * daughtersCount,
        shareVal: totalDaughterAmt / daughtersCount,
        totalVal: totalDaughterAmt
      });

      if (fatherAlive) {
        const fResidue = Math.max(0, 1 - (totalFixedFraction + fracVal));
        if (fResidue > 0) {
          shares.push({
            heir: 'Father as Residuary (আসাবা হিসেবে পিতা)',
            count: 1,
            fraction: `অবশিষ্ট (${(fResidue * 100).toFixed(1)}%)`,
            fracVal: fResidue,
            num: 0,
            den: 0,
            shareVal: totalVal * fResidue,
            totalVal: totalVal * fResidue
          });
        }
      }
    } else if (fatherAlive && residue > 0) {
      shares.push({
        heir: 'Father as Sole Residuary (আসাবা হিসেবে পিতা)',
        count: 1,
        fraction: `সমগ্র অবশিষ্ট (${(residue * 100).toFixed(1)}%)`,
        fracVal: residue,
        num: 0,
        den: 0,
        shareVal: totalVal * residue,
        totalVal: totalVal * residue
      });
    }

    // Enrich each heir share with West Bengal 16-Ana and 10,000 Share
    const enrichedShares = shares.map(s => {
      const share10000 = (s.fracVal || 0) * 10000;
      const wbShare = fractionToWbShare(s.fracVal || 0);

      // If land unit, also calculate Katha/Chittak
      let landDisplay = '';
      if (['Bigha', 'Katha', 'Acre', 'Satak'].includes(farayezUnit)) {
        let sqft = 0;
        if (farayezUnit === 'Bigha') sqft = s.shareVal * WB_AREA_SQFT.bigha;
        else if (farayezUnit === 'Katha') sqft = s.shareVal * WB_AREA_SQFT.katha;
        else if (farayezUnit === 'Acre') sqft = s.shareVal * WB_AREA_SQFT.acre;
        else if (farayezUnit === 'Satak') sqft = s.shareVal * WB_AREA_SQFT.satak;
        const wbArea = sqftToWbArea(sqft);
        landDisplay = wbArea.formatted;
      }

      return {
        ...s,
        share10000,
        wbShare,
        landDisplay
      };
    });

    setFarayezResult(enrichedShares);
    showToast('Islamic Farayez calculated with West Bengal 16-Ana & 10000 shares');
  };

  // =========================================================
  // PRINT CERTIFICATES (WEST BENGAL REVENUE STANDARD)
  // =========================================================
  const printShareReport = () => {
    const printWin = window.open('', '_blank');
    if (!printWin || !shareResult) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>West Bengal 10000 Share & 16-Ana Land Distribution Report</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 36px; color: #111; line-height: 1.5; }
            h2, h3 { margin: 0 0 4px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 10px 0 14px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
            th, td { border: 1px solid #777; padding: 7px 8px; text-align: left; }
            th { background: #E2E8F0; font-weight: bold; }
            .mono { font-family: 'Courier New', monospace; font-size: 11px; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'SRK Legal Chamber'}</h2>
            <div><strong>পশ্চিমবঙ্গ ভূমি ও রাজস্ব আদালত স্বীকৃত হিস্যা বণ্টন ও ১০,০০০ অংশ হিসাব বিবরণী</strong></div>
            <div style="font-size: 12px; color: #555;">WB Land Share Apportionment Report (16-Ana & 10000 Share Certificate)</div>
            <div style="font-size: 11px; color: #777; margin-top: 4px;">তারিখ: ${new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <hr />
          <div style="font-size: 13px; margin-bottom: 8px;">
            <strong>মোট ভূমির পরিমাণ:</strong> ${shareResult.totalVal} ${UNIT_LABELS[shareResult.totalUnit]} = <strong>${shareResult.totalWbBreakdown.formatted}</strong> (${shareResult.totalSqft.toLocaleString('en-IN', { maximumFractionDigits: 2 })} বর্গফুট / ${shareResult.totalWbBreakdown.satak.toFixed(3)} শতক)
          </div>
          <table>
            <thead>
              <tr>
                <th>অংশীদার / দাগ খতিয়ান</th>
                <th>১৬ আনা হিস্যা (আনা-গণ্ডা-কড়া-ক্রান্তি-পাই)</th>
                <th>১০,০০০ অংশ (LR Parcha)</th>
                <th>বন্টিত জমি (কাঠা-ছটাক-গণ্ডা-কড়া-ক্রান্তি-পাই)</th>
                <th>শতক</th>
                <th>বর্গফুট</th>
                <th>শতাংশ (%)</th>
              </tr>
            </thead>
            <tbody>
              ${shareResult.computedPortions
                .map(
                  (p: any) => `<tr>
                <td><strong>${p.label}</strong></td>
                <td style="color: #4338CA; font-weight: bold;">${p.wbShareBreakdown.formatted}</td>
                <td class="mono" style="font-weight: bold; color: #1E3A8A;">${p.share10000.toFixed(2)}</td>
                <td><strong>${p.wbAreaBreakdown.formatted}</strong></td>
                <td class="mono">${p.wbAreaBreakdown.satak.toFixed(3)}</td>
                <td class="mono">${p.computedSqft.toFixed(2)}</td>
                <td class="mono">${p.pct.toFixed(3)}%</td>
              </tr>`
                )
                .join('')}
              <tr style="background: #F8FAFC; font-weight: bold;">
                <td>মোট বণ্টন (Total Distributed)</td>
                <td style="color: #047857;">${shareResult.totalWbShare.formatted}</td>
                <td class="mono" style="color: #047857;">${shareResult.sumShare10000.toFixed(2)}</td>
                <td>${sqftToWbArea(shareResult.sumPortionsSqft).formatted}</td>
                <td class="mono">${(shareResult.sumPortionsSqft / 435.6).toFixed(3)}</td>
                <td class="mono">${shareResult.sumPortionsSqft.toFixed(2)}</td>
                <td class="mono">${((shareResult.sumPortionsSqft / shareResult.totalSqft) * 100).toFixed(3)}%</td>
              </tr>
              <tr style="background: #FEF3C7; font-weight: bold;">
                <td style="color: #92400E;">অবশিষ্ট জমি ও হিস্যা (Residual)</td>
                <td style="color: #92400E;">${shareResult.residualWbShare.formatted}</td>
                <td class="mono" style="color: #92400E;">${shareResult.residualShare.toFixed(2)}</td>
                <td style="color: #92400E;">${shareResult.residualWbArea.formatted}</td>
                <td class="mono">${shareResult.residualWbArea.satak.toFixed(3)}</td>
                <td class="mono">${shareResult.residualSqft.toFixed(2)}</td>
                <td class="mono">${shareResult.residualPct.toFixed(3)}%</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 36px; display: flex; justify-content: space-between; font-size: 11px;">
            <div>West Bengal Land Reform & Tenancy Standards · কাঠা, ছটাক, কড়া, ক্রান্তি, পাই, আনা, গণ্ডা হিস্যা</div>
            <div>আইনজীবী / মুহুরী স্বাক্ষর: _________________________</div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  const printFarayezReport = () => {
    const printWin = window.open('', '_blank');
    if (!printWin || !farayezResult) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Muslim Farayez Inheritance Certificate - West Bengal</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 36px; color: #111; line-height: 1.5; }
            h2, h3 { margin: 0 0 4px 0; color: #047857; }
            hr { border: none; border-top: 1.5px solid #047857; margin: 10px 0 14px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
            th, td { border: 1px solid #777; padding: 7px 8px; text-align: left; }
            th { background: #D1FAE5; font-weight: bold; }
            .mono { font-family: 'Courier New', monospace; font-size: 11px; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'SRK Legal Chamber'}</h2>
            <div><strong>সুন্নি হানাফি আইন অনুসারে মুসলিম ফারায়েজ বণ্টন সনদপত্র</strong></div>
            <div style="font-size: 12px; color: #555;">Hanafi Sunni Inheritance Distribution (16-Ana & WB Land Units)</div>
            <div style="font-size: 11px; color: #777;">সম্পত্তির পরিমাণ: ${parseFloat(farayezTotal).toLocaleString('en-IN')} ${farayezUnit} | মৃত ব্যক্তি: ${deceasedGender === 'male' ? 'পুরুষ (মরহুম)' : 'নারী (মরহুমা)'}</div>
          </div>
          <hr />
          <table>
            <thead>
              <tr>
                <th>ওয়ারিশান (Legal Heir)</th>
                <th>কোরআনিক অংশ (Fraction)</th>
                <th>১৬ আনা হিস্যা</th>
                <th>১০,০০০ অংশ</th>
                <th>বন্টিত পরিমাণ (প্রতি ওয়ারিশ)</th>
                <th>জমির হিস্যা (কাঠা-ছটাক)</th>
              </tr>
            </thead>
            <tbody>
              ${farayezResult
                .map(
                  r => `<tr>
                <td><strong>${r.heir}</strong></td>
                <td class="mono">${r.fraction}</td>
                <td style="color: #047857; font-weight: bold;">${r.wbShare.formatted}</td>
                <td class="mono" style="font-weight: bold;">${r.share10000.toFixed(2)}</td>
                <td class="mono"><strong>${r.shareVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${farayezUnit}</strong></td>
                <td>${r.landDisplay || '—'}</td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="margin-top: 36px; text-align: right; font-size: 11px;">
            Certified under Sunni Hanafi Jurisprudence · SRK Case Manager
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header and Mode Toggle */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <span>West Bengal Land Share & Partition Calculator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            পশ্চিমবঙ্গ ভূমি সংস্কার আইন ও রাজস্ব আদালত মানদণ্ড: কাঠা, ছটাক, কড়া, ক্রান্তি, পাই, আনা, গণ্ডা ও ১০,০০০ অংশ হিস্যা বণ্টন।
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'share'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>10000 & 16-Ana Share</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'converter'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>WB Unit Converter</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('farayez')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'farayez'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Muslim Farayez</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: 10000 SHARE & 16-ANA CALCULATOR */}
      {/* ========================================================= */}
      {activeTab === 'share' && (
        <div className="space-y-6">
          {/* Card 1: Total Land */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>1. Total Land Area (সম্পূর্ণ জোত / দাগের মোট জমি)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                16-Ana (১৬ আনা) = 1.000000 = 10,000 Share
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Total Land Quantity (মোট ভূমির পরিমাণ) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={totalArea}
                  onChange={e => setTotalArea(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Land Measurement Unit (একক) *
                </label>
                <select
                  value={totalUnit}
                  onChange={e => setTotalUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="bigha">Bigha (১ বিঘা = ২০ কাঠা = ১৪,৪০০ বর্গফুট)</option>
                  <option value="katha">Katha (১ কাঠা = ১৬ ছটাক = ৭২০ বর্গফুট)</option>
                  <option value="satak">Satak / Decimal (১ শতক = ৪৩৫.৬ বর্গফুট)</option>
                  <option value="acre">Acre (১ একর = ১০০ শতক = ৪৩,৫৬০ বর্গফুট)</option>
                  <option value="chittak">Chittak (১ ছটাক = ২০ গণ্ডা = ৪৫ বর্গফুট)</option>
                  <option value="sqft">Square Feet (বর্গফুট)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Co-Sharers Portions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  2. Co-Sharer Apportionment (অংশীদারদের অংশ ও হিস্যা)
                </span>
                <span className="text-[11px] text-slate-400 ml-2">
                  (Support for Katha, Chittak, Ganda, Kara, Kranti, Pai &amp; Ana)
                </span>
              </div>
              <button
                type="button"
                onClick={addPortion}
                className="self-start sm:self-auto px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Co-Sharer (অংশীদার যোগ করুন)
              </button>
            </div>

            <div className="space-y-4">
              {portions.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={p.label}
                        onChange={e => updatePortion(idx, 'label', e.target.value)}
                        placeholder="Co-sharer name or deed partition reference"
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 w-64 sm:w-80"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Mode toggle: Land Area vs 16-Ana Share */}
                      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => updatePortion(idx, 'mode', 'area')}
                          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors ${
                            p.mode === 'area'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Land Area (কাঠা/ছটাক)
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePortion(idx, 'mode', 'share')}
                          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors ${
                            p.mode === 'share'
                              ? 'bg-purple-600 text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          16-Ana Share (আনা/গণ্ডা)
                        </button>
                      </div>

                      {portions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePortion(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                          title="Remove Portion"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* MODE 1: LAND AREA INPUT (Katha, Chittak, Ganda, Kara, Kranti, Pai) */}
                  {p.mode === 'area' ? (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        West Bengal Land Area Units (কাঠা, ছটাক, গণ্ডা, কড়া, ক্রান্তি, পাই ও শতক):
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Katha (কাঠা)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={p.katha || ''}
                            onChange={e => updatePortion(idx, 'katha', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Chittak (ছটাক)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={p.chittak || ''}
                            onChange={e => updatePortion(idx, 'chittak', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Ganda (গণ্ডা)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="19"
                            value={p.gandaArea || ''}
                            onChange={e => updatePortion(idx, 'gandaArea', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Kara (কড়া)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="3"
                            value={p.karaArea || ''}
                            onChange={e => updatePortion(idx, 'karaArea', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Kranti (ক্রান্তি)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            value={p.krantiArea || ''}
                            onChange={e => updatePortion(idx, 'krantiArea', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Pai (পাই)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="3"
                            value={p.paiArea || ''}
                            onChange={e => updatePortion(idx, 'paiArea', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div className="col-span-3 sm:col-span-1">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            or Satak (শতক)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={p.satak || ''}
                            onChange={e => updatePortion(idx, 'satak', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* MODE 2: 16-ANA SHARE INPUT (Ana, Ganda, Kara, Kranti, Pai) */
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5">
                        Traditional 16-Ana Share (আনা, গণ্ডা, কড়া, ক্রান্তি, পাই হিস্যা):
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Ana (আনা) [০-১৬]
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="16"
                            value={p.ana || ''}
                            onChange={e => updatePortion(idx, 'ana', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-purple-700 dark:text-purple-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Ganda (গণ্ডা) [০-১৯]
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="19"
                            value={p.gandaShare || ''}
                            onChange={e => updatePortion(idx, 'gandaShare', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Kara (কড়া) [০-৩]
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="3"
                            value={p.karaShare || ''}
                            onChange={e => updatePortion(idx, 'karaShare', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Kranti (ক্রান্তি) [০-২]
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            value={p.krantiShare || ''}
                            onChange={e => updatePortion(idx, 'krantiShare', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Pai (পাই) [০-৩]
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="3"
                            value={p.paiShare || ''}
                            onChange={e => updatePortion(idx, 'paiShare', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            or 10,000 Share
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={p.share10000Input || ''}
                            onChange={e => updatePortion(idx, 'share10000Input', parseFloat(e.target.value) || 0)}
                            placeholder="e.g. 5000"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={calculateWbShare}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <Calculator className="w-4 h-4" /> Calculate 10000-Share &amp; 16-Ana Partition (হিস্যা ও জমির অংশ গণনা করুন)
              </button>
            </div>
          </div>

          {/* Results Table */}
          {shareResult && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${shareResult.isBalanced ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Calculation Results (পশ্চিমবঙ্গ হিস্যা ও অংশ বণ্টন তালিকা)
                  </span>
                  {shareResult.isBalanced ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Exact 16-Ana (সম্পূর্ণ বণ্টন)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Remaining Land Exists (অবশিষ্ট জমি আছে)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={printShareReport}
                  className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Print West Bengal Certificate</span>
                </button>
              </div>

              {/* Total Property Banner */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-blue-900 dark:text-blue-200">মোট ভূমির পরিমাণ: </span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                    {shareResult.totalWbBreakdown.formatted}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-blue-800 dark:text-blue-300">
                  <span>{shareResult.totalWbBreakdown.satak.toFixed(3)} শতক</span>
                  <span>·</span>
                  <span>{shareResult.totalSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Sq.Ft.</span>
                  <span>·</span>
                  <span className="font-bold">১৬ আনা (১০,০০০ অংশ)</span>
                </div>
              </div>

              {/* Responsive Apportionment Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Co-Sharer (অংশীদার)</th>
                      <th className="py-2.5 px-3">১৬ আনা হিস্যা (আনা-গণ্ডা-কড়া-ক্রান্তি-পাই)</th>
                      <th className="py-2.5 px-3">১০,০০০ অংশ (LR Format)</th>
                      <th className="py-2.5 px-3">বন্টিত জমি (কাঠা-ছটাক-গণ্ডা-কড়া-ক্রান্তি)</th>
                      <th className="py-2.5 px-3">শতক / Satak</th>
                      <th className="py-2.5 px-3 text-right">বর্গফুট / Sq.Ft.</th>
                      <th className="py-2.5 px-3 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {shareResult.computedPortions.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {p.label}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-purple-700 dark:text-purple-300">
                          {p.wbShareBreakdown.formatted}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">
                          {p.share10000.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                          {p.wbAreaBreakdown.formatted}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {p.wbAreaBreakdown.satak.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right text-slate-700 dark:text-slate-300">
                          {p.computedSqft.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-right text-slate-600 dark:text-slate-400">
                          {p.pct.toFixed(3)}%
                        </td>
                      </tr>
                    ))}

                    {/* Total Distributed Row */}
                    <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                      <td className="py-2.5 px-3 text-slate-900 dark:text-slate-100">
                        মোট বণ্টিত অংশ (Total Distributed)
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">
                        {shareResult.totalWbShare.formatted}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                        {shareResult.sumShare10000.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 dark:text-slate-100">
                        {sqftToWbArea(shareResult.sumPortionsSqft).formatted}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {(shareResult.sumPortionsSqft / 435.6).toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right">
                        {shareResult.sumPortionsSqft.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right">
                        {((shareResult.sumPortionsSqft / shareResult.totalSqft) * 100).toFixed(3)}%
                      </td>
                    </tr>

                    {/* Residual Undivided Row */}
                    {shareResult.residualSqft > 0.05 && (
                      <tr className="bg-amber-50/70 dark:bg-amber-950/30 font-semibold border-t border-amber-200 dark:border-amber-800/60">
                        <td className="py-2.5 px-3 text-amber-900 dark:text-amber-200">
                          অবশিষ্ট অবণ্টিত জমি (Undivided Residual)
                        </td>
                        <td className="py-2.5 px-3 text-amber-800 dark:text-amber-300">
                          {shareResult.residualWbShare.formatted}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-800 dark:text-amber-300 text-sm">
                          {shareResult.residualShare.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-amber-900 dark:text-amber-200 font-bold">
                          {shareResult.residualWbArea.formatted}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-800 dark:text-amber-300">
                          {shareResult.residualWbArea.satak.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right text-amber-800 dark:text-amber-300">
                          {shareResult.residualSqft.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right text-amber-800 dark:text-amber-300">
                          {shareResult.residualPct.toFixed(3)}%
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: WEST BENGAL UNIT CONVERTER & STATUTORY STANDARDS */}
      {/* ========================================================= */}
      {activeTab === 'converter' && (
        <div className="space-y-6">
          {/* Live Area Converter */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                <span>1. Live West Bengal Land Area Converter (কাঠা-ছটাক-গণ্ডা-কড়া-ক্রান্তি রূপান্তরক)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                কাঠা, ছটাক, গণ্ডা, কড়া, ক্রান্তি বা পাই লিখুন—তা তৎক্ষণাৎ বিঘা, শতক এবং বর্গফুটে রূপান্তর হবে।
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Katha (কাঠা)</label>
                <input
                  type="number"
                  min="0"
                  value={convKatha}
                  onChange={e => setConvKatha(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Chittak (ছটাক)</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={convChittak}
                  onChange={e => setConvChittak(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Ganda (গণ্ডা)</label>
                <input
                  type="number"
                  min="0"
                  max="19"
                  value={convGanda}
                  onChange={e => setConvGanda(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Kara (কড়া)</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={convKara}
                  onChange={e => setConvKara(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Kranti (ক্রান্তি)</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  value={convKranti}
                  onChange={e => setConvKranti(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Pai (পাই)</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={convPai}
                  onChange={e => setConvPai(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>
            </div>

            {/* Equivalent Output Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                  Traditional Format (বাংলায়)
                </div>
                <div className="text-sm font-extrabold text-purple-900 dark:text-purple-100 mt-1 font-sans">
                  {convWbArea.formatted}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                  Satak / Decimal (শতক)
                </div>
                <div className="text-sm font-extrabold text-blue-900 dark:text-blue-100 mt-1 font-mono">
                  {convWbArea.satak.toFixed(4)} শতক
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                  Square Feet (বর্গফুট)
                </div>
                <div className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100 mt-1 font-mono">
                  {convTotalSqft.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Sq.Ft.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                  Bigha Fraction (বিঘা)
                </div>
                <div className="text-sm font-extrabold text-amber-900 dark:text-amber-100 mt-1 font-mono">
                  {(convTotalSqft / WB_AREA_SQFT.bigha).toFixed(4)} বিঘা
                </div>
              </div>
            </div>
          </div>

          {/* 16-Ana Share to 10000 Share Live Converter */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Percent className="w-4 h-4 text-teal-600" />
                <span>2. 16-Ana Share to 10,000 Share Converter (আনা-গণ্ডা থেকে ১০,০০০ অংশ রূপান্তর)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                পুরনো খতিয়ান বা দলিলের ১৬ আনা হিস্যা লিখলে LR খতিয়ানের ৪ দশমিক বা ১০,০০০ অংশের হিস্যা বের হয়।
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Ana (আনা) [০-১৬]</label>
                <input
                  type="number"
                  min="0"
                  max="16"
                  value={convAna}
                  onChange={e => setConvAna(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-teal-700 dark:text-teal-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Ganda (গণ্ডা) [০-১৯]</label>
                <input
                  type="number"
                  min="0"
                  max="19"
                  value={convGandaShare}
                  onChange={e => setConvGandaShare(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Kara (কড়া) [০-৩]</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={convKaraShare}
                  onChange={e => setConvKaraShare(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Kranti (ক্রান্তি) [০-২]</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  value={convKrantiShare}
                  onChange={e => setConvKrantiShare(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Pai (পাই) [০-৩]</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={convPaiShare}
                  onChange={e => setConvPaiShare(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">
                <div className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase">
                  10,000 Share (দশ হাজারী অংশ)
                </div>
                <div className="text-base font-extrabold text-teal-900 dark:text-teal-100 mt-1 font-mono">
                  {convShare10000.toFixed(2)} / ১০০০০
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                  LR Parcha 4-Decimal Fraction
                </div>
                <div className="text-base font-extrabold text-blue-900 dark:text-blue-100 mt-1 font-mono">
                  {convShareFraction.toFixed(4)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                  Percentage (%)
                </div>
                <div className="text-base font-extrabold text-purple-900 dark:text-purple-100 mt-1 font-mono">
                  {convSharePct.toFixed(3)}%
                </div>
              </div>
            </div>
          </div>

          {/* West Bengal Reference Chart Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>পশ্চিমবঙ্গ ভূমি জরিপ ও রাজস্ব পরিমাপ সারণি (Official Survey Reference Table)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs border-b border-slate-200 dark:border-slate-700 pb-1">
                  জমির পরিমাপের একক (Land Area Units):
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <li>• ১ বিঘা = ২০ কাঠা = ১৪,৪০০ বর্গফুট (প্রায় ৩৩.০৬ শতক)</li>
                  <li>• ১ কাঠা = ১৬ ছটাক = ৭২০ বর্গফুট</li>
                  <li>• ১ ছটাক = ২০ গণ্ডা = ৪৫ বর্গফুট</li>
                  <li>• ১ গণ্ডা = ৪ কড়া = ২.২৫ বর্গফুট</li>
                  <li>• ১ কড়া = ৩ ক্রান্তি = ০.৫৬২৫ বর্গফুট</li>
                  <li>• ১ ক্রান্তি = ৪ পাই / ২০ তিল = ০.১৮৭৫ বর্গফুট</li>
                  <li>• ১ পাই = ০.০৪৬৮৭৫ বর্গফুট</li>
                  <li>• ১ একর = ১০০ শতক / ডেসিমেল = ৪৩,৫৬০ বর্গফুট</li>
                  <li>• ১ শতক = ৪৩৫.৬ বর্গফুট</li>
                </ul>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs border-b border-slate-200 dark:border-slate-700 pb-1">
                  ১৬ আনা হিস্যার একক (Traditional Share Hierarchy):
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <li>• সম্পূর্ণ সম্পত্তি = ১৬ আনা (১.০০০০ বা ১০০০০ অংশ)</li>
                  <li>• ১ আনা = ২০ গণ্ডা</li>
                  <li>• ১ গণ্ডা = ৪ কড়া</li>
                  <li>• ১ কড়া = ৩ ক্রান্তি</li>
                  <li>• ১ ক্রান্তি = ৪ পাই / ২০ তিল</li>
                  <li>• মোট ১ আনা = ৮০ কড়া = ২৪০ ক্রান্তি = ৯৬০ পাই</li>
                  <li>• সম্পূর্ণ ১৬ আনা = ৩২০ গণ্ডা = ১২৮০ কড়া = ৩৮৪০ ক্রান্তি</li>
                  <li>• LR খতিয়ানে ১০,০০০ অংশ হিসেবে ৪ দশমিক অংশে হিসাব হয়</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MUSLIM FARAYEZ (SUNNI HANAFI) */}
      {/* ========================================================= */}
      {activeTab === 'farayez' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span>Hanafi Sunni Inheritance Parameters (মুসলিম ফারায়েজ হিস্যা বণ্টন)</span>
              <span className="text-[11px] text-slate-400">16-Ana &amp; West Bengal Land Units Integration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Total Estate / Land Value (মোট সম্পত্তি) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={farayezTotal}
                  onChange={e => setFarayezTotal(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Denomination / Unit (একক)
                </label>
                <select
                  value={farayezUnit}
                  onChange={e => setFarayezUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Bigha">Bigha (বিঘা)</option>
                  <option value="Katha">Katha (কাঠা)</option>
                  <option value="Satak">Satak (শতক)</option>
                  <option value="Acre">Acre (একর)</option>
                  <option value="₹ (INR)">₹ Rupees (টাকা)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Deceased Person (মৃত ব্যক্তি)
                </label>
                <select
                  value={deceasedGender}
                  onChange={e => setDeceasedGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="male">Male Deceased (মরহুম স্বামী / পিতা)</option>
                  <option value="female">Female Deceased (মরহুমা স্ত্রী / মাতা)</option>
                </select>
              </div>
            </div>

            {/* Heirs counter grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {deceasedGender === 'female' ? (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Husband Surviving? (স্বামী জীবিত?)
                  </label>
                  <select
                    value={husbandCount}
                    onChange={e => setHusbandCount(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="0">No (মৃত)</option>
                    <option value="1">Yes (১ জন স্বামী)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Number of Wives (স্ত্রীর সংখ্যা)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={wifeCount}
                    onChange={e => setWifeCount(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Number of Sons (পুত্র)
                </label>
                <input
                  type="number"
                  min="0"
                  value={sonsCount}
                  onChange={e => setSonsCount(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Number of Daughters (কন্যা)
                </label>
                <input
                  type="number"
                  min="0"
                  value={daughtersCount}
                  onChange={e => setDaughtersCount(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Mother Surviving? (মাতা)
                </label>
                <select
                  value={motherAlive ? 'yes' : 'no'}
                  onChange={e => setMotherAlive(e.target.value === 'yes')}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="yes">Yes (জীবিত)</option>
                  <option value="no">No (মৃত)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Father Surviving? (পিতা)
                </label>
                <select
                  value={fatherAlive ? 'yes' : 'no'}
                  onChange={e => setFatherAlive(e.target.value === 'yes')}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="no">No (মৃত)</option>
                  <option value="yes">Yes (জীবিত)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={calculateFarayez}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <Scale className="w-4 h-4" /> Calculate Farayez Inheritance (ফারায়েজ বণ্টন হিসাব করুন)
              </button>
            </div>
          </div>

          {/* Farayez Result Table */}
          {farayezResult && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Farayez Apportionment Table (ওয়ারিশানদের মধ্যে বণ্টন তালিকা)</span>
                </span>
                <button
                  type="button"
                  onClick={printFarayezReport}
                  className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Print Farayez Certificate</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">ওয়ারিশান (Legal Heir)</th>
                      <th className="py-2.5 px-3">কোরআনিক অংশ</th>
                      <th className="py-2.5 px-3">১৬ আনা হিস্যা</th>
                      <th className="py-2.5 px-3">১০,০০০ অংশ</th>
                      <th className="py-2.5 px-3">বন্টিত পরিমাণ (প্রতি ওয়ারিশ)</th>
                      <th className="py-2.5 px-3">জমির পরিমাণ (কাঠা-ছটাক)</th>
                      <th className="py-2.5 px-3 text-right">মোট ক্যাটাগরি বণ্টন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {farayezResult.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {r.heir}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {r.fraction}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-purple-700 dark:text-purple-300">
                          {r.wbShare.formatted}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                          {r.share10000.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {r.shareVal.toLocaleString('en-IN', { maximumFractionDigits: 3 })} {farayezUnit}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">
                          {r.landDisplay || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right text-slate-600 dark:text-slate-400">
                          {r.totalVal.toLocaleString('en-IN', { maximumFractionDigits: 3 })} {farayezUnit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
