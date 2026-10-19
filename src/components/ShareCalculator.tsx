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
  FileSpreadsheet,
  Copy,
  Check,
  Sparkles,
  BookOpen
} from 'lucide-react';

// ==========================================
// WEST BENGAL STATUTORY & REVENUE CONSTANTS
// ==========================================

// Traditional Area in Sq. Ft.
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
  pai: 0.046875, // 1 Pai = 0.046875 Sq.Ft.
  til: 0.009375,
  sqft: 1,
  hectare: 107639
};

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
  decimal?: number;
}): number {
  return (
    (params.bigha || 0) * WB_AREA_SQFT.bigha +
    (params.katha || 0) * WB_AREA_SQFT.katha +
    (params.chittak || 0) * WB_AREA_SQFT.chittak +
    (params.ganda || 0) * WB_AREA_SQFT.ganda +
    (params.kara || 0) * WB_AREA_SQFT.kara +
    (params.kranti || 0) * WB_AREA_SQFT.kranti +
    (params.pai || 0) * WB_AREA_SQFT.pai +
    (params.satak || params.decimal || 0) * WB_AREA_SQFT.satak +
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

  const formatted = parts.length > 0 ? parts.join(' ') : `${totalSqft.toFixed(1)} বর্গফুট`;

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

/**
 * Universal safe print helper via invisible iframe
 */
const printHtmlContent = (htmlContent: string) => {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }, 300);
    }
  } catch {
    window.print();
  }
};

// ==========================================
// COMPONENT INTERFACES
// ==========================================

export type CalculatorTab =
  | 'area-to-10000'
  | '10000-to-area'
  | 'ana-to-10000'
  | 'co-sharers'
  | 'farayez'
  | 'converter';

export interface TargetAreaPortion {
  id: string;
  label: string;
  bigha: number;
  katha: number;
  chittak: number;
  sqft: number;
  decimal: number;
  mode: 'katha-chittak-sqft' | 'decimal';
}

export interface WbCoSharerPortion {
  id: string;
  label: string;
  mode: 'area' | 'share';

  // Land Area inputs
  bigha: number;
  katha: number;
  chittak: number;
  gandaArea: number;
  karaArea: number;
  krantiArea: number;
  paiArea: number;
  satak: number;
  sqft: number;

  // Share inputs
  ana: number;
  gandaShare: number;
  karaShare: number;
  krantiShare: number;
  paiShare: number;
  share10000Input?: number;
}

