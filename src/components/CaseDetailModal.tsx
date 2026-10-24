import React from 'react';
import { useApp } from '../context/AppContext';
import { CaseType, CaseItem } from '../types';
import { CompanyLogo } from './CompanyLogo';
import { safePrintHtml } from '../utils/printDoc';
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
  Sparkles,
  User,
  Phone,
  Tag
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
  const isCertOrRorPi = caseItem.type === 'certcopy' || caseItem.type === 'rorpi';

  const printCaseSummary = () => {
    safePrintHtml(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isCertOrRorPi ? (caseItem.type === 'rorpi' ? 'ROR/PI Application' : 'Certified Copy Application') : 'Case File'} - ${isCertOrRorPi ? (caseItem.appNo || caseItem.ainNo || caseItem.caseNo) : caseItem.caseNo}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; }
            h2, h3, h4 { margin: 0 0 6px 0; color: #1E3A8A; }
            hr { border: none; border-top: 1.5px solid #1E3A8A; margin: 12px 0 16px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { border: 1px solid #777; padding: 6px 8px; text-align: left; }
            th { background: #E2E8F0; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; font-size: 13px; }
            .box { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 12px; border-radius: 6px; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>${activeCompany?.name || 'Legal Chamber'}</h2>
            <div>${activeCompany?.address || ''}, ${activeCompany?.city || ''}</div>
            <div style="font-size: 12px; color: #555;">Bar Council Reg: ${activeCompany?.barCouncil || ''}</div>
          </div>
          <hr />
          <h3>${isCertOrRorPi ? (caseItem.type === 'rorpi' ? 'ROR / PLOT INFORMATION (PI) APPLICATION SHEET' : 'CERTIFIED COPY OF DEED APPLICATION SHEET') : `CASE DOSSIER: ${caseItem.caseNo}`}</h3>

          ${caseItem.type === 'rorpi' ? `
            <div class="box">
              <div class="grid">
                <div><strong>ROR/PI NO:</strong> ${caseItem.rorPiNo || caseItem.appNo || caseItem.caseNo || '—'}</div>
                <div><strong>GRN Fee Challan:</strong> ${caseItem.grnNo || '—'}</div>
                <div><strong>Current Status:</strong> ${caseItem.status}</div>
                <div><strong>Application Date:</strong> ${caseItem.filingDate || '—'}</div>
              </div>
            </div>

            ${caseItem.landSchedules && caseItem.landSchedules.length > 0 ? `
              <h4>Schedule of Land (জমির তপশীল বিবরণ — প্লট / খতিয়ান)</h4>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>District & Block</th>
                    <th>J.L. No</th>
                    <th>Record Type</th>
                    <th>Survey Stage</th>
                    <th>Plot / Khatian No</th>
                  </tr>
                </thead>
                <tbody>
                  ${caseItem.landSchedules.map((s, idx) => {
                    const isPlot = s.recordType === 'Plot' || (s.dag && !s.khatian);
                    return `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${s.district || caseItem.district || '—'} / ${s.block || '—'}</td>
                      <td>${s.jl ? `JL: ${s.jl}` : '—'}</td>
                      <td><strong>${s.recordType || (isPlot ? 'Plot' : 'ROR')}</strong></td>
                      <td><strong>${s.surveyStage || 'LR'}</strong></td>
                      <td><strong>${isPlot ? (s.dag || s.plotOrKhatian || '—') : (s.khatian || s.plotOrKhatian || '—')}</strong></td>
                    </tr>
                  `;
                  }).join('')}
                </tbody>
              </table>
            ` : ''}

            <h4 style="margin-top: 16px;">Applicant Particulars</h4>
            <div class="grid">
              <div><strong>Applicant Name:</strong> ${caseItem.party}</div>
              ${caseItem.applicants?.[0]?.phone ? `<div><strong>Phone:</strong> ${caseItem.applicants[0].phone}</div>` : ''}
            </div>
          ` : caseItem.type === 'certcopy' ? `
            <div class="box">
              <div class="grid">
                <div><strong>AIN NO:</strong> ${caseItem.appNo || caseItem.ainNo || caseItem.caseNo || '—'}</div>
                <div><strong>GRN Fee Challan No:</strong> ${caseItem.grnNo || '—'}</div>
                <div><strong>DEED NO:</strong> ${caseItem.applicantDeedNo || caseItem.deedNo || '—'}</div>
                <div><strong>DEED YEAR:</strong> ${caseItem.applicantDeedYear || caseItem.deedYear || '—'}</div>
                <div><strong>DISTRICT:</strong> ${caseItem.district || 'West Bengal'}</div>
                <div><strong>OFFICE:</strong> ${caseItem.applicantAdsr || caseItem.adsr || 'ADSR Office'}</div>
                <div><strong>Application Date:</strong> ${caseItem.filingDate || '—'}</div>
                <div><strong>Expected Delivery Date:</strong> ${caseItem.nextDate || '—'}</div>
                <div><strong>Current Status:</strong> ${caseItem.status}</div>
              </div>
            </div>
            <h4>Applicant & Reference Information</h4>
            <div class="grid">
              <div><strong>Applicant Full Name:</strong> ${caseItem.party}</div>
              <div><strong>Broker / Muhuri:</strong> ${caseItem.brokerName || '—'} ${caseItem.brokerPhone ? `(${caseItem.brokerPhone})` : ''}</div>
              ${caseItem.applicants?.[0]?.father ? `<div><strong>Father / Husband:</strong> ${caseItem.applicants[0].father}</div>` : ''}
              ${caseItem.applicants?.[0]?.phone ? `<div><strong>Phone:</strong> ${caseItem.applicants[0].phone}</div>` : ''}
              ${caseItem.applicants?.[0]?.address ? `<div><strong>Address:</strong> ${caseItem.applicants[0].address}</div>` : ''}
            </div>
          ` : `
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
              caseItem.chainLinks && caseItem.chainLinks.length > 0
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
          `}

          <div style="margin-top: 30px; text-align: right; font-size: 11px;">
            Printed from SRK Case Manager
          </div>
        </body>
      </html>
    `);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <CompanyLogo company={activeCompany} size="md" className="shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-base font-bold text-blue-700 dark:text-blue-400">
                  {caseItem.type === 'rorpi'
                    ? (caseItem.rorPiNo || caseItem.appNo || caseItem.caseNo || 'ROR/PI Pending')
                    : caseItem.type === 'certcopy'
                    ? (caseItem.appNo || caseItem.ainNo || caseItem.caseNo || 'AIN Pending')
                    : (caseItem.caseNo || (caseItem.type === 'rti' ? caseItem.docketNo || caseItem.appNo || 'RTI Application' : '—'))}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  {caseItem.status}
                </span>
                {caseItem.grnNo && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                    GRN Fee Challan: {caseItem.grnNo}
                  </span>
                )}
                {!isCertOrRorPi && (caseItem.docketNo || caseItem.appNo) && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {caseItem.type === 'lrappeal' || caseItem.type === 'firstappeal' || caseItem.type === 'misc'
                      ? `Docket No: ${caseItem.docketNo || caseItem.appNo}`
                      : caseItem.type === 'rti'
                      ? `Docket/Tracking: ${caseItem.docketNo || caseItem.appNo}`
                      : `App No: ${caseItem.appNo || caseItem.docketNo}`}
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {caseItem.type === 'rorpi'
                  ? (caseItem.subType || 'Certified ROR (খতিয়ান নকল / পরচা)')
                  : caseItem.type === 'certcopy'
                  ? (caseItem.subType || 'Certified Copy of Deed Application')
                  : `${caseItem.subType} (${caseItem.type.toUpperCase()})`}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                {caseItem.type === 'rorpi' ? (
                  <span>
                    Filing Date: <strong>{caseItem.filingDate || '—'}</strong> · Issuing Authority: {caseItem.forum || 'BL&LRO Portal'}
                  </span>
                ) : caseItem.type === 'certcopy' ? (
                  <span>
                    {caseItem.district || 'West Bengal'} · {caseItem.applicantAdsr || caseItem.adsr || 'ADSR Office'} · Expected Delivery: <strong>{caseItem.nextDate || 'Not fixed'}</strong>
                  </span>
                ) : (
                  <span>
                    {caseItem.forum || 'Not specified'} · Next Hearing: <strong>{caseItem.nextDate || 'Not fixed'}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={printCaseSummary}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title={isCertOrRorPi ? 'Print Application / Delivery Slip' : 'Print Case File'}
            >
              <Printer className="w-4 h-4" /> {isCertOrRorPi ? 'Print Slip' : 'Print Case File'}
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
              className="p-1.5 text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body - Organized Strictly Per Entry Form */}
        {caseItem.type === 'rorpi' ? (
          <div className="space-y-4">
            {/* Primary Registry Information matching entry form */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Primary Registry Details (ROR / PI Registry)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">ROR/PI NO.</div>
                  <div className="font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">
                    {caseItem.rorPiNo || caseItem.appNo || caseItem.caseNo || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">GRN Fee Challan No</div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {caseItem.grnNo || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Filing / Application Date</div>
                  <div className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {caseItem.filingDate || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Current Status</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {caseItem.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Details (No Father, No Address, No Broker/Muhuri) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Applicant Information (আবেদনকারী বিবরণ)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Applicant Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{caseItem.party}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Contact Phone / WhatsApp</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{caseItem.applicants?.[0]?.phone || '—'}</span>
                </div>
              </div>
            </div>

            {/* Schedule of Land (জমির তপশীল বিবরণ — প্লট / খতিয়ান) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Schedule of Land — ROR / Plot (জমির তপশীল বিবরণ) ({caseItem.landSchedules?.length || 0})</span>
                </span>
              </div>

              {caseItem.landSchedules && caseItem.landSchedules.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">District &amp; Block</th>
                        <th className="p-2.5">J.L. No</th>
                        <th className="p-2.5">Record Type</th>
                        <th className="p-2.5">Survey Stage</th>
                        <th className="p-2.5">Plot / Khatian No</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {caseItem.landSchedules.map((s, idx) => {
                        const isPlot = s.recordType === 'Plot' || (s.dag && !s.khatian);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <td className="p-2.5 font-medium">{s.district || caseItem.district || '—'} / {s.block || '—'}</td>
                            <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">{s.jl ? `JL: ${s.jl}` : '—'}</td>
                            <td className="p-2.5 font-semibold text-blue-700 dark:text-blue-300">{s.recordType || (isPlot ? 'Plot' : 'ROR')}</td>
                            <td className="p-2.5 font-semibold text-indigo-700 dark:text-indigo-300">{s.surveyStage || 'LR'}</td>
                            <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                              {isPlot ? (s.dag || s.plotOrKhatian || '—') : (s.khatian || s.plotOrKhatian || '—')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  No land schedule specified.
                </div>
              )}
            </div>
          </div>
        ) : caseItem.type === 'certcopy' ? (
          <div className="space-y-4">
            {/* Primary Registry Information matching entry form */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Primary Registry Details (Certified Copy Layout)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">AIN NO.</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {caseItem.appNo || caseItem.ainNo || caseItem.caseNo || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">GRN Fee Challan No</div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {caseItem.grnNo || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">DEED NO.</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {caseItem.applicantDeedNo || caseItem.deedNo || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">DEED YEAR</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {caseItem.applicantDeedYear || caseItem.deedYear || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">DISTRICT</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {caseItem.district || 'West Bengal'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">ADSR OFFICE</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {caseItem.applicantAdsr || caseItem.adsr || 'ADSR Office'}
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant & Broker Details matching entry form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Applicant Information</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {caseItem.party}
                </div>
                {caseItem.applicants?.[0]?.father && (
                  <div className="text-slate-500 text-[11px]">
                    Father / Husband: <strong>{caseItem.applicants[0].father}</strong>
                  </div>
                )}
                {caseItem.applicants?.[0]?.phone && (
                  <div className="font-mono text-slate-600 dark:text-slate-400 text-xs flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{caseItem.applicants[0].phone}</span>
                  </div>
                )}
                {caseItem.applicants?.[0]?.address && (
                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    {caseItem.applicants[0].address}
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Broker / Muhuri Reference</span>
                </div>
                <div className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                  {caseItem.brokerName || 'Direct Applicant (No Broker)'}
                </div>
                {caseItem.brokerPhone && (
                  <div className="font-mono text-slate-600 dark:text-slate-400 text-xs flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{caseItem.brokerPhone}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Application Date:</span>
                  <span className="font-mono font-semibold">{caseItem.filingDate || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Expected Delivery:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{caseItem.nextDate || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Litigants Row */}
            <div className={`grid grid-cols-1 ${caseItem.type === 'rti' ? '' : 'sm:grid-cols-2'} gap-4 text-xs`}>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {caseItem.type === 'firstappeal' ? 'Appellant' : caseItem.type === 'rti' ? 'RTI Applicant' : 'Petitioner / Applicant'}
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {caseItem.party}
                </div>
                {caseItem.applicants[0]?.father && (
                  <div className="text-slate-500 text-[11px]">C/O: {caseItem.applicants[0].father}</div>
                )}
                {caseItem.applicants[0]?.address && (
                  <div className="text-slate-500 text-[11px]">{caseItem.applicants[0].address}</div>
                )}
                {caseItem.applicants[0]?.phone && (
                  <div className="font-mono text-slate-500">{caseItem.applicants[0].phone}</div>
                )}
              </div>

              {caseItem.type !== 'rti' && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Opposite Party / Respondent(s) {caseItem.respondents?.length ? `(${caseItem.respondents.length})` : ''}
                    </span>
                  </div>
                  {caseItem.respondents && caseItem.respondents.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {caseItem.respondents.map((r, i) => (
                        <div key={r.id || i} className="text-xs border-b last:border-0 border-slate-200/50 dark:border-slate-700/50 pb-1">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                            <span>{i + 1}. {r.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-normal">{r.type}</span>
                          </div>
                          {r.address && <div className="text-slate-500 text-[11px] mt-0.5">{r.address}</div>}
                          {r.phone && <div className="font-mono text-slate-400 text-[10px]">{r.phone}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {caseItem.opp || '— (No opposite party / Uncontested)'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Land Schedules (সম্পত্তির তপশীল বিবরণ) - Only for property/litigation cases, not certcopy/rorpi */}
        {!isCertOrRorPi && caseItem.landSchedules.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>সম্পত্তির তপশীল বিবরণ ({caseItem.landSchedules.length})</span>
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

        {/* Chain Deeds & Warish Transitions */}
        {['mutation', 'misc'].includes(caseItem.type) && caseItem.chainLinks && caseItem.chainLinks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Chain of Title Chronology ({caseItem.chainLinks.length} Steps)</span>
              </div>
              {caseItem.recordedOwner && (
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  Original Rayat: <strong>{caseItem.recordedOwner}</strong> (Khatian: {caseItem.recordedKhatian || '—'}, Dag: {caseItem.recordedDag || '—'})
                </div>
              )}
            </div>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Step / Type</th>
                    <th className="p-2.5">Deed / Cert No</th>
                    <th className="p-2.5">Year / Date</th>
                    <th className="p-2.5">Vendor / Deceased</th>
                    <th className="p-2.5">Buyer / Successor</th>
                    <th className="p-2.5">Area & Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {caseItem.chainLinks.map((cl, i) => (
                    <tr key={i} className={cl.linkType === 'warish' ? 'bg-purple-50/30 dark:bg-purple-950/20' : ''}>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          cl.linkType === 'warish'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}>
                          {cl.linkType === 'warish' ? 'Warish' : (cl.deedType || 'Deed')}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold">
                        {cl.linkType === 'warish' ? (cl.certificateRef || 'Warishan Cert.') : (cl.deedNo || '—')}
                      </td>
                      <td className="p-2.5 font-mono">{cl.deedYear || cl.deedDate || '—'}</td>
                      <td className="p-2.5">{cl.vendor}</td>
                      <td className="p-2.5 font-semibold text-blue-600 dark:text-blue-400">{cl.purchaser}</td>
                      <td className="p-2.5 font-mono text-[11px]">
                        {cl.area ? `${cl.area}` : ''} {cl.consideration ? `(${cl.consideration})` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        {/* Footer Actions with prominent Close button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono">
            {caseItem.caseNo || caseItem.appNo || 'Case File'} · {caseItem.party}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={printCaseSummary}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isCertOrRorPi ? 'Print Slip' : 'Print Case File'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Close (বন্ধ করুন)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
