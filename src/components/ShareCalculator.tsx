import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Scale,
  ArrowRightLeft,
  Info,
  Layers,
  FileSpreadsheet,
  Copy,
  Check,
  Sparkles,
  Percent,
  X,
  Users
} from 'lucide-react';

// ==========================================
// WEST BENGAL STATUTORY & REVENUE CONSTANTS
// ==========================================

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
  pai: 0.046875,
  til: 0.009375, // 20 Til = 1 Kranti => 0.1875 / 20 = 0.009375 Sq.Ft.
  sqft: 1,
  hectare: 107639
};

// Exact 10 Land Unit Options as shown in Image 2
export interface LandUnitOption {
  key: string;
  label: string;
  short: string;
  sqft: number;
  banglaDesc?: string;
}

export const LAND_UNIT_OPTIONS: LandUnitOption[] = [
  { key: 'katha', label: 'কাঠা (Katha - 720 sq ft)', short: 'কাঠা', sqft: 720, banglaDesc: '১ কাঠা = ৭২০ ব.ফু.' },
  { key: 'chittak', label: 'ছটাক (Chhatak - 45 sq ft)', short: 'ছটাক', sqft: 45, banglaDesc: '১ ছটাক = ৪৫ ব.ফু.' },
  { key: 'sqft', label: 'বর্গফুট (Sq Ft)', short: 'ব.ফু.', sqft: 1, banglaDesc: '১ ব.ফু. = ১ ব.ফু.' },
  { key: 'decimal', label: 'শতক (Decimal - 435.6 sq ft)', short: 'শতক', sqft: 435.6, banglaDesc: '১ শতক = ৪৩৫.৬ ব.ফু.' },
  { key: 'bigha', label: 'বিঘা (Bigha - 20 katha)', short: 'বিঘা', sqft: 14400, banglaDesc: '১ বিঘা = ১৪,৪০০ ব.ফু.' },
  { key: 'acre', label: 'একর (Acre - 100 dec)', short: 'একর', sqft: 43560, banglaDesc: '১ একর = ৪৩,৫৬০ ব.ফু.' },
  { key: 'ganda', label: 'গণ্ডা (Ganda - 2.25 sq ft)', short: 'গণ্ডা', sqft: 2.25, banglaDesc: '১ গণ্ডা = ২.২৫ ব.ফু.' },
  { key: 'kara', label: 'কড়া (Kara)', short: 'কড়া', sqft: 0.5625, banglaDesc: '১ কড়া = ০.৫৬২৫ ব.ফু.' },
  { key: 'kranti', label: 'ক্রান্তি (Kranti)', short: 'ক্রান্তি', sqft: 0.1875, banglaDesc: '১ ক্রান্তি = ০.১৮৭৫ ব.ফু.' },
  { key: 'til', label: 'তিল / পাই (Til)', short: 'তিল/পাই', sqft: 0.009375, banglaDesc: '১ তিল = ০.০০৯৩৭৫ ব.ফু.' }
];

export const UNIT_LABELS: Record<string, string> = {
  acre: 'Acre (একর - ১০০ শতক)',
  satak: 'Satak / Decimal (শতক / ডেসিমেল)',
  decimal: 'Decimal / Satak (শতক / ডেসিমেল)',
  bigha: 'Bigha (বিঘা - ২০ কাঠা)',
  katha: 'Katha (কাঠা - ১৬ ছটাক)',
  chittak: 'Chittak (ছটাক - ২০ গণ্ডা)',
  sqft: 'Square Feet (বর্গফুট)'
};

// ==========================================
// MATHEMATICAL HELPER FUNCTIONS (WEST BENGAL)
// ==========================================

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
} {
  if (totalSqft <= 0) {
    return {
      bigha: 0,
      katha: 0,
      chittak: 0,
      ganda: 0,
      kara: 0,
      kranti: 0,
      pai: 0,
      satak: 0,
      formatted: '০ শতক'
    };
  }

  const satak = totalSqft / WB_AREA_SQFT.satak;
  let rem = totalSqft;

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
  if (ganda > 0 && bigha === 0) parts.push(`${ganda} গণ্ডা`);

  const formatted = parts.length > 0 ? parts.join(' ') : `${satak.toFixed(3)} শতক`;
  return { bigha, katha, chittak, ganda, kara, kranti, pai, satak, formatted };
}

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type CalculatorPhase = 'farayez' | 'share';

export type CalculatorSubTab = 'land-share' | 'unit-converter';

export interface OwnedAreaLine {
  id: string;
  value: string;
  unitKey: string;
}

export interface UnitConverterLine {
  id: string;
  amount: string;
  unitKey: string;
}

export interface FarayezExtraHeir {
  id: string;
  type: string;
  count: number;
}

// Extra heir options for Muslim Farayez
export const FARAYEZ_EXTRA_RELATIVES = [
  { key: 'paternal_grandfather', label: 'দাদা / পিতার পিতা (Paternal Grandfather)' },
  { key: 'paternal_grandmother', label: 'দাদী / পিতার মাতা (Paternal Grandmother)' },
  { key: 'maternal_grandmother', label: 'নানী / মাতার মাতা (Maternal Grandmother)' },
  { key: 'sons_son', label: 'পৌত্র / নাতি (Son\'s Son)' },
  { key: 'sons_daughter', label: 'পৌত্রী / নাতনি (Son\'s Daughter)' },
  { key: 'full_brother', label: 'আপন ভাই / সহোদর (Full Brother)' },
  { key: 'full_sister', label: 'আপন বোন / সহোদরা (Full Sister)' },
  { key: 'consanguine_brother', label: 'বৈমাত্রেয় ভাই (Consanguine Brother)' },
  { key: 'consanguine_sister', label: 'বৈমাত্রেয় বোন (Consanguine Sister)' },
  { key: 'uterine_brother', label: 'বৈপিত্রীয় ভাই (Uterine Brother)' },
  { key: 'uterine_sister', label: 'বৈপিত্রীয় বোন (Uterine Sister)' },
  { key: 'paternal_uncle', label: 'আপন চাচা / পিতৃব্য (Full Paternal Uncle)' },
  { key: 'paternal_uncles_son', label: 'চাচাত ভাই (Paternal Uncle\'s Son)' },
  { key: 'other_heir', label: 'অন্যান্য ওয়ারিশান (Other Legal Heir / Asaba)' }
];