export const ShareCalculator: React.FC = () => {
  const { activeCompany, showToast, language } = useApp();

  // Active Calculator Mode Tab
  const [activeTab, setActiveTab] = useState<CalculatorTab>('area-to-10000');

  // =========================================================
  // MODE 1: AREA TO 10,000 SHARE (USER'S EXACT REQUIREMENT)
  // "if the total plot is 50 decimal or 0.5000 acre and the share
  // to be calculated for 3 katha 2 chittak 30 sqft then the 10000
  // share would be divided to total area of land then sum with the
  // area which need to calculate"
  // =========================================================
  const [areaPlotUnit, setAreaPlotUnit] = useState<'decimal' | 'acre' | 'bigha' | 'katha' | 'sqft'>('decimal');
  const [areaPlotValue, setAreaPlotValue] = useState<string>('50');
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const [areaPortions, setAreaPortions] = useState<TargetAreaPortion[]>([
    {
      id: 'ap_1',
      label: 'Purchased Deed / Portion 1 (ক্রয়কৃত জমি ১)',
      bigha: 0,
      katha: 3,
      chittak: 2,
      sqft: 30,
      decimal: 0,
      mode: 'katha-chittak-sqft'
    }
  ]);

  // Preset example loaders
  const loadExampleUser = () => {
    setAreaPlotUnit('decimal');
    setAreaPlotValue('50');
    setAreaPortions([
      {
        id: 'ap_1',
        label: 'Example: 3 Katha 2 Chittak 30 Sq.Ft.',
        bigha: 0,
        katha: 3,
        chittak: 2,
        sqft: 30,
        decimal: 0,
        mode: 'katha-chittak-sqft'
      }
    ]);
    showToast('Loaded: 50 Decimal Plot with 3 Katha 2 Chittak 30 Sq.Ft.');
  };

  const loadExampleAcre = () => {
    setAreaPlotUnit('acre');
    setAreaPlotValue('0.5000');
    setAreaPortions([
      {
        id: 'ap_1',
        label: 'Example: 3 Katha 2 Chittak 30 Sq.Ft.',
        bigha: 0,
        katha: 3,
        chittak: 2,
        sqft: 30,
        decimal: 0,
        mode: 'katha-chittak-sqft'
      }
    ]);
    showToast('Loaded: 0.5000 Acre Plot with 3 Katha 2 Chittak 30 Sq.Ft.');
  };

  // Add another area to sum
  const addAreaPortion = () => {
    setAreaPortions(prev => [
      ...prev,
      {
        id: 'ap_' + Date.now(),
        label: `Portion ${prev.length + 1} (অংশ ${prev.length + 1})`,
        bigha: 0,
        katha: 1,
        chittak: 0,
        sqft: 0,
        decimal: 0,
        mode: 'katha-chittak-sqft'
      }
    ]);
  };

  const removeAreaPortion = (id: string) => {
    if (areaPortions.length <= 1) return;
    setAreaPortions(prev => prev.filter(p => p.id !== id));
  };

  const updateAreaPortion = (id: string, updates: Partial<TargetAreaPortion>) => {
    setAreaPortions(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Total Plot Calculations
  const totalPlotSqft = useMemo(() => {
    const val = parseFloat(areaPlotValue) || 0;
    if (val <= 0) return 0;
    switch (areaPlotUnit) {
      case 'decimal':
        return val * WB_AREA_SQFT.decimal;
      case 'acre':
        return val * WB_AREA_SQFT.acre;
      case 'bigha':
        return val * WB_AREA_SQFT.bigha;
      case 'katha':
        return val * WB_AREA_SQFT.katha;
      case 'sqft':
        return val;
      default:
        return val * WB_AREA_SQFT.decimal;
    }
  }, [areaPlotValue, areaPlotUnit]);

  const totalPlotDecimal = totalPlotSqft / WB_AREA_SQFT.decimal;
  const totalPlotAcre = totalPlotSqft / WB_AREA_SQFT.acre;
  const totalPlotWbArea = sqftToWbArea(totalPlotSqft);

  // Each Portion Computation
  const computedAreaPortions = useMemo(() => {
    return areaPortions.map(p => {
      let portionSqft = 0;
      if (p.mode === 'katha-chittak-sqft') {
        portionSqft =
          (p.bigha || 0) * WB_AREA_SQFT.bigha +
          (p.katha || 0) * WB_AREA_SQFT.katha +
          (p.chittak || 0) * WB_AREA_SQFT.chittak +
          (p.sqft || 0);
      } else {
        portionSqft = (p.decimal || 0) * WB_AREA_SQFT.decimal;
      }

      const portionDecimal = portionSqft / WB_AREA_SQFT.decimal;
      const shareFraction = totalPlotSqft > 0 ? portionSqft / totalPlotSqft : 0;
      const share10000 = shareFraction * 10000;
      const shareLRKhatian = shareFraction.toFixed(4);
      const sharePct = (shareFraction * 100).toFixed(3) + '%';
      const share16Ana = fractionToWbShare(shareFraction);
      const wbArea = sqftToWbArea(portionSqft);

      return {
        ...p,
        portionSqft,
        portionDecimal,
        shareFraction,
        share10000,
        shareLRKhatian,
        sharePct,
        share16Ana,
        wbArea
      };
    });
  }, [areaPortions, totalPlotSqft]);

  const sumPortionsSqft = useMemo(() => {
    return computedAreaPortions.reduce((acc, p) => acc + p.portionSqft, 0);
  }, [computedAreaPortions]);

  const sumPortionsDecimal = sumPortionsSqft / WB_AREA_SQFT.decimal;
  const sumShareFraction = totalPlotSqft > 0 ? sumPortionsSqft / totalPlotSqft : 0;
  const sum10000Share = sumShareFraction * 10000;
  const sumLRKhatian = sumShareFraction.toFixed(4);
  const sumPct = (sumShareFraction * 100).toFixed(3) + '%';
  const sum16Ana = fractionToWbShare(sumShareFraction);
  const sumWbArea = sqftToWbArea(sumPortionsSqft);

  const remainingSqft = Math.max(0, totalPlotSqft - sumPortionsSqft);
  const remainingDecimal = remainingSqft / WB_AREA_SQFT.decimal;
  const remainingFraction = totalPlotSqft > 0 ? remainingSqft / totalPlotSqft : 0;
  const remaining10000Share = remainingFraction * 10000;
  const remainingLRKhatian = remainingFraction.toFixed(4);
  const remaining16Ana = fractionToWbShare(remainingFraction);
  const remainingWbArea = sqftToWbArea(remainingSqft);

  const copyShareResult = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    showToast('Copied share value to clipboard');
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const printAreaToShareReport = () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>West Bengal 10,000 Share Calculation Certificate</title>
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
            <h2>${activeCompany?.name || 'SRK Legal Chamber'}</h2>
            <div><strong>পশ্চিমবঙ্গ ভূমি ও রাজস্ব আদালত স্বীকৃত ১০,০০০ অংশ ও হিস্যা নির্ধারণ সনদপত্র</strong></div>
            <div style="font-size: 12px; color: #555;">West Bengal Statutory 10,000 Land Share & 16-Ana Apportionment Sheet</div>
            <div style="font-size: 11px; color: #777; margin-top: 4px;">তারিখ: ${new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })} · Chamber Ref: WB-REV-${Date.now().toString().slice(-6)}</div>
          </div>
          <hr />

          <div class="box">
            <div><strong>দাগের মোট জমি (Total Plot Area):</strong> ${areaPlotValue} ${UNIT_LABELS[areaPlotUnit] || areaPlotUnit} = <strong>${totalPlotDecimal.toFixed(3)} শতক</strong> (${totalPlotAcre.toFixed(4)} একর / ${totalPlotSqft.toLocaleString('en-IN')} বর্গফুট / ${totalPlotWbArea.formatted})</div>
            <div style="margin-top: 4px; color: #475569; font-size: 11.5px;">দাগের সম্পূর্ণ অংশ = ১৬ আনা = ১০,০০০ অংশ (Full Share = 10,000)</div>
          </div>

          <h3>হিস্যা নির্ধারিত জমির বিবরণ (Portions Calculated):</h3>
          <table>
            <thead>
              <tr>
                <th>বিবরণ / অংশীদার</th>
                <th>জমির পরিমাণ (কাঠা-ছটাক-বর্গফুট)</th>
                <th>শতক (Decimal)</th>
                <th>বর্গফুট (Sq.Ft.)</th>
                <th>১০,০০০ হিস্যা (LR Share)</th>
                <th>১৬ আনা হিস্যা</th>
                <th>শতাংশ (%)</th>
              </tr>
            </thead>
            <tbody>
              ${computedAreaPortions.map((p, idx) => `
                <tr>
                  <td><strong>${idx + 1}. ${p.label}</strong></td>
                  <td><strong>${p.wbArea.formatted}</strong></td>
                  <td class="mono">${p.portionDecimal.toFixed(3)}</td>
                  <td class="mono">${p.portionSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                  <td class="mono highlight" style="color: #1E3A8A;">${p.share10000.toFixed(2)} (${p.shareLRKhatian})</td>
                  <td style="color: #4338CA; font-weight: bold;">${p.share16Ana.formatted}</td>
                  <td class="mono">${p.sharePct}</td>
                </tr>
              `).join('')}
              <tr class="highlight" style="background: #E0E7FF;">
                <td><strong>সর্বমোট অংশ (Sum of Portions)</strong></td>
                <td><strong>${sumWbArea.formatted}</strong></td>
                <td class="mono"><strong>${sumPortionsDecimal.toFixed(3)}</strong></td>
                <td class="mono"><strong>${sumPortionsSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</strong></td>
                <td class="mono" style="font-size: 13px; color: #1E3A8A;"><strong>${sum10000Share.toFixed(2)} (${sumLRKhatian})</strong></td>
                <td style="color: #3730A3;"><strong>${sum16Ana.formatted}</strong></td>
                <td class="mono"><strong>${sumPct}</strong></td>
              </tr>
              <tr style="background: #FEF3C7;">
                <td style="color: #92400E;"><strong>অবশিষ্ট জমি (Remaining in Plot)</strong></td>
                <td style="color: #92400E;"><strong>${remainingWbArea.formatted}</strong></td>
                <td class="mono" style="color: #92400E;">${remainingDecimal.toFixed(3)}</td>
                <td class="mono" style="color: #92400E;">${remainingSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                <td class="mono" style="color: #92400E;"><strong>${remaining10000Share.toFixed(2)} (${remainingLRKhatian})</strong></td>
                <td style="color: #92400E;">${remaining16Ana.formatted}</td>
                <td class="mono" style="color: #92400E;">${((remainingSqft / totalPlotSqft) * 100).toFixed(3)}%</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 18px; padding: 10px; background: #F1F5F9; border-radius: 6px; font-size: 11px;">
            <strong>গণনার সূত্র (Mathematical Formula):</strong><br />
            ১০,০০০ অংশ = (নির্ধারিত জমির বর্গফুট ÷ দাগের মোট জমির বর্গফুট) × ১০,০০০<br />
            = (${sumPortionsSqft.toLocaleString('en-IN')} ÷ ${totalPlotSqft.toLocaleString('en-IN')}) × ১০,০০০ = <strong>${sum10000Share.toFixed(2)} / ১০০০০</strong> (বা LR খতিয়ানে <strong>${sumLRKhatian}</strong>)
          </div>

          <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px;">
            <div>West Bengal Land Reforms Manual Standard · SRK Case Manager</div>
            <div>রাজস্ব আইনজীবী / মুহুরী স্বাক্ষর: _________________________</div>
          </div>
        </body>
      </html>
    `;
    printHtmlContent(html);
  };

  // =========================================================
  // MODE 2: 10,000 SHARE TO LAND AREA
  // =========================================================
  const [s2aPlotUnit, setS2aPlotUnit] = useState<'decimal' | 'acre' | 'bigha' | 'sqft'>('decimal');
  const [s2aPlotValue, setS2aPlotValue] = useState<string>('50');
  const [s2aShare10000, setS2aShare10000] = useState<string>('1046.83');

  const s2aComputed = useMemo(() => {
    const plotVal = parseFloat(s2aPlotValue) || 0;
    const shareVal = parseFloat(s2aShare10000) || 0;
    if (plotVal <= 0 || shareVal <= 0) return null;

    let plotSqft = 0;
    switch (s2aPlotUnit) {
      case 'decimal':
        plotSqft = plotVal * WB_AREA_SQFT.decimal;
        break;
      case 'acre':
        plotSqft = plotVal * WB_AREA_SQFT.acre;
        break;
      case 'bigha':
        plotSqft = plotVal * WB_AREA_SQFT.bigha;
        break;
      case 'sqft':
        plotSqft = plotVal;
        break;
    }

    const fraction = shareVal > 1 ? shareVal / 10000 : shareVal;
    const targetSqft = fraction * plotSqft;
    const targetDecimal = targetSqft / WB_AREA_SQFT.decimal;
    const targetAcre = targetSqft / WB_AREA_SQFT.acre;
    const targetWbArea = sqftToWbArea(targetSqft);
    const target16Ana = fractionToWbShare(fraction);

    const remSqft = Math.max(0, plotSqft - targetSqft);
    const remDecimal = remSqft / WB_AREA_SQFT.decimal;
    const remWbArea = sqftToWbArea(remSqft);

    return {
      plotSqft,
      fraction,
      targetSqft,
      targetDecimal,
      targetAcre,
      targetWbArea,
      target16Ana,
      remSqft,
      remDecimal,
      remWbArea
    };
  }, [s2aPlotValue, s2aPlotUnit, s2aShare10000]);

  // =========================================================
  // MODE 3: 16-ANA TO 10,000 SHARE & AREA
  // =========================================================
  const [a2sPlotUnit, setA2sPlotUnit] = useState<'decimal' | 'acre' | 'bigha'>('decimal');
  const [a2sPlotValue, setA2sPlotValue] = useState<string>('50');
  const [a2sAna, setA2sAna] = useState<number>(1);
  const [a2sGanda, setA2sGanda] = useState<number>(13);
  const [a2sKara, setA2sKara] = useState<number>(1);
  const [a2sKranti, setA2sKranti] = useState<number>(2);
  const [a2sPai, setA2sPai] = useState<number>(1);

  const a2sComputed = useMemo(() => {
    const plotVal = parseFloat(a2sPlotValue) || 0;
    let plotSqft = 0;
    switch (a2sPlotUnit) {
      case 'decimal':
        plotSqft = plotVal * WB_AREA_SQFT.decimal;
        break;
      case 'acre':
        plotSqft = plotVal * WB_AREA_SQFT.acre;
        break;
      case 'bigha':
        plotSqft = plotVal * WB_AREA_SQFT.bigha;
        break;
    }

    const frac = wbShareToFraction(a2sAna, a2sGanda, a2sKara, a2sKranti, a2sPai);
    const share10000 = frac * 10000;
    const lrKhatian = frac.toFixed(4);
    const targetSqft = frac * plotSqft;
    const targetDecimal = targetSqft / WB_AREA_SQFT.decimal;
    const targetWbArea = sqftToWbArea(targetSqft);

    return {
      frac,
      share10000,
      lrKhatian,
      targetSqft,
      targetDecimal,
      targetWbArea
    };
  }, [a2sPlotValue, a2sPlotUnit, a2sAna, a2sGanda, a2sKara, a2sKranti, a2sPai]);

  // =========================================================
  // MODE 4: CO-SHARER DAG PARTITION & RECONCILIATION
  // =========================================================
  const [totalArea, setTotalArea] = useState<string>('50');
  const [totalUnit, setTotalUnit] = useState<string>('satak');

  const [portions, setPortions] = useState<WbCoSharerPortion[]>([
    {
      id: 'p_1',
      label: 'Co-Sharer A (অংশীদার ১)',
      mode: 'area',
      bigha: 0,
      katha: 3,
      chittak: 2,
      gandaArea: 0,
      karaArea: 0,
      krantiArea: 0,
      paiArea: 0,
      satak: 0,
      sqft: 30,
      ana: 0,
      gandaShare: 0,
      karaShare: 0,
      krantiShare: 0,
      paiShare: 0
    },
    {
      id: 'p_2',
      label: 'Co-Sharer B (অংশীদার ২)',
      mode: 'area',
      bigha: 1,
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

  const [shareResult, setShareResult] = useState<any>(null);

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
    setPortions(prev => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  };

  const calculateWbShare = () => {
    const totalVal = parseFloat(totalArea) || 0;
    if (totalVal <= 0) {
      showToast('Enter valid total land area', 'error');
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

    showToast('Co-sharer 10,000 share calculation completed');
  };

  const printShareReport = () => {
    if (!shareResult) return;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>West Bengal 10000 Share & 16-Ana Land Distribution Report</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 36px; color: #111; line-height: 1.5; font-size: 13px; }
            h2, h3 { margin: 0 0 4px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 10px 0 14px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
            th, td { border: 1px solid #777; padding: 7px 8px; text-align: left; }
            th { background: #E2E8F0; font-weight: bold; }
            .mono { font-family: monospace; font-size: 11px; }
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
    `;
    printHtmlContent(html);
  };

  // =========================================================
  // MODE 5: MUSLIM FARAYEZ INHERITANCE
  // =========================================================
  const [farayezTotal, setFarayezTotal] = useState<string>('50');
  const [farayezUnit, setFarayezUnit] = useState<string>('Satak');
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
  const [husbandCount, setHusbandCount] = useState<number>(0);
  const [wifeCount, setWifeCount] = useState<number>(1);
  const [sonsCount, setSonsCount] = useState<number>(2);
  const [daughtersCount, setDaughtersCount] = useState<number>(1);
  const [fatherAlive, setFatherAlive] = useState<boolean>(false);
  const [motherAlive, setMotherAlive] = useState<boolean>(true);
  const [farayezResult, setFarayezResult] = useState<any[] | null>(null);

  const calculateFarayez = () => {
    const totalVal = parseFloat(farayezTotal) || 0;
    if (totalVal <= 0) {
      showToast('Enter total property value or land quantity', 'error');
      return;
    }

    const hasChildren = sonsCount > 0 || daughtersCount > 0;
    let shares: any[] = [];
    let totalFixedFraction = 0;

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

    if (fatherAlive && hasChildren) {
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

    const enrichedShares = shares.map(s => {
      const share10000 = (s.fracVal || 0) * 10000;
      const wbShare = fractionToWbShare(s.fracVal || 0);

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
    showToast('Islamic Farayez calculated with 10000 & 16-Ana shares');
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
            h2, h3 { margin: 0 0 4px 0; color: #047857; }
            hr { border: none; border-top: 1.5px solid #047857; margin: 10px 0 14px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
            th, td { border: 1px solid #777; padding: 7px 8px; text-align: left; }
            th { background: #D1FAE5; font-weight: bold; }
            .mono { font-family: monospace; font-size: 11px; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'SRK Legal Chamber'}</h2>
            <div><strong>সুন্নি হানাফি আইন অনুসারে মুসলিম ফারায়েজ বণ্টন সনদপত্র</strong></div>
            <div style="font-size: 12px; color: #555;">Hanafi Sunni Inheritance Distribution (16-Ana & WB Land Units)</div>
            <div style="font-size: 11px; color: #777; margin-top: 4px;">সম্পত্তির পরিমাণ: ${parseFloat(farayezTotal).toLocaleString('en-IN')} ${farayezUnit} | মৃত ব্যক্তি: ${deceasedGender === 'male' ? 'পুরুষ (মরহুম)' : 'নারী (মরহুমা)'}</div>
          </div>
          <hr />
          <table>
            <thead>
              <tr>
                <th>ওয়ারিশান (Legal Heir)</th>
                <th>কোরআনিক অংশ (Fraction)</th>
                <th>১৬ আনা হিস্যা</th>
                <th>১০,০০০ অংশ (LR Format)</th>
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
                <td class="mono"><strong>${r.shareVal.toLocaleString('en-IN', { maximumFractionDigits: 3 })} ${farayezUnit}</strong></td>
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
    `;
    printHtmlContent(html);
  };

  // =========================================================
  // MODE 6: LIVE UNIT CONVERTER
  // =========================================================
  const [convKatha, setConvKatha] = useState<number>(3);
  const [convChittak, setConvChittak] = useState<number>(2);
  const [convSqft, setConvSqft] = useState<number>(30);
  const [convGanda, setConvGanda] = useState<number>(0);
  const [convKara, setConvKara] = useState<number>(0);
  const [convKranti, setConvKranti] = useState<number>(0);
  const [convPai, setConvPai] = useState<number>(0);

  const convTotalSqft = useMemo(() => {
    return wbAreaToSqft({
      katha: convKatha,
      chittak: convChittak,
      sqft: convSqft,
      ganda: convGanda,
      kara: convKara,
      kranti: convKranti,
      pai: convPai
    });
  }, [convKatha, convChittak, convSqft, convGanda, convKara, convKranti, convPai]);

  const convWbArea = useMemo(() => {
    return sqftToWbArea(convTotalSqft);
  }, [convTotalSqft]);

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Header and 6 Iconic Mode Selectors */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-blue-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {language === 'bn' ? 'হিস্যা ক্যালকুলেটর (Share Calculator)' : 'Share Calculator'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'সকল ধরনের হিস্যা গণনা: জমির পরিমাণ ➔ হিস্যা, হিস্যা ➔ জমি, ১৬ আনা রূপান্তর ও ফারায়েজ।'
                  : 'Complete share calculation suite: Area to Share, Share to Area, 16-Ana conversion, and Farayez partition.'}
              </p>
            </div>
          </div>
        </div>

        {/* 6 Clean Iconic Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Tab 1: Area -> 10,000 Share */}
          <button
            type="button"
            onClick={() => setActiveTab('area-to-10000')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'area-to-10000'
                ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-600 ring-2 ring-blue-600/30 text-blue-950 dark:text-blue-100 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                Primary
              </span>
            </div>
            <div className="text-xs font-bold truncate">Area ➔ 10,000</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">জমির পরিমাণ ➔ হিস্যা</div>
          </button>

          {/* Tab 2: 10,000 Share -> Area */}
          <button
            type="button"
            onClick={() => setActiveTab('10000-to-area')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === '10000-to-area'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-950 dark:text-emerald-100 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                Reverse
              </span>
            </div>
            <div className="text-xs font-bold truncate">10,000 ➔ Area</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">১০,০০০ হিস্যা ➔ জমি</div>
          </button>

          {/* Tab 3: 16-Ana -> 10,000 */}
          <button
            type="button"
            onClick={() => setActiveTab('ana-to-10000')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'ana-to-10000'
                ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-600 ring-2 ring-purple-600/30 text-purple-950 dark:text-purple-100 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Percent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                Ana
              </span>
            </div>
            <div className="text-xs font-bold truncate">16-Ana ➔ 10,000</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">আনা-গণ্ডা ➔ অংশ</div>
          </button>

          {/* Tab 4: Co-Sharers Partition */}
          <button
            type="button"
            onClick={() => setActiveTab('co-sharers')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'co-sharers'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-600 ring-2 ring-indigo-600/30 text-indigo-950 dark:text-indigo-100 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                Multi
              </span>
            </div>
            <div className="text-xs font-bold truncate">Co-Sharer Dag</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">দাগের হিস্যা বণ্টন</div>
          </button>

          {/* Tab 5: Muslim Farayez */}
          <button
            type="button"
            onClick={() => setActiveTab('farayez')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'farayez'
                ? 'bg-teal-50/80 dark:bg-teal-950/50 border-teal-600 ring-2 ring-teal-600/30 text-teal-950 dark:text-teal-100 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Scale className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                Sharia
              </span>
            </div>
            <div className="text-xs font-bold truncate">Muslim Farayez</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">ফারায়েজ ওয়ারিশান</div>
          </button>

          {/* Tab 6: Unit Converter */}
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'converter'
                ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-600 ring-2 ring-amber-600/30 text-amber-950 dark:text-amber-100 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                Units
              </span>
            </div>
            <div className="text-xs font-bold truncate">Unit Converter</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">পরিমাপ রূপান্তরক</div>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: LAND AREA TO 10,000 SHARE & 16-ANA (USER'S EXACT SPEC) */}
      {/* ========================================================= */}
      {activeTab === 'area-to-10000' && (
        <div className="space-y-4">
          {/* Statutory Revenue Principle & Formula Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider">
                  Revenue Formula
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  ১০,০০০ হিস্যা = (১০,০০০ ÷ দাগের মোট জমি) × নির্ণয়যোগ্য জমির ক্ষেত্রফল
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                10,000 Share Rule: The 10,000 share is divided by the total plot area (rate per unit area), then multiplied with or summed for the target land portions (e.g., 3 Katha 2 Chittak 30 Sq.Ft. out of 50 Decimal).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Quick Scenarios:</span>
              <button
                type="button"
                onClick={loadExampleUser}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 hover:bg-blue-100/70 font-bold text-blue-700 dark:text-blue-300 cursor-pointer shadow-2xs text-[11px] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                50 Dec ➔ 3K 2Ch 30Sqft
              </button>
              <button
                type="button"
                onClick={loadExampleAcre}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 hover:bg-blue-100/70 font-bold text-blue-700 dark:text-blue-300 cursor-pointer shadow-2xs text-[11px] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                0.5000 Ac ➔ 3K 2Ch 30Sqft
              </button>
            </div>
          </div>

          {/* Section 1: Total Plot Area */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>1. Total Plot Area (দাগের মোট জমি / সম্পূর্ণ জোত)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                সম্পূর্ণ দাগ = ১০,০০০ অংশ (10,000 Share) = ১৬ আনা = 1.0000
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Total Plot Quantity (দাগের মোট পরিমাণ) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={areaPlotValue}
                  onChange={e => setAreaPlotValue(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-sm font-mono font-extrabold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Plot Measurement Unit (একক) *
                </label>
                <select
                  value={areaPlotUnit}
                  onChange={e => setAreaPlotUnit(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                >
                  <option value="decimal">Decimal / Satak (শতক / ডেসিমেল — ১ শতক = ৪৩৫.৬ বর্গফুট)</option>
                  <option value="acre">Acre (একর — ১ একর = ১০০ শতক = ৪৩,৫৬০ বর্গফুট)</option>
                  <option value="bigha">Bigha (বিঘা — ১ বিঘা = ২০ কাঠা = ১৪,৪০০ বর্গফুট)</option>
                  <option value="katha">Katha (কাঠা — ১ কাঠা = ১৬ ছটাক = ৭২০ বর্গফুট)</option>
                  <option value="sqft">Square Feet (বর্গফুট)</option>
                </select>
              </div>
            </div>

            {/* Total Plot Converted Summary Badge */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                দাগের মোট পরিমাপ: <strong className="text-blue-700 dark:text-blue-400 font-mono">{totalPlotSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Sq.Ft.</strong>
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                <span>{totalPlotDecimal.toFixed(3)} শতক</span>
                <span>•</span>
                <span>{totalPlotAcre.toFixed(4)} একর</span>
                <span>•</span>
                <span className="font-sans font-bold text-slate-800 dark:text-slate-200">{totalPlotWbArea.formatted}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Target Land Area to Calculate & Sum */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  2. Land Area to Calculate &amp; Sum (যে জমির ১০,০০০ হিস্যা নির্ণয় করতে হবে)
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  কাঠা, ছটাক ও বর্গফুট লিখুন। একাধিক অংশ যোগ করার জন্য নিচে "+ Add Another Area" বাটন চাপুন।
                </div>
              </div>
              <button
                type="button"
                onClick={addAreaPortion}
                className="self-start sm:self-auto px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Another Area to Sum (আরও জমি যোগ করুন)
              </button>
            </div>

            {/* List of portions */}
            <div className="space-y-3">
              {areaPortions.map((p, idx) => {
                const comp = computedAreaPortions.find(x => x.id === p.id);

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-850 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={p.label}
                          onChange={e => updateAreaPortion(p.id, { label: e.target.value })}
                          placeholder="Portion name or Deed reference"
                          className="px-2.5 py-1 text-xs font-bold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 w-64 sm:w-80"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Mode: Katha-Chittak-SqFt vs Direct Decimal */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => updateAreaPortion(p.id, { mode: 'katha-chittak-sqft' })}
                            className={`px-2 py-0.8 rounded-md transition-colors ${
                              p.mode === 'katha-chittak-sqft'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            Katha-Chittak-SqFt
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAreaPortion(p.id, { mode: 'decimal' })}
                            className={`px-2 py-0.8 rounded-md transition-colors ${
                              p.mode === 'decimal'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            Decimal
                          </button>
                        </div>

                        {areaPortions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAreaPortion(p.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                            title="Remove Portion"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inputs */}
                    {p.mode === 'katha-chittak-sqft' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Katha (কাঠা)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={p.katha || ''}
                            onChange={e => updateAreaPortion(p.id, { katha: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
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
                            onChange={e => updateAreaPortion(p.id, { chittak: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                            Square Feet (বর্গফুট) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={p.sqft || ''}
                            onChange={e => updateAreaPortion(p.id, { sqft: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-900 font-mono font-bold text-blue-700 dark:text-blue-300"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Optional Bigha (বিঘা)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={p.bigha || ''}
                            onChange={e => updateAreaPortion(p.id, { bigha: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-xs text-xs">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Decimal / Satak (শতক)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={p.decimal || ''}
                          onChange={e => updateAreaPortion(p.id, { decimal: parseFloat(e.target.value) || 0 })}
                          placeholder="e.g. 5.234"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                        />
                      </div>
                    )}

                    {/* Live Badge for Portion */}
                    {comp && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] border-t border-slate-200 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">এই অংশের পরিমাণ:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{comp.wbArea.formatted}</span>
                          <span className="font-mono text-slate-500">({comp.portionSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Sq.Ft. = {comp.portionDecimal.toFixed(3)} শতক)</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-extrabold text-blue-700 dark:text-blue-400 text-xs">
                            ১০,০০০ হিস্যা: {comp.share10000.toFixed(2)}
                          </span>
                          <span className="text-slate-400">({comp.shareLRKhatian})</span>
                          <span>•</span>
                          <span className="text-purple-700 dark:text-purple-300 font-sans font-semibold">
                            {comp.share16Ana.formatted}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Detailed Live Results & Mathematical Formula Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3. Calculation Result &amp; Revenue Formula (১০,০০০ অংশ ও অবশিষ্ট হিসাব)</span>
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => copyShareResult(`${sum10000Share.toFixed(2)} (LR: ${sumLRKhatian})`)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                  title="Copy 10,000 Share Value"
                >
                  {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedShare ? 'Copied!' : 'Copy Share'}</span>
                </button>
                <button
                  type="button"
                  onClick={printAreaToShareReport}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Calculation Sheet</span>
                </button>
              </div>
            </div>

            {/* Top 4 Prominent Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Card 1: 10,000 Share */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex flex-col justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  10,000 Share (দশ হাজারী হিস্যা)
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-blue-900 dark:text-blue-100 my-1">
                  {sum10000Share.toFixed(2)}
                </div>
                <div className="text-[11px] font-mono text-blue-700 dark:text-blue-300">
                  LR Khatian: <strong>{sumLRKhatian}</strong> / ১.০০০০
                </div>
              </div>

              {/* Card 2: Calculated Land Area */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex flex-col justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Total Calculated Area (মোট জমি)
                </div>
                <div className="text-lg sm:text-xl font-black text-emerald-900 dark:text-emerald-100 my-1 truncate">
                  {sumWbArea.formatted}
                </div>
                <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                  {sumPortionsDecimal.toFixed(3)} শতক ({sumPortionsSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Sq.Ft.)
                </div>
              </div>

              {/* Card 3: 16-Ana Traditional Share */}
              <div className="p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 flex flex-col justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  16-Ana Traditional Share (১৬ আনা)
                </div>
                <div className="text-sm sm:text-base font-extrabold text-purple-900 dark:text-purple-100 my-1 truncate">
                  {sum16Ana.formatted}
                </div>
                <div className="text-[11px] font-mono text-purple-700 dark:text-purple-300">
                  Percentage: <strong>{sumPct}</strong>
                </div>
              </div>

              {/* Card 4: Remaining in Plot */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Remaining Land (দাগে অবশিষ্ট জমি)
                </div>
                <div className="text-sm sm:text-base font-extrabold text-amber-900 dark:text-amber-100 my-1 truncate">
                  {remainingWbArea.formatted}
                </div>
                <div className="text-[11px] font-mono text-amber-700 dark:text-amber-300">
                  {remainingDecimal.toFixed(3)} শতক ({remaining10000Share.toFixed(2)} হিস্যা)
                </div>
              </div>
            </div>

            {/* Step-by-Step Educational Mathematical Formula Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs space-y-2">
              <div className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>পশ্চিমবঙ্গ ভূমি রাজস্ব গণনার নিয়ম ও বিশদ ধাপ (Step-by-Step Mathematical Proof):</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <div>
                  <strong>ধাপ ১ (দাগের মোট ক্ষেত্রফল):</strong> {areaPlotValue} {UNIT_LABELS[areaPlotUnit] || areaPlotUnit} = <strong>{totalPlotSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} বর্গফুট</strong> ({totalPlotDecimal.toFixed(3)} শতক / {totalPlotAcre.toFixed(4)} একর)
                </div>
                <div>
                  <strong>ধাপ ২ (নির্ধারিত জমির ক্ষেত্রফল):</strong> {sumWbArea.formatted} = <strong>{sumPortionsSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} বর্গফুট</strong> ({sumPortionsDecimal.toFixed(3)} শতক)
                </div>
                <div className="p-3 rounded-lg bg-blue-100/70 dark:bg-blue-900/40 text-blue-950 dark:text-blue-100 font-bold space-y-1">
                  <div className="text-xs text-blue-800 dark:text-blue-200 font-extrabold uppercase tracking-wide">
                    ধাপ ৩ (১০,০০০ হিস্যার আনুষ্ঠানিক গাণিতিক সূত্র ও প্রতিপাদন):
                  </div>
                  <div>
                    ১) প্রতি বর্গফুটে হিস্যার হার = ১০,০০০ ÷ দাগের মোট ক্ষেত্রফল = ১০,০০০ ÷ {totalPlotSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} = {(10000 / (totalPlotSqft || 1)).toFixed(6)}
                  </div>
                  <div>
                    ২) মোট ১০,০০০ হিস্যা = (১০,০০০ ÷ দাগের মোট ক্ষেত্রফল) × নির্ণয়যোগ্য জমির ক্ষেত্রফল <br />
                    = ({10000} ÷ {totalPlotSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })}) × {sumPortionsSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} <br />
                    = <strong>{sum10000Share.toFixed(2)}</strong> (LR খতিয়ানে ৪ দশমিক আকারে: <strong>{sumLRKhatian}</strong> / ১.০০০০)
                  </div>
                </div>
                <div>
                  <strong>ধাপ ৪ (১৬ আনা হিস্যা রূপান্তর):</strong> {sum16Ana.formatted} ({sumPct})
                </div>
                <div>
                  <strong>ধাপ ৫ (দাগে অবশিষ্ট অবণ্টিত জমি):</strong> {totalPlotSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} - {sumPortionsSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} = <strong>{remainingSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} বর্গফুট</strong> = {remainingWbArea.formatted} ({remainingDecimal.toFixed(3)} শতক, হিস্যা {remaining10000Share.toFixed(2)})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: 10,000 SHARE TO LAND AREA */}
      {/* ========================================================= */}
      {activeTab === '10000-to-area' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4" />
                <span>10,000 Share to Land Area (১০,০০০ হিস্যা থেকে জমির পরিমাণ নির্ণয়)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                LR খতিয়ানের ১০,০০০ অংশ বা ০.xxxx দশমিক লিখুন—তা তৎক্ষণাৎ শতক, কাঠা, ছটাক এবং বর্গফুটে বের হবে।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Total Plot Quantity (দাগের মোট জমি) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={s2aPlotValue}
                  onChange={e => setS2aPlotValue(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Unit (একক) *
                </label>
                <select
                  value={s2aPlotUnit}
                  onChange={e => setS2aPlotUnit(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="decimal">Decimal / Satak (শতক)</option>
                  <option value="acre">Acre (একর)</option>
                  <option value="bigha">Bigha (বিঘা)</option>
                  <option value="sqft">Square Feet (বর্গফুট)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                  10,000 Share / LR Decimal (হিস্যা) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={s2aShare10000}
                  onChange={e => setS2aShare10000(e.target.value)}
                  placeholder="e.g. 1046.83 or 0.1047"
                  className="w-full px-3 py-2 text-sm font-mono font-black rounded-lg border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300"
                />
                <span className="text-[10px] text-slate-400">Example: 1046.83 or 0.1047</span>
              </div>
            </div>

            {/* Results Cards */}
            {s2aComputed && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                    <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                      Land in Traditional Units (কাঠা-ছটাক)
                    </div>
                    <div className="text-base font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
                      {s2aComputed.targetWbArea.formatted}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80">
                    <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                      Satak / Decimal (শতক)
                    </div>
                    <div className="text-xl font-black font-mono text-blue-900 dark:text-blue-100 mt-1">
                      {s2aComputed.targetDecimal.toFixed(3)} শতক
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80">
                    <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                      Square Feet (বর্গফুট)
                    </div>
                    <div className="text-lg font-black font-mono text-indigo-900 dark:text-indigo-100 mt-1">
                      {s2aComputed.targetSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Sq.Ft.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80">
                    <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                      16-Ana Share Equivalent
                    </div>
                    <div className="text-sm font-extrabold text-purple-900 dark:text-purple-100 mt-1 truncate">
                      {s2aComputed.target16Ana.formatted}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  গণনার সূত্র: জমি = ({parseFloat(s2aShare10000) > 1 ? `${s2aShare10000} ÷ ১০০০০` : s2aShare10000}) × {s2aComputed.plotSqft.toLocaleString('en-IN')} বর্গফুট = <strong>{s2aComputed.targetSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} বর্গফুট</strong> = <strong>{s2aComputed.targetWbArea.formatted}</strong> ({s2aComputed.targetDecimal.toFixed(3)} শতক)
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 3: 16-ANA TO 10,000 SHARE & AREA */}
      {/* ========================================================= */}
      {activeTab === 'ana-to-10000' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Percent className="w-4 h-4" />
                <span>16-Ana Traditional Share to 10,000 Share &amp; Area (১৬ আনা থেকে ১০,০০০ অংশ ও জমি)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                আনা, গণ্ডা, কড়া, ক্রান্তি ও পাই লিখলে তা ১০,০০০ অংশ এবং সমপরিমাণ জমিতে হিসাব হবে।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Total Plot Quantity (দাগের মোট জমি)
                </label>
                <input
                  type="number"
                  step="any"
                  value={a2sPlotValue}
                  onChange={e => setA2sPlotValue(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Unit (একক)
                </label>
                <select
                  value={a2sPlotUnit}
                  onChange={e => setA2sPlotUnit(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="decimal">Decimal / Satak (শতক)</option>
                  <option value="acre">Acre (একর)</option>
                  <option value="bigha">Bigha (বিঘা)</option>
                </select>
              </div>
            </div>

            {/* 16-Ana Inputs */}
            <div>
              <div className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1.5">
                16-Ana Input Units (আনা, গণ্ডা, কড়া, ক্রান্তি, পাই):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ana (আনা) [০-১৬]</label>
                  <input
                    type="number"
                    min="0"
                    max="16"
                    value={a2sAna}
                    onChange={e => setA2sAna(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-purple-400 bg-white dark:bg-slate-800 font-mono font-bold text-purple-700 dark:text-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ganda (গণ্ডা) [০-১৯]</label>
                  <input
                    type="number"
                    min="0"
                    max="19"
                    value={a2sGanda}
                    onChange={e => setA2sGanda(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Kara (কড়া) [০-৩]</label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={a2sKara}
                    onChange={e => setA2sKara(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Kranti (ক্রান্তি) [০-২]</label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    value={a2sKranti}
                    onChange={e => setA2sKranti(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Pai (পাই) [০-৩]</label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={a2sPai}
                    onChange={e => setA2sPai(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80">
                <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                  10,000 Share (দশ হাজারী হিস্যা)
                </div>
                <div className="text-xl font-black font-mono text-purple-900 dark:text-purple-100 mt-1">
                  {a2sComputed.share10000.toFixed(2)}
                </div>
                <div className="text-[11px] font-mono text-purple-700 dark:text-purple-300">
                  LR Parcha: <strong>{a2sComputed.lrKhatian}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80">
                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                  Satak / Decimal
                </div>
                <div className="text-xl font-black font-mono text-blue-900 dark:text-blue-100 mt-1">
                  {a2sComputed.targetDecimal.toFixed(3)} শতক
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                  Katha-Chittak Area
                </div>
                <div className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100 mt-1 truncate">
                  {a2sComputed.targetWbArea.formatted}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80">
                <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                  Square Feet
                </div>
                <div className="text-base font-black font-mono text-indigo-900 dark:text-indigo-100 mt-1">
                  {a2sComputed.targetSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Sq.Ft.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 4: CO-SHARER DAG PARTITION & RECONCILIATION */}
      {/* ========================================================= */}
      {activeTab === 'co-sharers' && (
        <div className="space-y-4">
          {/* Card 1: Total Land */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Total Plot Land Area (দাগের মোট জমি)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">16 Ana = 10,000 Share</span>
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
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Unit (একক) *
                </label>
                <select
                  value={totalUnit}
                  onChange={e => setTotalUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  <option value="satak">Satak / Decimal (শতক / ডেসিমেল)</option>
                  <option value="acre">Acre (একর)</option>
                  <option value="bigha">Bigha (বিঘা)</option>
                  <option value="katha">Katha (কাঠা)</option>
                  <option value="chittak">Chittak (ছটাক)</option>
                  <option value="sqft">Square Feet (বর্গফুট)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Co-Sharers Portions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Co-Sharer Apportionment (অংশীদারদের অংশ ও হিস্যা)
              </span>
              <button
                type="button"
                onClick={addPortion}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer"
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
                          Land Area (কাঠা/ছটাক/বর্গফুট)
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

                  {p.mode === 'area' ? (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Land Area Units (কাঠা, ছটাক, বর্গফুট, গণ্ডা ও শতক):
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Katha (কাঠা)</label>
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
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Chittak (ছটাক)</label>
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
                          <label className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">Sq.Ft. (বর্গফুট) *</label>
                          <input
                            type="number"
                            min="0"
                            value={p.sqft || ''}
                            onChange={e => updatePortion(idx, 'sqft', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-900 font-mono font-bold text-blue-700 dark:text-blue-300"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">or Satak (শতক)</label>
                          <input
                            type="number"
                            step="any"
                            value={p.satak || ''}
                            onChange={e => updatePortion(idx, 'satak', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ganda (গণ্ডা)</label>
                          <input
                            type="number"
                            min="0"
                            max="19"
                            value={p.gandaArea || ''}
                            onChange={e => updatePortion(idx, 'gandaArea', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Bigha (বিঘা)</label>
                          <input
                            type="number"
                            min="0"
                            value={p.bigha || ''}
                            onChange={e => updatePortion(idx, 'bigha', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5">
                        Traditional 16-Ana Share (আনা, গণ্ডা, কড়া, ক্রান্তি, পাই হিস্যা):
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ana (আনা) [০-১৬]</label>
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
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Ganda (গণ্ডা) [০-১৯]</label>
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
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Kara (কড়া) [০-৩]</label>
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
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Kranti (ক্রান্তি) [০-২]</label>
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
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Pai (পাই) [০-৩]</label>
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
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">or 10,000 Share</label>
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
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                  <span>•</span>
                  <span>{shareResult.totalSqft.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Sq.Ft.</span>
                  <span>•</span>
                  <span className="font-bold">১৬ আনা (১০,০০০ অংশ)</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Co-Sharer (অংশীদার)</th>
                      <th className="py-2.5 px-3">১৬ আনা হিস্যা</th>
                      <th className="py-2.5 px-3">১০,০০০ অংশ (LR Format)</th>
                      <th className="py-2.5 px-3">বন্টিত জমি (কাঠা-ছটাক)</th>
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
      {/* MODE 5: MUSLIM FARAYEZ */}
      {/* ========================================================= */}
      {activeTab === 'farayez' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
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
                  placeholder="e.g. 50"
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
                  <option value="Satak">Satak / Decimal (শতক)</option>
                  <option value="Acre">Acre (একর)</option>
                  <option value="Bigha">Bigha (বিঘা)</option>
                  <option value="Katha">Katha (কাঠা)</option>
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
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-teal-700 hover:bg-teal-800 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <Scale className="w-4 h-4" /> Calculate Farayez Inheritance (ফারায়েজ বণ্টন হিসাব করুন)
              </button>
            </div>
          </div>

          {/* Farayez Result Table */}
          {farayezResult && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Farayez Apportionment Table (ওয়ারিশানদের মধ্যে বণ্টন তালিকা)</span>
                </span>
                <button
                  type="button"
                  onClick={printFarayezReport}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
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

      {/* ========================================================= */}
      {/* MODE 6: LIVE UNIT CONVERTER & SURVEY REFERENCE */}
      {/* ========================================================= */}
      {activeTab === 'converter' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <span>West Bengal Land Area Live Converter (কাঠা-ছটাক-বর্গফুট রূপান্তরক)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                কাঠা, ছটাক ও বর্গফুট লিখুন—তা তৎক্ষণাৎ শতক, একর এবং বিঘায় রূপান্তর হবে।
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
                <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">Square Feet (বর্গফুট)</label>
                <input
                  type="number"
                  min="0"
                  value={convSqft}
                  onChange={e => setConvSqft(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-400 bg-white dark:bg-slate-800 font-mono font-bold text-amber-700 dark:text-amber-300"
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
                  Acre Equivalent (একর)
                </div>
                <div className="text-sm font-extrabold text-amber-900 dark:text-amber-100 mt-1 font-mono">
                  {(convTotalSqft / WB_AREA_SQFT.acre).toFixed(4)} একর
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
    </div>
  );
};
