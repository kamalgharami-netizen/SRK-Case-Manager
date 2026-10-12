import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  Plus,
  Trash2,
  Printer,
  RefreshCw,
  Building,
  CheckCircle2,
  Scale
} from 'lucide-react';

interface PortionItem {
  id: string;
  label: string;
  unit: 'katha' | 'bigha' | 'acre' | 'satak' | 'sqft';
  amount: number;
  chittak: number;
  sqft: number;
}

const UNIT_TO_SQFT: Record<string, number> = {
  acre: 43560,
  bigha: 14400,
  katha: 720,
  chittak: 45,
  satak: 435.6,
  decimal: 435.6,
  sqft: 1,
  hectare: 107639
};

const UNIT_LABELS: Record<string, string> = {
  acre: 'Acre (একর)',
  bigha: 'Bigha (বিঘা)',
  katha: 'Katha (কাঠা)',
  satak: 'Satak / Dec (শতক)',
  sqft: 'Sq. Ft.'
};

export const ShareCalculator: React.FC = () => {
  const { activeCompany, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'share' | 'farayez'>('share');

  // --- 10000 SHARE STATE ---
  const [totalArea, setTotalArea] = useState<string>('1.5');
  const [totalUnit, setTotalUnit] = useState<string>('acre');
  const [portions, setPortions] = useState<PortionItem[]>([
    {
      id: 'p_1',
      label: 'Co-Sharer A (বিক্রীত অংশ)',
      unit: 'katha',
      amount: 10,
      chittak: 8,
      sqft: 0
    },
    {
      id: 'p_2',
      label: 'Co-Sharer B (অবশিষ্ট অংশ)',
      unit: 'satak',
      amount: 45,
      chittak: 0,
      sqft: 0
    }
  ]);
  const [shareResult, setShareResult] = useState<any>(null);

  // --- FARAYEZ STATE ---
  const [farayezTotal, setFarayezTotal] = useState<string>('1000000');
  const [farayezUnit, setFarayezUnit] = useState<string>('₹ (INR)');
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male');
  const [husbandCount, setHusbandCount] = useState<number>(0);
  const [wifeCount, setWifeCount] = useState<number>(1);
  const [sonsCount, setSonsCount] = useState<number>(2);
  const [daughtersCount, setDaughtersCount] = useState<number>(1);
  const [fatherAlive, setFatherAlive] = useState<boolean>(false);
  const [motherAlive, setMotherAlive] = useState<boolean>(true);
  const [farayezResult, setFarayezResult] = useState<any[] | null>(null);

  // Portion handlers
  const addPortion = () => {
    setPortions(prev => [
      ...prev,
      {
        id: 'p_' + Date.now(),
        label: `Co-Sharer ${String.fromCharCode(65 + prev.length)}`,
        unit: 'katha',
        amount: 0,
        chittak: 0,
        sqft: 0
      }
    ]);
  };

  const removePortion = (idx: number) => {
    setPortions(prev => prev.filter((_, i) => i !== idx));
  };

  const updatePortion = (idx: number, field: keyof PortionItem, val: any) => {
    setPortions(prev =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    );
  };

  const calculateShare = () => {
    const totalVal = parseFloat(totalArea) || 0;
    if (totalVal <= 0) {
      showToast('Enter total land area', 'error');
      return;
    }
    if (portions.length === 0) {
      showToast('Add at least one land portion', 'error');
      return;
    }

    const totalSqft = totalVal * (UNIT_TO_SQFT[totalUnit] || 43560);

    let sumPortionsSqft = 0;
    const computedPortions = portions.map(p => {
      let sqft = 0;
      if (p.amount > 0) sqft += p.amount * (UNIT_TO_SQFT[p.unit] || 720);
      if (p.chittak > 0) sqft += p.chittak * 45;
      if (p.sqft > 0) sqft += p.sqft;

      sumPortionsSqft += sqft;
      const share10000 = (sqft / totalSqft) * 10000;
      const pct = (sqft / totalSqft) * 100;

      return {
        ...p,
        computedSqft: sqft,
        share10000,
        pct
      };
    });

    const residualSqft = Math.max(0, totalSqft - sumPortionsSqft);
    const residualShare = (residualSqft / totalSqft) * 10000;
    const residualPct = (residualSqft / totalSqft) * 100;

    setShareResult({
      totalVal,
      totalUnit,
      totalSqft,
      computedPortions,
      sumPortionsSqft,
      residualSqft,
      residualShare,
      residualPct
    });

    showToast('10000-Share calculated successfully');
  };

  // Farayez calculation (Hanafi Islamic Inheritance)
  const calculateFarayez = () => {
    const totalVal = parseFloat(farayezTotal) || 0;
    if (totalVal <= 0) {
      showToast('Enter total property value or area', 'error');
      return;
    }

    const hasChildren = sonsCount > 0 || daughtersCount > 0;
    let shares: { heir: string; count: number; fraction: string; num: number; den: number; shareVal: number; totalVal: number }[] = [];

    let totalFixedFraction = 0;

    // 1. Spousal share
    if (deceasedGender === 'female' && husbandCount > 0) {
      // Husband: 1/4 with children, 1/2 without
      const hFrac = hasChildren ? { num: 1, den: 4, label: '1/4' } : { num: 1, den: 2, label: '1/2' };
      const fracVal = hFrac.num / hFrac.den;
      totalFixedFraction += fracVal;
      shares.push({
        heir: 'Husband (স্বামী)',
        count: 1,
        fraction: hFrac.label,
        num: hFrac.num,
        den: hFrac.den,
        shareVal: totalVal * fracVal,
        totalVal: totalVal * fracVal
      });
    } else if (deceasedGender === 'male' && wifeCount > 0) {
      // Wife: 1/8 with children, 1/4 without (shared equally)
      const wFrac = hasChildren ? { num: 1, den: 8, label: '1/8' } : { num: 1, den: 4, label: '1/4' };
      const fracVal = wFrac.num / wFrac.den;
      totalFixedFraction += fracVal;
      const totalWifeAmt = totalVal * fracVal;
      shares.push({
        heir: `Wife (স্ত্রী) ${wifeCount > 1 ? `[${wifeCount} wives]` : ''}`,
        count: wifeCount,
        fraction: `${wFrac.label} total`,
        num: wFrac.num,
        den: wFrac.den * wifeCount,
        shareVal: totalWifeAmt / wifeCount,
        totalVal: totalWifeAmt
      });
    }

    // 2. Mother's share
    if (motherAlive) {
      // Mother: 1/6 with children, 1/3 without
      const mFrac = hasChildren ? { num: 1, den: 6, label: '1/6' } : { num: 1, den: 3, label: '1/3' };
      const fracVal = mFrac.num / mFrac.den;
      totalFixedFraction += fracVal;
      shares.push({
        heir: 'Mother (মাতা)',
        count: 1,
        fraction: mFrac.label,
        num: mFrac.num,
        den: mFrac.den,
        shareVal: totalVal * fracVal,
        totalVal: totalVal * fracVal
      });
    }

    // 3. Father's share
    if (fatherAlive) {
      if (hasChildren) {
        // Father gets 1/6 as fixed Quranic sharer
        const fFrac = { num: 1, den: 6, label: '1/6' };
        totalFixedFraction += 1 / 6;
        shares.push({
          heir: 'Father (পিতা)',
          count: 1,
          fraction: fFrac.label,
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
      // Sons and Daughters share residue in 2:1 ratio
      const totalParts = sonsCount * 2 + daughtersCount * 1;
      const partVal = (residue * totalVal) / totalParts;

      shares.push({
        heir: `Son (পুত্র) ${sonsCount > 1 ? `[${sonsCount} sons]` : ''}`,
        count: sonsCount,
        fraction: `Residue (2 parts each)`,
        num: 2,
        den: totalParts,
        shareVal: partVal * 2,
        totalVal: partVal * 2 * sonsCount
      });

      if (daughtersCount > 0) {
        shares.push({
          heir: `Daughter (কন্যা) ${daughtersCount > 1 ? `[${daughtersCount} daughters]` : ''}`,
          count: daughtersCount,
          fraction: `Residue (1 part each)`,
          num: 1,
          den: totalParts,
          shareVal: partVal * 1,
          totalVal: partVal * 1 * daughtersCount
        });
      }
    } else if (daughtersCount > 0) {
      // Daughters alone without sons: 1 daughter = 1/2; 2+ daughters = 2/3
      const dFrac = daughtersCount === 1 ? { num: 1, den: 2, label: '1/2' } : { num: 2, den: 3, label: '2/3' };
      const fracVal = dFrac.num / dFrac.den;
      const totalDaughterAmt = totalVal * fracVal;
      shares.push({
        heir: `Daughter (কন্যা) [${daughtersCount} daughters]`,
        count: daughtersCount,
        fraction: `${dFrac.label} shared`,
        num: dFrac.num,
        den: dFrac.den * daughtersCount,
        shareVal: totalDaughterAmt / daughtersCount,
        totalVal: totalDaughterAmt
      });

      if (fatherAlive) {
        // Father takes remainder as Residuary (Asaba)
        const fResidue = Math.max(0, 1 - (totalFixedFraction + fracVal));
        if (fResidue > 0) {
          shares.push({
            heir: 'Father as Residuary (আসাবা হিসেবে পিতা)',
            count: 1,
            fraction: `Residue (${(fResidue * 100).toFixed(1)}%)`,
            num: 0,
            den: 0,
            shareVal: totalVal * fResidue,
            totalVal: totalVal * fResidue
          });
        }
      }
    } else if (fatherAlive && residue > 0) {
      // No children: Father takes entire residue as Asaba
      shares.push({
        heir: 'Father as Sole Residuary (আসাবা হিসেবে পিতা)',
        count: 1,
        fraction: `Residue (${(residue * 100).toFixed(1)}%)`,
        num: 0,
        den: 0,
        shareVal: totalVal * residue,
        totalVal: totalVal * residue
      });
    }

    setFarayezResult(shares);
    showToast('Islamic Farayez distribution calculated');
  };

  const printShareReport = () => {
    const printWin = window.open('', '_blank');
    if (!printWin || !shareResult) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>10000 Share Certificate</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; }
            h2, h3 { margin: 0 0 6px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 12px 0 16px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
            th, td { border: 1px solid #777; padding: 8px 10px; text-align: left; }
            th { background: #E2E8F0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'SRK Legal Chamber'}</h2>
            <div>10000-SHARE COMPUTATION REPORT (হিস্যা বণ্টন সনদ)</div>
            <div style="font-size: 12px; color: #555;">Generated on ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
          <hr />
          <div><strong>Total Land:</strong> ${shareResult.totalVal} ${UNIT_LABELS[shareResult.totalUnit]} = <strong>${shareResult.totalSqft.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Sq.Ft.</strong></div>
          <table>
            <thead>
              <tr>
                <th>Co-Sharer / Portion</th>
                <th>Area Entered</th>
                <th>Area (Sq. Ft.)</th>
                <th>10000 Share</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${shareResult.computedPortions
                .map(
                  (p: any) => `<tr>
                <td><strong>${p.label}</strong></td>
                <td>${p.amount} ${p.unit} ${p.chittak ? `+ ${p.chittak} Chittak` : ''}</td>
                <td style="font-family: monospace;">${p.computedSqft.toFixed(2)}</td>
                <td style="font-family: monospace; font-weight: bold; color: #1E3A8A;">${p.share10000.toFixed(2)}</td>
                <td style="font-family: monospace;">${p.pct.toFixed(3)}%</td>
              </tr>`
                )
                .join('')}
              <tr style="background: #F8FAFC; font-weight: bold;">
                <td>Residual Land (অবশিষ্ট)</td>
                <td>—</td>
                <td style="font-family: monospace;">${shareResult.residualSqft.toFixed(2)}</td>
                <td style="font-family: monospace; color: #B45309;">${shareResult.residualShare.toFixed(2)}</td>
                <td style="font-family: monospace;">${shareResult.residualPct.toFixed(3)}%</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 40px; text-align: right; font-size: 11px;">
            Certified Chamber Calculations · SRK Case Manager
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
          <title>Muslim Farayez Inheritance Certificate</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; }
            h2, h3 { margin: 0 0 6px 0; color: #047857; }
            hr { border: none; border-top: 1.5px solid #047857; margin: 12px 0 16px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
            th, td { border: 1px solid #777; padding: 8px 10px; text-align: left; }
            th { background: #D1FAE5; font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'SRK Legal Chamber'}</h2>
            <div>HANAFI MUSLIM INHERITANCE DISTRIBUTION (মুসলিম ফারায়েজ হিস্যা)</div>
            <div style="font-size: 12px; color: #555;">Estate Value: ${parseFloat(farayezTotal).toLocaleString('en-IN')} ${farayezUnit}</div>
          </div>
          <hr />
          <div><strong>Deceased:</strong> ${deceasedGender === 'male' ? 'Male (মরহুম)' : 'Female (মরহুমা)'}</div>
          <table>
            <thead>
              <tr>
                <th>Legal Heir (ওয়ারিশান)</th>
                <th>Quranic Fraction</th>
                <th>Share (Per Heir)</th>
                <th>Total Distributed</th>
              </tr>
            </thead>
            <tbody>
              ${farayezResult
                .map(
                  r => `<tr>
                <td><strong>${r.heir}</strong></td>
                <td style="font-family: monospace;">${r.fraction}</td>
                <td style="font-family: monospace; font-weight: bold;">${farayezUnit} ${r.shareVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td style="font-family: monospace;">${farayezUnit} ${r.totalVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="margin-top: 40px; text-align: right; font-size: 11px;">
            Certified under Sunni Hanafi Jurisprudence · SRK Case Manager
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Toggle */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span>Land Share & Inheritance Calculator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard West Bengal 10000-share distribution & Muslim Farayez calculator.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('share')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'share'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            10000 Share Calc
          </button>
          <button
            onClick={() => setActiveTab('farayez')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'farayez'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Muslim Farayez
          </button>
        </div>
      </div>

      {/* TAB 1: 10000 SHARE CALCULATOR */}
      {activeTab === 'share' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Total Land Area (মোট জমির পরিমাণ)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Total Land Quantity *
                </label>
                <input
                  type="number"
                  step="any"
                  value={totalArea}
                  onChange={e => setTotalArea(e.target.value)}
                  placeholder="e.g. 1.5"
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Land Measurement Unit *
                </label>
                <select
                  value={totalUnit}
                  onChange={e => setTotalUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="acre">Acre (1 Acre = 43,560 Sq.Ft. = 100 Satak)</option>
                  <option value="bigha">Bigha (1 Bigha = 14,400 Sq.Ft. = 20 Katha)</option>
                  <option value="katha">Katha (1 Katha = 720 Sq.Ft. = 16 Chittak)</option>
                  <option value="satak">Satak / Decimal (1 Satak = 435.6 Sq.Ft.)</option>
                  <option value="sqft">Square Feet</option>
                  <option value="hectare">Hectare (1 Hectare = 107,639 Sq.Ft.)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Portions Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  2. Co-Sharer Portions (অংশীদারদের ভাগ)
                </span>
                <span className="text-[11px] text-slate-400 ml-2">
                  ({portions.length} portion{portions.length > 1 ? 's' : ''})
                </span>
              </div>
              <button
                type="button"
                onClick={addPortion}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Portion
              </button>
            </div>

            <div className="space-y-3">
              {portions.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={p.label}
                      onChange={e => updatePortion(idx, 'label', e.target.value)}
                      placeholder="Co-sharer name or deed description"
                      className="px-2 py-1 text-xs font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 w-64"
                    />
                    {portions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePortion(idx)}
                        className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Unit
                      </label>
                      <select
                        value={p.unit}
                        onChange={e => updatePortion(idx, 'unit', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value="katha">Katha (কাঠা)</option>
                        <option value="bigha">Bigha (বিঘা)</option>
                        <option value="satak">Satak (শতক)</option>
                        <option value="acre">Acre (একর)</option>
                        <option value="sqft">Sq. Ft.</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Amount ({p.unit})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={p.amount || ''}
                        onChange={e => updatePortion(idx, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        + Chittak (ছটাক)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={p.chittak || ''}
                        onChange={e => updatePortion(idx, 'chittak', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        + Square Feet
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={p.sqft || ''}
                        onChange={e => updatePortion(idx, 'sqft', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={calculateShare}
                className="flex-1 px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-4 h-4" /> Calculate 10000-Share Distribution
              </button>
            </div>
          </div>

          {/* Results Display */}
          {shareResult && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Calculation Results (out of 10000 parts)</span>
                </span>
                <button
                  onClick={printShareReport}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Certificate
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Portion / Co-Sharer</th>
                      <th className="py-2.5 px-3">Square Feet</th>
                      <th className="py-2.5 px-3">Share (out of 10000)</th>
                      <th className="py-2.5 px-3">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {shareResult.computedPortions.map((p: any) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {p.label}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {p.computedSqft.toFixed(2)} Sq.Ft.
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">
                          {p.share10000.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {p.pct.toFixed(3)}%
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-semibold">
                      <td className="py-2.5 px-3 text-amber-800 dark:text-amber-300">
                        Remaining Undivided Land
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-800 dark:text-amber-300">
                        {shareResult.residualSqft.toFixed(2)} Sq.Ft.
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-800 dark:text-amber-300 text-sm">
                        {shareResult.residualShare.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-800 dark:text-amber-300">
                        {shareResult.residualPct.toFixed(3)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MUSLIM FARAYEZ CALCULATOR */}
      {activeTab === 'farayez' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span>Hanafi Sunni Inheritance Parameters (ফারায়েজ ইনপুট)</span>
              <span className="text-[11px] text-slate-400">Quranic Fixed Sharers & Asaba Residuaries</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Total Estate / Land Value *
                </label>
                <input
                  type="number"
                  step="any"
                  value={farayezTotal}
                  onChange={e => setFarayezTotal(e.target.value)}
                  placeholder="e.g. 1000000"
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Denomination / Unit
                </label>
                <select
                  value={farayezUnit}
                  onChange={e => setFarayezUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="₹ (INR)">₹ Rupees (টাকা)</option>
                  <option value="Acre">Acre (একর)</option>
                  <option value="Bigha">Bigha (বিঘা)</option>
                  <option value="Katha">Katha (কাঠা)</option>
                  <option value="Satak">Satak (শতক)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Deceased Person
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
                    Husband Surviving?
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
                    Number of Wives
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
                className="w-full px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-4 h-4" /> Calculate Farayez Inheritance
              </button>
            </div>
          </div>

          {/* Farayez Result Table */}
          {farayezResult && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Farayez Apportionment Table</span>
                </span>
                <button
                  onClick={printFarayezReport}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Farayez Certificate
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Heir Category (ওয়ারিশ)</th>
                      <th className="py-2.5 px-3">Quranic Fraction</th>
                      <th className="py-2.5 px-3">Portion Amount (Each)</th>
                      <th className="py-2.5 px-3 text-right">Total Category Sum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {farayezResult.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {r.heir}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {r.fraction}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {farayezUnit} {r.shareVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right text-slate-600 dark:text-slate-400">
                          {farayezUnit} {r.totalVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