export const ShareCalculator: React.FC = () => {
  const { activeCompany, showToast } = useApp();

  // Two Phase Architecture: Part 1: Share Calculator, Part 2: Muslim Farayez
  const [activePhase, setActivePhase] = useState<CalculatorPhase>('share');

  // Sub-tabs inside Part 1 (Share Calculator):
  // 1. Land Share Calculator, 2. Unit Converter
  const [activeSubTab, setActiveSubTab] = useState<CalculatorSubTab>('land-share');

  // =========================================================
  // PART 1 / TAB 1: LAND SHARE CALCULATOR
  // =========================================================
  const [areaPlotValue, setAreaPlotValue] = useState<string>('15');
  const [areaPlotUnit, setAreaPlotUnit] = useState<string>('decimal'); // default শতক / Decimal
  const [ownedAreaMode, setOwnedAreaMode] = useState<'multi' | 'single'>('multi');

  // Multi-line default rows matching Image 1:
  // #1: 1 Katha (720 sq ft)
  // #2: 3 Chhatak (45 sq ft)
  // #3: 20 Sq Ft (1 sq ft)
  const [ownedLines, setOwnedLines] = useState<OwnedAreaLine[]>([
    { id: 'ol_1', value: '1', unitKey: 'katha' },
    { id: 'ol_2', value: '3', unitKey: 'chittak' },
    { id: 'ol_3', value: '20', unitKey: 'sqft' }
  ]);

  // Single Value Mode state
  const [singleOwnedValue, setSingleOwnedValue] = useState<string>('2.0087');
  const [singleOwnedUnit, setSingleOwnedUnit] = useState<string>('decimal');

  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Add line
  const addOwnedLine = () => {
    setOwnedLines(prev => [
      ...prev,
      {
        id: 'ol_' + Date.now(),
        value: '1',
        unitKey: 'sqft'
      }
    ]);
  };

  const removeOwnedLine = (id: string) => {
    if (ownedLines.length <= 1) return;
    setOwnedLines(prev => prev.filter(l => l.id !== id));
  };

  const updateOwnedLine = (id: string, updates: Partial<OwnedAreaLine>) => {
    setOwnedLines(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  // Total Plot Calculations
  const totalPlotSqft = useMemo(() => {
    const val = parseFloat(areaPlotValue) || 0;
    if (val <= 0) return 0;
    const opt = LAND_UNIT_OPTIONS.find(u => u.key === areaPlotUnit);
    return val * (opt ? opt.sqft : WB_AREA_SQFT.decimal);
  }, [areaPlotValue, areaPlotUnit]);

  const totalPlotDecimal = totalPlotSqft / WB_AREA_SQFT.decimal;

  // Owned Area Calculations
  const ownedTotalSqft = useMemo(() => {
    if (ownedAreaMode === 'multi') {
      return ownedLines.reduce((acc, line) => {
        const val = parseFloat(line.value) || 0;
        const opt = LAND_UNIT_OPTIONS.find(u => u.key === line.unitKey);
        const sqftPerUnit = opt ? opt.sqft : 1;
        return acc + val * sqftPerUnit;
      }, 0);
    } else {
      const val = parseFloat(singleOwnedValue) || 0;
      const opt = LAND_UNIT_OPTIONS.find(u => u.key === singleOwnedUnit);
      return val * (opt ? opt.sqft : WB_AREA_SQFT.decimal);
    }
  }, [ownedAreaMode, ownedLines, singleOwnedValue, singleOwnedUnit]);

  const ownedDecimal = ownedTotalSqft / WB_AREA_SQFT.decimal;

  // Final 10,000 Share Calculation:
  // Statutory Formula: Share = (10000 / Total Area) * Owned Area
  const calculatedShare10000 = useMemo(() => {
    if (totalPlotSqft <= 0 || ownedTotalSqft <= 0) return 0;
    return (10000 / totalPlotSqft) * ownedTotalSqft;
  }, [totalPlotSqft, ownedTotalSqft]);

  const calculatedShareFraction = totalPlotSqft > 0 ? ownedTotalSqft / totalPlotSqft : 0;
  const calculatedLRKhatian = calculatedShareFraction.toFixed(4);
  const calculated16Ana = useMemo(() => fractionToWbShare(calculatedShareFraction), [calculatedShareFraction]);
  const calculatedPct = (calculatedShareFraction * 100).toFixed(3) + '%';

  const remainingSqft = Math.max(0, totalPlotSqft - ownedTotalSqft);
  const remainingDecimal = remainingSqft / WB_AREA_SQFT.decimal;
  const remaining10000Share = totalPlotSqft > 0 ? (remainingSqft / totalPlotSqft) * 10000 : 0;

  const copyShareResult = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    showToast('Copied share value to clipboard');
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const printHtmlContent = (htmlContent: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const printLandShareSheet = () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>West Bengal 10,000 Land Share Calculation Sheet</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 36px; color: #111; line-height: 1.5; font-size: 13px; }
            h2, h3 { margin: 0 0 4px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 10px 0 14px 0; }
            .box { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
            th, td { border: 1px solid #777; padding: 8px; text-align: left; }
            th { background: #E2E8F0; font-weight: bold; }
            .mono { font-family: monospace; font-size: 12px; }
            .highlight { background: #EFF6FF; font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'Legal Chamber'}</h2>
            <div><strong>পশ্চিমবঙ্গ ভূমি ও রাজস্ব আদালত স্বীকৃত ১০,০০০ অংশ ও হিস্যা নির্ধারণ সনদপত্র</strong></div>
            <div style="font-size: 12px; color: #555;">West Bengal Statutory 10,000 Land Share & 16-Ana Apportionment Sheet</div>
            <div style="font-size: 11px; color: #777; margin-top: 4px;">তারিখ: ${new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <hr />

          <div class="box">
            <div><strong>দাগের মোট জমি (Total Plot Area):</strong> ${areaPlotValue} ${LAND_UNIT_OPTIONS.find(u => u.key === areaPlotUnit)?.label || areaPlotUnit} = <strong>${totalPlotDecimal.toFixed(4)} শতক</strong> (${totalPlotSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Sq.Ft.)</div>
            <div style="margin-top: 4px;"><strong>অধিগ্রহণকৃত / নির্দিষ্ট জমি (Owned Area):</strong> ${ownedTotalSqft.toFixed(2)} Sq.Ft. = <strong>${ownedDecimal.toFixed(4)} শতক</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>হিস্যা ক্যাটাগরি</th>
                <th>মান (Value)</th>
                <th>বিস্তারিত বিবরণ</th>
              </tr>
            </thead>
            <tbody>
              <tr class="highlight">
                <td><strong>১০,০০০ স্কেল হিস্যা (10,000 Share)</strong></td>
                <td class="mono" style="font-size: 14px; color: #1E3A8A;"><strong>${calculatedShare10000.toFixed(2)}</strong></td>
                <td>Statutory Land Share = (10,000 / Total Area) × Owned Area</td>
              </tr>
              <tr>
                <td><strong>LR Parcha খতিয়ান অংশ</strong></td>
                <td class="mono font-bold">${calculatedLRKhatian}</td>
                <td>দশমিক স্কেল (1.0000 সম্পূর্ণ জোত)</td>
              </tr>
              <tr>
                <td><strong>১৬ আনা হিস্যা</strong></td>
                <td style="color: #4338CA; font-weight: bold;">${calculated16Ana.formatted}</td>
                <td>আনা, গণ্ডা, কড়া, ক্রান্তি, তিল</td>
              </tr>
              <tr>
                <td><strong>শতাংশ (%)</strong></td>
                <td class="mono">${calculatedPct}</td>
                <td>দাগের মোট ভূমির শতকরা বণ্টন</td>
              </tr>
              <tr style="background: #FEF3C7;">
                <td><strong>দাগে অবশিষ্ট জমি (Remaining in Plot)</strong></td>
                <td class="mono">${remainingDecimal.toFixed(4)} শতক</td>
                <td>অবশিষ্ট হিস্যা: ${remaining10000Share.toFixed(2)} (${remainingSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Sq.Ft.)</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px;">
            <div>West Bengal L&LR Cadastral Share Engine · 10000 Scale</div>
            <div>রাজস্ব আইনজীবী / মুহুরী স্বাক্ষর: _________________________</div>
          </div>
        </body>
      </html>
    `;
    printHtmlContent(html);
  };

  // =========================================================
  // PART 1 / TAB 2: LIVE UNIT CONVERTER (MULTI-LINE "+" CALCULATOR)
  // =========================================================
  const [convLines, setConvLines] = useState<UnitConverterLine[]>([
    { id: 'cl_1', amount: '1', unitKey: 'katha' }
  ]);
  const [copiedUnitKey, setCopiedUnitKey] = useState<string | null>(null);

  const addConvLine = () => {
    setConvLines(prev => [
      ...prev,
      {
        id: 'cl_' + Date.now(),
        amount: '1',
        unitKey: prev.length === 1 ? 'chittak' : 'decimal'
      }
    ]);
  };

  const removeConvLine = (id: string) => {
    if (convLines.length <= 1) return;
    setConvLines(prev => prev.filter(l => l.id !== id));
  };

  const updateConvLine = (id: string, updates: Partial<UnitConverterLine>) => {
    setConvLines(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const resetConvLines = () => {
    setConvLines([
      { id: 'cl_1', amount: '1', unitKey: 'katha' }
    ]);
  };

  // Computations for each individual conversion line
  const computedConvLines = useMemo(() => {
    return convLines.map(line => {
      const val = parseFloat(line.amount) || 0;
      const opt = LAND_UNIT_OPTIONS.find(u => u.key === line.unitKey);
      const sqft = val * (opt ? opt.sqft : WB_AREA_SQFT.katha);
      const satak = sqft / WB_AREA_SQFT.decimal;
      const katha = sqft / WB_AREA_SQFT.katha;
      const bigha = sqft / WB_AREA_SQFT.bigha;
      return {
        ...line,
        val,
        optLabel: opt ? opt.label : line.unitKey,
        sqft,
        satak,
        katha,
        bigha
      };
    });
  }, [convLines]);

  // Combined Total Square Feet
  const totalConvSqft = useMemo(() => {
    return computedConvLines.reduce((acc, l) => acc + l.sqft, 0);
  }, [computedConvLines]);

  const totalConvSatak = totalConvSqft / WB_AREA_SQFT.decimal;
  const totalConvAcre = totalConvSqft / WB_AREA_SQFT.acre;
  const totalConvBigha = totalConvSqft / WB_AREA_SQFT.bigha;
  const totalConvKatha = totalConvSqft / WB_AREA_SQFT.katha;
  const totalConvWbArea = useMemo(() => sqftToWbArea(totalConvSqft), [totalConvSqft]);

  const copyUnitValue = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUnitKey(key);
    showToast(`Copied ${text} to clipboard`);
    setTimeout(() => setCopiedUnitKey(null), 1800);
  };

  const printUnitConversionSheet = () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Land Unit Conversion Sheet</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 36px; color: #111; line-height: 1.5; font-size: 13px; }
            h2, h3 { margin: 0 0 4px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 10px 0 14px 0; }
            .box { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
            th, td { border: 1px solid #777; padding: 8px; text-align: left; }
            th { background: #E2E8F0; font-weight: bold; }
            .mono { font-family: monospace; font-size: 12px; }
            .highlight { background: #EFF6FF; font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'Legal Chamber'}</h2>
            <div><strong>পশ্চিমবঙ্গ ভূমি পরিমাপ ও রূপান্তর সনদপত্র (Land Measurement & Conversion Sheet)</strong></div>
            <div style="font-size: 11px; color: #777; margin-top: 4px;">তারিখ: ${new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <hr />

          <div class="box">
            <div><strong>মোট রূপান্তর পরিমাণ (Total Combined Area):</strong> ${totalConvSqft.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Sq.Ft. = <strong>${totalConvSatak.toFixed(4)} শতক / Decimal</strong></div>
            <div style="margin-top: 4px;"><strong>পরম্পরাগত হিসাব (Traditional):</strong> ${totalConvWbArea.formatted}</div>
          </div>

          ${computedConvLines.length > 1 ? `
          <h3>ইনপুট বিবরণী (Input Breakdown):</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>পরিমাণ ও একক (Input)</th>
                <th>বর্গফুট (Sq.Ft.)</th>
                <th>শতক (Satak)</th>
                <th>কাঠা (Katha)</th>
                <th>শতকরা অংশ (%)</th>
              </tr>
            </thead>
            <tbody>
              ${computedConvLines.map((l, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${l.amount}</strong> ${l.optLabel}</td>
                  <td class="mono">${l.sqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                  <td class="mono">${l.satak.toFixed(4)}</td>
                  <td class="mono">${l.katha.toFixed(4)}</td>
                  <td class="mono">${totalConvSqft > 0 ? ((l.sqft / totalConvSqft) * 100).toFixed(2) : '0.00'}%</td>
                </tr>
              `).join('')}
              <tr class="highlight">
                <td colspan="2"><strong>সর্বমোট (Grand Total)</strong></td>
                <td class="mono">${totalConvSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                <td class="mono">${totalConvSatak.toFixed(4)}</td>
                <td class="mono">${totalConvKatha.toFixed(4)}</td>
                <td class="mono">100.00%</td>
              </tr>
            </tbody>
          </table>
          <br />
          ` : ''}

          <h3>পশ্চিমবঙ্গ প্রমিত ১০টি এককে রূপান্তর (Equivalent Across 10 Standard Units):</h3>
          <table>
            <thead>
              <tr>
                <th>একক (Unit)</th>
                <th>মান (Converted Value)</th>
                <th>হিসাবের মানদণ্ড (Standard Factor)</th>
              </tr>
            </thead>
            <tbody>
              ${LAND_UNIT_OPTIONS.map(opt => {
                const equiv = totalConvSqft / opt.sqft;
                return `
                  <tr>
                    <td><strong>${opt.label}</strong></td>
                    <td class="mono" style="font-size: 13px; color: #1E3A8A;"><strong>${equiv >= 1000 ? equiv.toLocaleString('en-IN', { maximumFractionDigits: 4 }) : equiv.toFixed(4)}</strong></td>
                    <td>1 ${opt.key} = ${opt.sqft} Sq.Ft. (${opt.banglaDesc})</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px;">
            <div>West Bengal Revenue Land Converter Standard</div>
            <div>রাজস্ব আইনজীবী / মোহরার স্বাক্ষর: _________________________</div>
          </div>
        </body>
      </html>
    `;
    printHtmlContent(html);
  };

  // =========================================================
  // PART 2: MUSLIM FARAYEZ WITH DYNAMIC "+" ADD MORE BUTTON
  // =========================================================
  const [farayezTotal, setFarayezTotal] = useState<string>('50');
  const [farayezUnit, setFarayezUnit] = useState<string>('decimal');
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');

  const getFarayezUnitDisplay = (unitKey: string) => {
    const opt = LAND_UNIT_OPTIONS.find(u =>
      u.key === unitKey ||
      u.key === unitKey.toLowerCase() ||
      (unitKey === 'Satak' && u.key === 'decimal') ||
      (unitKey === 'Decimal' && u.key === 'decimal') ||
      (unitKey === 'Acre' && u.key === 'acre') ||
      (unitKey === 'Bigha' && u.key === 'bigha') ||
      (unitKey === 'Katha' && u.key === 'katha')
    );
    if (opt) return opt.short;
    if (unitKey === 'inr' || unitKey === '₹ (INR)') return 'টাকা (₹)';
    return unitKey;
  };
  const [husbandCount, setHusbandCount] = useState<number>(0);
  const [wifeCount, setWifeCount] = useState<number>(1);
  const [sonsCount, setSonsCount] = useState<number>(2);
  const [daughtersCount, setDaughtersCount] = useState<number>(1);
  const [fatherAlive, setFatherAlive] = useState<boolean>(false);
  const [motherAlive, setMotherAlive] = useState<boolean>(true);

  // Dynamic additional relatives with "+" button as requested!
  const [extraHeirs, setExtraHeirs] = useState<FarayezExtraHeir[]>([]);

  const [farayezResult, setFarayezResult] = useState<any[] | null>(null);

  const addExtraHeir = () => {
    setExtraHeirs(prev => [
      ...prev,
      {
        id: 'eh_' + Date.now(),
        type: 'paternal_grandfather',
        count: 1
      }
    ]);
  };

  const removeExtraHeir = (id: string) => {
    setExtraHeirs(prev => prev.filter(h => h.id !== id));
  };

  const updateExtraHeir = (id: string, updates: Partial<FarayezExtraHeir>) => {
    setExtraHeirs(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
  };

  const calculateFarayez = () => {
    const totalVal = parseFloat(farayezTotal) || 0;
    if (totalVal <= 0) {
      showToast('Enter total property value or land quantity', 'error');
      return;
    }

    const hasChildren = sonsCount > 0 || daughtersCount > 0;
    let shares: any[] = [];
    let totalFixedFraction = 0;

    // 1. Spousal Share
    if (deceasedGender === 'female' && husbandCount > 0) {
      const hFrac = hasChildren ? { num: 1, den: 4, label: '১/৪ (1/4)' } : { num: 1, den: 2, label: '১/২ (1/2)' };
      const fracVal = hFrac.num / hFrac.den;
      totalFixedFraction += fracVal;
      shares.push({
        heir: 'Husband (স্বামী)',
        count: 1,
        fraction: hFrac.label,
        fracVal,
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
        shareVal: totalWifeAmt / wifeCount,
        totalVal: totalWifeAmt
      });
    }

    // 2. Mother
    if (motherAlive) {
      const mFrac = hasChildren ? { num: 1, den: 6, label: '১/৬ (1/6)' } : { num: 1, den: 3, label: '১/৩ (1/3)' };
      const fracVal = mFrac.num / mFrac.den;
      totalFixedFraction += fracVal;
      shares.push({
        heir: 'Mother (মাতা)',
        count: 1,
        fraction: mFrac.label,
        fracVal,
        shareVal: totalVal * fracVal,
        totalVal: totalVal * fracVal
      });
    }

    // 3. Father
    if (fatherAlive && hasChildren) {
      totalFixedFraction += 1 / 6;
      shares.push({
        heir: 'Father (পিতা - নির্ধারিত অংশ)',
        count: 1,
        fraction: '১/৬ (1/6)',
        fracVal: 1 / 6,
        shareVal: totalVal * (1 / 6),
        totalVal: totalVal * (1 / 6)
      });
    }

    // 4. Children (Sons & Daughters)
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
        shareVal: totalVal * residue,
        totalVal: totalVal * residue
      });
    }

    // 5. Process Dynamically Added Relatives (via "+" button)
    let extraRemaining = Math.max(0, 1 - shares.reduce((acc, s) => acc + (s.fracVal || 0), 0));

    if (extraHeirs.length > 0) {
      const totalExtraCount = extraHeirs.reduce((acc, h) => acc + Math.max(1, h.count), 0);
      extraHeirs.forEach(eh => {
        const opt = FARAYEZ_EXTRA_RELATIVES.find(r => r.key === eh.type);
        const heirName = opt ? opt.label : 'Additional Relative';
        const count = Math.max(1, eh.count);

        let heirFracVal = 0;
        let fracLabel = '';

        // Specific legal rules if no closer heirs exist
        if (!hasChildren && !fatherAlive && extraRemaining > 0) {
          heirFracVal = (extraRemaining * count) / totalExtraCount;
          fracLabel = `আসাবা হিস্যা (${(heirFracVal * 100).toFixed(2)}%)`;
        } else if (hasChildren && !motherAlive && eh.type.includes('grandmother')) {
          heirFracVal = (1 / 6) / count;
          fracLabel = '১/৬ অংশ (দাদী/নানী)';
        } else if (hasChildren && !fatherAlive && eh.type === 'paternal_grandfather') {
          heirFracVal = (1 / 6) / count;
          fracLabel = '১/৬ অংশ (দাদা)';
        } else {
          heirFracVal = (extraRemaining * count) / Math.max(1, totalExtraCount);
          fracLabel = `ওয়ারিশ বণ্টন (${(heirFracVal * 100).toFixed(2)}%)`;
        }

        const totalHeirAmt = totalVal * heirFracVal;
        shares.push({
          heir: `${heirName} [${count} জন]`,
          count,
          fraction: fracLabel,
          fracVal: heirFracVal,
          shareVal: totalHeirAmt / count,
          totalVal: totalHeirAmt
        });
      });
    }

    // Enrich all shares with 10000 Scale, 16-Ana, and Land equivalents
    const enrichedShares = shares.map(s => {
      const share10000 = (s.fracVal || 0) * 10000;
      const wbShare = fractionToWbShare(s.fracVal || 0);

      let landDisplay = '';
      const unitOpt = LAND_UNIT_OPTIONS.find(u =>
        u.key === farayezUnit ||
        u.key === farayezUnit.toLowerCase() ||
        (farayezUnit === 'Satak' && u.key === 'decimal') ||
        (farayezUnit === 'Decimal' && u.key === 'decimal') ||
        (farayezUnit === 'Acre' && u.key === 'acre') ||
        (farayezUnit === 'Bigha' && u.key === 'bigha') ||
        (farayezUnit === 'Katha' && u.key === 'katha')
      );

      if (unitOpt) {
        const sqft = s.shareVal * unitOpt.sqft;
        const wbArea = sqftToWbArea(sqft);
        landDisplay = wbArea.formatted;
      } else if (farayezUnit === 'inr' || farayezUnit === '₹ (INR)') {
        landDisplay = `₹ ${s.shareVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
      }

      return {
        ...s,
        share10000,
        wbShare,
        landDisplay
      };
    });

    setFarayezResult(enrichedShares);
    showToast('Islamic Farayez calculated successfully');
  };

  const printFarayezReport = () => {
    if (!farayezResult) return;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Muslim Farayez Inheritance Certificate - West Bengal</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 36px; color: #111; line-height: 1.5; font-size: 13px; }
            h2, h3 { margin: 0 0 4px 0; color: #0D9488; }
            hr { border: none; border-top: 1.5px solid #0D9488; margin: 10px 0 14px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
            th, td { border: 1px solid #777; padding: 8px; text-align: left; }
            th { background: #CCFBF1; font-weight: bold; }
            .mono { font-family: monospace; font-size: 12px; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'Legal Chamber'}</h2>
            <div><strong>সুন্নি হানাফি আইন অনুসারে মুসলিম ফারায়েজ বণ্টন সনদপত্র</strong></div>
            <div style="font-size: 12px; color: #555;">Hanafi Sunni Inheritance Distribution (16-Ana & WB Land Units)</div>
            <div style="font-size: 11px; color: #777; margin-top: 4px;">সম্পত্তির পরিমাণ: ${parseFloat(farayezTotal || '0').toLocaleString('en-IN')} ${LAND_UNIT_OPTIONS.find(u => u.key === farayezUnit || u.key === farayezUnit.toLowerCase() || (farayezUnit === 'Satak' && u.key === 'decimal'))?.label || (farayezUnit === 'inr' ? 'টাকা / নগদ অর্থ' : farayezUnit)} | মৃত ব্যক্তি: ${deceasedGender === 'male' ? 'পুরুষ (মরহুম)' : 'নারী (মরহুমা)'}</div>
          </div>
          <hr />
          <table>
            <thead>
              <tr>
                <th>ওয়ারিশান (Legal Heir)</th>
                <th>কোরআনিক অংশ</th>
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
                <td class="mono font-bold">${r.fraction}</td>
                <td style="color: #047857; font-weight: bold;">${r.wbShare.formatted}</td>
                <td class="mono font-bold">${r.share10000.toFixed(2)}</td>
                <td class="mono"><strong>${r.shareVal.toLocaleString('en-IN', { maximumFractionDigits: 3 })} ${getFarayezUnitDisplay(farayezUnit)}</strong></td>
                <td>${r.landDisplay || '—'}</td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="margin-top: 36px; text-align: right; font-size: 11px;">
            Certified under Sunni Hanafi Jurisprudence
          </div>
        </body>
      </html>
    `;
    printHtmlContent(html);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* ========================================================= */}
      {/* TOP 2-PHASE ARCHITECTURE HEADER */}
      {/* ========================================================= */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Phase 1 Button: Share Calculator */}
          <button
            type="button"
            onClick={() => setActivePhase('share')}
            className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              activePhase === 'share'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  activePhase === 'share'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                }`}
              >
                <Calculator className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-extrabold tracking-wider opacity-80">
                  PART 1
                </div>
                <div className="text-sm font-black">SHARE CALCULATOR</div>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activePhase === 'share'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
              }`}
            >
              হিস্যা ক্যালকুলেটর
            </span>
          </button>

          {/* Phase 2 Button: Muslim Farayez */}
          <button
            type="button"
            onClick={() => setActivePhase('farayez')}
            className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              activePhase === 'farayez'
                ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-500/30'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  activePhase === 'farayez'
                    ? 'bg-white/20 text-white'
                    : 'bg-teal-100 dark:bg-teal-950 text-teal-600'
                }`}
              >
                <Scale className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-extrabold tracking-wider opacity-80">
                  PART 2
                </div>
                <div className="text-sm font-black">MUSLIM FARAYEZ</div>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activePhase === 'farayez'
                  ? 'bg-white/20 text-white'
                  : 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
              }`}
            >
              মুসলিম ফারায়েজ
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PART 2: MUSLIM FARAYEZ WITH "+" ADD MORE HEIRS BUTTON */}
      {/* ========================================================= */}
      {activePhase === 'farayez' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" />
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Hanafi Sunni Inheritance Parameters (মুসলিম ফারায়েজ হিস্যা বণ্টন)
                </span>
              </div>
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full">
                10000 &amp; 16-Ana
              </span>
            </div>

            {/* Estate value, unit and deceased gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Total Estate / Land Value (মোট সম্পত্তি) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={farayezTotal}
                  onChange={e => setFarayezTotal(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Denomination / Unit (একক)
                </label>
                <select
                  value={farayezUnit}
                  onChange={e => setFarayezUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  {LAND_UNIT_OPTIONS.map(opt => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                  <option value="inr">টাকা / নগদ অর্থ (₹ Rupees / Cash)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Deceased Person (মৃত ব্যক্তি)
                </label>
                <select
                  value={deceasedGender}
                  onChange={e => setDeceasedGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold cursor-pointer"
                >
                  <option value="male">Male Deceased (মরহুম স্বামী / পিতা)</option>
                  <option value="female">Female Deceased (মরহুমা স্ত্রী / মাতা)</option>
                </select>
              </div>
            </div>

            {/* Primary Relatives Grid */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Primary Heirs (নিকটাত্মীয় ওয়ারিশান):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {deceasedGender === 'female' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Husband Surviving? (স্বামী)
                    </label>
                    <select
                      value={husbandCount}
                      onChange={e => setHusbandCount(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    >
                      <option value="0">No (মৃত)</option>
                      <option value="1">Yes (১ জন স্বামী)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Wives Count (স্ত্রীর সংখ্যা)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      value={wifeCount}
                      onChange={e => setWifeCount(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
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
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
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
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Mother Surviving? (মাতা)
                  </label>
                  <select
                    value={motherAlive ? 'yes' : 'no'}
                    onChange={e => setMotherAlive(e.target.value === 'yes')}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
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
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="no">No (মৃত)</option>
                    <option value="yes">Yes (জীবিত)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DYNAMIC ADDITIONAL HEIRS WITH "+" BUTTON (USER'S EXPLICIT REQUIREMENT) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>Additional Relatives &amp; Legal Heirs (আরও ওয়ারিশান)</span>
                  </span>
                  <p className="text-[11px] text-slate-500">
                    দাদা, দাদী, নানী, পৌত্র, সহোদর ভাই/বোন, চাচা ইত্যাদি ওয়ারিশান যুক্ত করতে নিচের "+" বোতাম চাপুন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExtraHeir}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add More Relative (ওয়ারিশান যোগ করুন)</span>
                </button>
              </div>

              {/* Dynamic list of extra heirs */}
              {extraHeirs.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  {extraHeirs.map((eh, idx) => (
                    <div
                      key={eh.id}
                      className="p-2.5 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/30 flex flex-wrap items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <select
                        value={eh.type}
                        onChange={e => updateExtraHeir(eh.id, { type: e.target.value })}
                        className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                      >
                        {FARAYEZ_EXTRA_RELATIVES.map(rel => (
                          <option key={rel.key} value={rel.key}>
                            {rel.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">সংখ্যা:</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={eh.count}
                          onChange={e => updateExtraHeir(eh.id, { count: parseInt(e.target.value) || 1 })}
                          className="w-16 px-2 py-1 text-xs font-mono font-bold text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExtraHeir(eh.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                        title="Remove Relative"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={calculateFarayez}
                className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <Scale className="w-4 h-4" />
                <span>Calculate Farayez Inheritance (ফারায়েজ বণ্টন হিসাব করুন)</span>
              </button>
            </div>
          </div>

          {/* Farayez Result Table */}
          {farayezResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Farayez Apportionment Table (ওয়ারিশানদের মধ্যে বণ্টন তালিকা)</span>
                </span>
                <button
                  type="button"
                  onClick={printFarayezReport}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-600" />
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
                      <th className="py-2.5 px-3">বন্টিত পরিমাণ (প্রতি ব্যক্তি)</th>
                      <th className="py-2.5 px-3">জমির পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">মোট ক্যাটাগরি বণ্টন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {farayezResult.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {r.heir}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                          {r.fraction}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-purple-700 dark:text-purple-300">
                          {r.wbShare.formatted}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                          {r.share10000.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {r.shareVal.toLocaleString('en-IN', { maximumFractionDigits: 3 })} {getFarayezUnitDisplay(farayezUnit)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">
                          {r.landDisplay || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right text-slate-600 dark:text-slate-400">
                          {r.totalVal.toLocaleString('en-IN', { maximumFractionDigits: 3 })} {getFarayezUnitDisplay(farayezUnit)}
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

      {/* ========================================================= */}
      {/* PART 1: SHARE CALCULATOR (ORGANIZED AS IN THE IMAGES) */}
      {/* ========================================================= */}
      {activePhase === 'share' && (
        <div className="space-y-4">
          {/* Header Card Matching Image 1 */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      (Banglarbhumi)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white tracking-wider">
                      L&amp;LR
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Calculate Katha, Chhatak, Satak, Acre, Kara, Kranti, Ganda, Ana &amp; 10000-Scale Share
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAreaPlotValue('15');
                  setAreaPlotUnit('decimal');
                  setOwnedLines([
                    { id: 'ol_1', value: '1', unitKey: 'katha' },
                    { id: 'ol_2', value: '3', unitKey: 'chittak' },
                    { id: 'ol_3', value: '20', unitKey: 'sqft' }
                  ]);
                  showToast('Reset to defaults');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Reset"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top Sub-Tabs: 1. Land Share Calculator, 2. Unit Converter */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
              <button
                type="button"
                onClick={() => setActiveSubTab('land-share')}
                className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === 'land-share'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>1. Land Share Calculator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('unit-converter')}
                className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === 'unit-converter'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>2. Unit Converter</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: LAND SHARE CALCULATOR (EXACTLY AS IN IMAGE 1 & 2) */}
          {/* ========================================================= */}
          {activeSubTab === 'land-share' && (
            <div className="space-y-4">

              {/* Main Land Share Calculator Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
                {/* 1. Total Land Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    1. Total Land Area:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="any"
                      value={areaPlotValue}
                      onChange={e => setAreaPlotValue(e.target.value)}
                      placeholder="15"
                      className="w-full px-3.5 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <select
                      value={areaPlotUnit}
                      onChange={e => setAreaPlotUnit(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 cursor-pointer"
                    >
                      {LAND_UNIT_OPTIONS.map(opt => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Owned / Acquired Area */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      2. Owned / Acquired Area:
                    </label>

                    {/* Segmented Pill Toggle Matching Image 1 */}
                    <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setOwnedAreaMode('multi')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                          ownedAreaMode === 'multi'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Multi-line (+)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOwnedAreaMode('single')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          ownedAreaMode === 'single'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <span>Single Value</span>
                      </button>
                    </div>
                  </div>

                  {/* Multi-line Mode */}
                  {ownedAreaMode === 'multi' ? (
                    <div className="space-y-2.5">
                      {ownedLines.map((line, idx) => (
                        <div key={line.id} className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400 w-6 shrink-0 text-center">
                            #{idx + 1}
                          </span>
                          <input
                            type="number"
                            step="any"
                            value={line.value}
                            onChange={e => updateOwnedLine(line.id, { value: e.target.value })}
                            className="w-24 sm:w-32 px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          />
                          <select
                            value={line.unitKey}
                            onChange={e => updateOwnedLine(line.id, { unitKey: e.target.value })}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            {LAND_UNIT_OPTIONS.map(opt => (
                              <option key={opt.key} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {ownedLines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOwnedLine(line.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Delete Line"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add Line button & example hint matching Image 1 */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={addOwnedLine}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Add Line</span>
                        </button>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          উদাহরণ: ১ কাঠা ৩ ছটাক ২০ ব.ফু.
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Single Value Mode */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="number"
                        step="any"
                        value={singleOwnedValue}
                        onChange={e => setSingleOwnedValue(e.target.value)}
                        placeholder="2.0087"
                        className="w-full px-3.5 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <select
                        value={singleOwnedUnit}
                        onChange={e => setSingleOwnedUnit(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold cursor-pointer"
                      >
                        {LAND_UNIT_OPTIONS.map(opt => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Summary Box matching Image 1: Total Sum: 875.00 Sq Ft = 2.0087 Decimal */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/60 font-mono text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-slate-400 font-sans">Total Sum:</span>
                    <span className="text-blue-700 dark:text-blue-400">
                      {ownedTotalSqft.toFixed(2)} Sq Ft = {ownedDecimal.toFixed(4)} Decimal
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculated Share Results Card matching Image 1 */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                      CALCULATED SHARE RESULTS
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyShareResult(`${calculatedShare10000.toFixed(2)}`)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShare ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Big Share Display matching Image 1 */}
                <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700/60 space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    SHARE (OUT OF 10,000)
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight">
                    {calculatedShare10000.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    LR Khatian Decimal: <strong className="text-white">{calculatedLRKhatian}</strong> / 1.0000
                  </div>
                </div>

                {/* Grid of Key Calculations */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">16-Ana Share</div>
                    <div className="font-bold text-purple-300 mt-1 truncate">{calculated16Ana.formatted}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Share Percentage</div>
                    <div className="font-bold text-blue-300 font-mono mt-1">{calculatedPct}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Acquired Area</div>
                    <div className="font-bold text-amber-300 font-mono mt-1">{ownedDecimal.toFixed(4)} শতক</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Remaining in Plot</div>
                    <div className="font-bold text-emerald-300 font-mono mt-1">{remaining10000Share.toFixed(2)} হিস্যা</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={printLandShareSheet}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Calculation Sheet</span>
                  </button>
                </div>
              </div>

              {/* Footer bar matching Image 1 */}
              <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 gap-2">
                <span>West Bengal L&amp;LR Cadastral Share Engine • 10000 Scale</span>
                <button
                  type="button"
                  onClick={() => {
                    setAreaPlotValue('15');
                    setAreaPlotUnit('decimal');
                    setOwnedLines([
                      { id: 'ol_1', value: '1', unitKey: 'katha' },
                      { id: 'ol_2', value: '3', unitKey: 'chittak' },
                      { id: 'ol_3', value: '20', unitKey: 'sqft' }
                    ]);
                    showToast('Reset to defaults');
                  }}
                  className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close / Reset
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: LIVE UNIT CONVERTER (MULTI-LINE "+" CALCULATOR) */}
          {/* ========================================================= */}
          {activeSubTab === 'unit-converter' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>2. Live Land Measurement Converter (ভূমি পরিমাপ রূপান্তরক)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      West Bengal Standard · ১ বিঘা = ২০ কাঠা, ১ কাঠা = ১৬ ছটাক = ৭২০ ব.ফু., ১ শতক = ৪৩৫.৬ ব.ফু.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={printUnitConversionSheet}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      title="Print Conversion Certificate"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Conversion Slip</span>
                    </button>
                  </div>
                </div>

                {/* Section: Multi-line Input rows with "+" Option */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Enter Measurements (পরিমাপ ও একক ইনপুট):
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Total Items: <strong>{convLines.length}</strong>
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {computedConvLines.map((line, idx) => (
                      <div
                        key={line.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center gap-2.5 transition-all"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-lg shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="w-28 sm:w-36 shrink-0">
                            <input
                              type="number"
                              step="any"
                              value={line.amount}
                              onChange={e => updateConvLine(line.id, { amount: e.target.value })}
                              placeholder="0"
                              className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            />
                          </div>
                          <div className="flex-1 min-w-[140px]">
                            <select
                              value={line.unitKey}
                              onChange={e => updateConvLine(line.id, { unitKey: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            >
                              {LAND_UNIT_OPTIONS.map(opt => (
                                <option key={opt.key} value={opt.key}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Inline Conversion Preview */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs pl-8 sm:pl-0">
                          <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {line.sqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                            </span>{' '}
                            Sq.Ft. ·{' '}
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {line.satak.toFixed(3)}
                            </span>{' '}
                            শতক
                          </div>

                          {convLines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeConvLine(line.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* + Add Option & Reset Bar */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={addConvLine}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Line</span>
                    </button>

                    {convLines.length > 1 && (
                      <button
                        type="button"
                        onClick={resetConvLines}
                        className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        Reset to 1 Item
                      </button>
                    )}

                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      উদাহরণ: ১ কাঠা + ৩ ছটাক + ২০ ব.ফু. (একাধিক জমি একসাথে রূপান্তর করুন)
                    </span>
                  </div>
                </div>

                {/* Total Combined Area Highlight Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                        {convLines.length > 1 ? 'Total Combined Measurement (সর্বমোট সমবায়িক পরিমাপ)' : 'Calculated Measurement (পরিমাপ ফলাফল)'}:
                      </div>
                      <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white mt-0.5">
                        {totalConvSqft.toLocaleString('en-IN', { maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-600 dark:text-slate-300">Sq.Ft. (বর্গফুট)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono">
                      <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">শতক / Decimal</span>
                        <span className="text-base font-black text-blue-700 dark:text-blue-300">
                          {totalConvSatak.toFixed(4)}
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">কাঠা / Katha</span>
                        <span className="text-base font-black text-indigo-700 dark:text-indigo-300">
                          {totalConvKatha.toFixed(4)}
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">বিঘা / Bigha</span>
                        <span className="text-base font-black text-purple-700 dark:text-purple-300">
                          {totalConvBigha.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-200/70 dark:border-blue-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">
                      <strong>পরম্পরাগত ভূমি হিসাব:</strong> {totalConvWbArea.formatted}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyUnitValue('total_sqft', `${totalConvSqft.toFixed(2)} Sq.Ft. (${totalConvSatak.toFixed(4)} Satak)`)}
                      className="text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedUnitKey === 'total_sqft' ? 'Copied!' : 'Copy Summary'}</span>
                    </button>
                  </div>
                </div>

                {/* Equivalent Output Grid Across All 10 Units */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Equivalent Across 10 Standard Units (পশ্চিমবঙ্গ প্রমিত ১০টি এককে সমপরিমাণ মান):
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">1 Click to Copy</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {LAND_UNIT_OPTIONS.map(opt => {
                      const equivalent = totalConvSqft / opt.sqft;
                      const formattedVal = equivalent >= 1000
                        ? equivalent.toLocaleString('en-IN', { maximumFractionDigits: 4 })
                        : equivalent.toFixed(4);
                      const isCopied = copiedUnitKey === opt.key;

                      return (
                        <div
                          key={opt.key}
                          onClick={() => copyUnitValue(opt.key, formattedVal)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group text-left relative"
                          title={`Click to copy ${formattedVal} ${opt.key}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                              {opt.label}
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </span>
                          </div>
                          <div className="text-sm font-mono font-black text-slate-900 dark:text-slate-100 mt-1 truncate">
                            {formattedVal}
                          </div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {opt.banglaDesc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Itemized Table if more than 1 item */}
                {computedConvLines.length > 1 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Itemized Input Breakdown (পৃথক ইনপুট বিবরণী):
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="p-2.5">#</th>
                            <th className="p-2.5">ইনপুট পরিমাণ ও একক</th>
                            <th className="p-2.5">বর্গফুট (Sq.Ft.)</th>
                            <th className="p-2.5">শতক (Decimal)</th>
                            <th className="p-2.5">কাঠা (Katha)</th>
                            <th className="p-2.5">মোটের শতাংশ (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                          {computedConvLines.map((l, i) => (
                            <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="p-2.5 font-bold text-slate-500">{i + 1}</td>
                              <td className="p-2.5 font-sans font-bold text-slate-800 dark:text-slate-200">
                                {l.amount} {l.optLabel}
                              </td>
                              <td className="p-2.5">{l.sqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                              <td className="p-2.5 text-blue-600 dark:text-blue-400 font-bold">{l.satak.toFixed(4)}</td>
                              <td className="p-2.5 text-indigo-600 dark:text-indigo-400">{l.katha.toFixed(4)}</td>
                              <td className="p-2.5 text-slate-500">
                                {totalConvSqft > 0 ? ((l.sqft / totalConvSqft) * 100).toFixed(2) : '0.00'}%
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-blue-50/60 dark:bg-blue-950/30 font-bold text-slate-900 dark:text-slate-100">
                            <td colSpan={2} className="p-2.5 font-sans">সর্বমোট (Grand Total)</td>
                            <td className="p-2.5">{totalConvSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                            <td className="p-2.5 text-blue-600 dark:text-blue-400">{totalConvSatak.toFixed(4)}</td>
                            <td className="p-2.5 text-indigo-600 dark:text-indigo-400">{totalConvKatha.toFixed(4)}</td>
                            <td className="p-2.5">100.00%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
