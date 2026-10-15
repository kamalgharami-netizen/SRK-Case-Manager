import React from 'react';
import { useApp } from '../context/AppContext';
import { CaseType, CaseItem } from '../types';
import { CompanyLogo } from './CompanyLogo';
import {
  FileText,
  Printer,
  Calendar,
  Building,
  MapPin,
  Clock,
  Shield,
  FileCheck,
  Share2,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';

interface CaseDetailModalProps {
  caseItem: CaseItem | null;
  onClose: () => void;
  onEdit: (c: CaseItem) => void;
  onOpenChainDeed?: (c: CaseItem) => void;
  onOpenAiDraft?: (type: CaseType, c?: CaseItem) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  onClose,
  onEdit,
  onOpenChainDeed,
  onOpenAiDraft
}) => {
  const { activeCompany } = useApp();
  if (!caseItem) return null;

  const diaryEntries = activeCompany?.diaryData?.[caseItem.id] || [];

  const printCaseSummary = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Case File - ${caseItem.caseNo}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; }
            h2, h3 { margin: 0 0 6px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 12px 0 16px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { border: 1px solid #777; padding: 6px 8px; text-align: left; }
            th { background: #E2E8F0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'SRK Legal Chamber'}</h2>
            <div>${activeCompany?.address || ''}, ${activeCompany?.city || ''}</div>
            <div style="font-size: 12px; color: #555;">Bar Council Reg: ${activeCompany?.barCouncil || ''}</div>
          </div>
          <hr />
          <h3>CASE DOSSIER: ${caseItem.caseNo}</h3>
          <p><strong>Module:</strong> ${caseItem.type.toUpperCase()} · <strong>Sub-Type:</strong> ${caseItem.subType} · <strong>Status:</strong> ${caseItem.status}</p>
          <p><strong>Forum:</strong> ${caseItem.forum || '—'} · <strong>Filing Date:</strong> ${caseItem.filingDate || '—'} · <strong>Next Date:</strong> ${caseItem.nextDate || '—'}</p>
          <p><strong>Petitioner:</strong> ${caseItem.party} · <strong>Opposite Party:</strong> ${caseItem.opp || '—'}</p>

          ${
            caseItem.landSchedules.length > 0
              ? `<h4>Land Schedule</h4>
                 <table>
                   <thead>
                     <tr>
                       <th>District / Block</th>
                       <th>Mouza (JL)</th>
                       <th>Khatian</th>
                       <th>Dag</th>
                       <th>Area</th>
                       <th>Class</th>
                     </tr>
                   </thead>
                   <tbody>
                     ${caseItem.landSchedules
                       .map(
                         s => `<tr>
                       <td>${s.district} / ${s.block}</td>
                       <td>${s.mouza} (${s.jl})</td>
                       <td>${s.khatian}</td>
                       <td>${s.dag}</td>
                       <td>${s.area} ${s.unit}</td>
                       <td>${s.classification || '—'}</td>
                     </tr>`
                       )
                       .join('')}
                   </tbody>
                 </table>`
              : ''
          }

          ${
            caseItem.chainLinks.length > 0
              ? `<h4>Chain of Title</h4>
                 <table>
                   <thead>
                     <tr>
                       <th>Deed No</th>
                       <th>Date</th>
                       <th>Vendor</th>
                       <th>Purchaser</th>
                       <th>Area</th>
                       <th>Consideration</th>
                     </tr>
                   </thead>
                   <tbody>
                     ${caseItem.chainLinks
                       .map(
                         cl => `<tr>
                       <td>${cl.deedNo}</td>
                       <td>${cl.deedDate}</td>
                       <td>${cl.vendor}</td>
                       <td>${cl.purchaser}</td>
                       <td>${cl.area}</td>
                       <td>${cl.consideration}</td>
                     </tr>`
                       )
                       .join('')}
                   </tbody>
                 </table>`
              : ''
          }

          <div style="margin-top: 30px; text-align: right; font-size: 11px;">
            Printed from SRK Case Manager
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <CompanyLogo company={activeCompany} size="md" className="shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-blue-700 dark:text-blue-400">
                  {caseItem.caseNo}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  {caseItem.status}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {caseItem.subType} ({caseItem.type.toUpperCase()})
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                {caseItem.forum} · Next Hearing: <strong>{caseItem.nextDate || 'Not fixed'}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['mutation', 'misc', 'lrappeal', 'lrtt'].includes(caseItem.type) && (
              <button
                onClick={() => onOpenChainDeed && onOpenChainDeed(caseItem)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Make or View Chain Deed Statement (sourced from Settings > Chain Sample)"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Chain Deed</span>
              </button>
            )}
            {caseItem.type !== 'mutation' && onOpenAiDraft && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiDraft(caseItem.type, caseItem);
                }}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                title={`Draft ${caseItem.type.toUpperCase()} petition using AI with case data`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Draft ({caseItem.type.toUpperCase()})</span>
              </button>
            )}
            <button
              onClick={printCaseSummary}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Dossier
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(caseItem);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Edit File
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Litigants Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Petitioner / Applicant
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {caseItem.party}
            </div>
            {caseItem.applicants[0]?.address && (
              <div className="text-slate-500 text-[11px]">{caseItem.applicants[0].address}</div>
            )}
            {caseItem.applicants[0]?.phone && (
              <div className="font-mono text-slate-500">{caseItem.applicants[0].phone}</div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Opposite Party / Respondent
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {caseItem.opp || '—'}
            </div>
            {caseItem.respondents[0]?.address && (
              <div className="text-slate-500 text-[11px]">{caseItem.respondents[0].address}</div>
            )}
          </div>
        </div>

        {/* Land Schedules */}
        {caseItem.landSchedules.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Land Schedule ({caseItem.landSchedules.length})
            </div>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">District / Block</th>
                    <th className="p-2.5">Mouza & JL</th>
                    <th className="p-2.5">Khatian</th>
                    <th className="p-2.5">Dag</th>
                    <th className="p-2.5">Area</th>
                    <th className="p-2.5">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {caseItem.landSchedules.map((s, i) => (
                    <tr key={i}>
                      <td className="p-2.5">{s.district} / {s.block}</td>
                      <td className="p-2.5">{s.mouza} (JL {s.jl})</td>
                      <td className="p-2.5 font-mono">{s.khatian}</td>
                      <td className="p-2.5 font-mono font-bold text-blue-600">{s.dag}</td>
                      <td className="p-2.5 font-mono">{s.area} {s.unit}</td>
                      <td className="p-2.5">{s.classification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chain Deeds */}
        {caseItem.chainLinks && caseItem.chainLinks.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Chain of Title Chronology ({caseItem.chainLinks.length} Deeds)
            </div>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Deed No</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Vendor</th>
                    <th className="p-2.5">Purchaser</th>
                    <th className="p-2.5">Area</th>
                    <th className="p-2.5">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {caseItem.chainLinks.map((cl, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-mono font-bold">{cl.deedNo}</td>
                      <td className="p-2.5 font-mono">{cl.deedDate}</td>
                      <td className="p-2.5">{cl.vendor}</td>
                      <td className="p-2.5 font-semibold">{cl.purchaser}</td>
                      <td className="p-2.5">{cl.area}</td>
                      <td className="p-2.5 font-mono">{cl.consideration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chain Deed Making Box (Exclusive to Mutation, Misc, LR Appeal, LRTT) */}
        {['mutation', 'misc', 'lrappeal', 'lrtt'].includes(caseItem.type) && (
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 shadow-2xs">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-950 dark:text-blue-200">
                    Chain of Title Deed Making (ধারাবাহিক চেইন দলিল)
                  </h3>
                  <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                    Format sourced from Settings &gt; Chain Sample. Prepared specifically for {caseItem.caseNo}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChainDeed && onOpenChainDeed(caseItem)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Chain Deed Maker</span>
              </button>
            </div>

            {caseItem.chainDeedDraft ? (
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 text-xs font-mono text-slate-700 dark:text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {caseItem.chainDeedDraft.slice(0, 450)}...
              </div>
            ) : (
              <div className="text-[11px] text-blue-900/70 dark:text-blue-300/70 flex items-center gap-1.5">
                <span>• Recorded via deeds in this case: <strong>{caseItem.chainLinks?.length || 0}</strong>. Click "Open Chain Deed Maker" to generate or edit the full sequential title statement.</span>
              </div>
            )}
          </div>
        )}

        {/* Diary entries */}
        {diaryEntries.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Recent Case Diary Entries ({diaryEntries.length})
            </div>
            <div className="space-y-2">
              {diaryEntries.slice(0, 3).map(d => (
                <div
                  key={d.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{d.title}</span>
                    <span className="font-mono text-slate-500 text-[10px]">{d.date}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{d.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case Notes */}
        {caseItem.notes && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="font-bold uppercase text-[10px] text-slate-400 mb-1">Internal Notes</div>
            <div className="text-slate-700 dark:text-slate-300 italic">{caseItem.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};
