import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CaseType,
  CaseItem,
  LandSchedule,
  Applicant,
  Respondent,
  AddressItem,
  ChainLink,
  CaseAttachment
} from '../types';
import { wbDistricts } from '../data/wbDistricts';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Download,
  Paperclip,
  Clock,
  Sparkles
} from 'lucide-react';

interface CaseEntryFormProps {
  type: CaseType;
  editingCase?: CaseItem | null;
  onBack: () => void;
  onSaved: (savedCase: CaseItem) => void;
}

const FORUMS_BY_TYPE: Record<CaseType, string[]> = {
  mutation: ['BL&LRO', 'SDL&LRO', 'DL&LRO'],
  misc: ['BL&LRO', 'SDL&LRO', 'DL&LRO'],
  lrappeal: ['DL&LRO', 'Additional District Magistrate (L&LR)', 'WBLRTT'],
  firstappeal: ['DL&LRO', 'Additional District Magistrate (L&LR)', 'Divisional Commissioner', 'Appellate Authority'],
  rti: ['SPIO / BL&LRO', 'SPIO / DL&LRO', 'First Appellate Authority (FAA)', 'State Information Commission (SIC)'],
  lrtt: ['Division Bench - I, WBLRTT', 'Division Bench - II, WBLRTT'],
  conversion: ['DL&LRO', 'SDL&LRO']
};

const SUBTYPES_BY_TYPE: Record<CaseType, string[]> = {
  mutation: [
    'Purchase Mutation',
    'Inheritance Mutation',
    'Gift Deed Mutation',
    'Court Decree Mutation'
  ],
  misc: [
    '10000 Share Problem',
    'Record Correction',
    'Name Correction',
    'RS to LR Conveyance',
    'Boundary Dispute',
    'Erroneous Record'
  ],
  lrappeal: ['Section 54 Appeal', 'Section 51A(5) Appeal', 'Delay Condonation'],
  firstappeal: [
    'First Appeal u/s 54 WBLR Act',
    'First Appeal u/s 51A(5)',
    'Bargadar Hearing Appeal',
    'Civil Court First Appeal',
    'RTI First Appeal u/s 19(1)'
  ],
  rti: [
    'RTI Application u/s 6(1)',
    'RTI First Appeal u/s 19(1)',
    'Second Appeal u/s 19(3)',
    'Certified Copy of ROR/Khatian Query',
    'Vested Land Record Query',
    'Inquiry Report Request'
  ],
  lrtt: [
    '10000 Share Problem',
    'Record Correction',
    'Name Correction',
    'RS to LR Conveyance',
    'Appeal against Order'
  ],
  conversion: [
    'Sali to Bastu',
    'Danga to Bastu',
    'Pond to Bastu',
    'Agricultural to Commercial',
    'Other'
  ]
};

const STATUSES_BY_TYPE: Record<CaseType, string[]> = {
  mutation: ['Filed', 'Notice Issued', 'Hearing', 'Order Reserved', 'Allowed', 'Rejected'],
  misc: ['Filed', 'Notice Issued', 'Hearing', 'Order Reserved', 'Disposed'],
  lrappeal: ['Filed', 'Admitted', 'Stay Granted', 'Hearing', 'Allowed', 'Dismissed'],
  firstappeal: ['Filed', 'Admitted', 'Stay Granted', 'Hearing', 'Allowed', 'Dismissed'],
  rti: ['Application Sent', 'PIO Replied', 'Info Provided', 'First Appeal Filed', 'Hearing', 'Disposed'],
  lrtt: ['OA Filed', 'Notice Issued', 'Hearing', 'Order Reserved', 'Allowed', 'Dismissed'],
  conversion: ['Applied', 'Site Verified', 'Report Submitted', 'Order Passed', 'Rejected']
};

export const CaseEntryForm: React.FC<CaseEntryFormProps> = ({
  type,
  editingCase,
  onBack,
  onSaved
}) => {
  const { addCase, updateCase, showToast, activeCompany } = useApp();

  // Basic Details
  const [caseNo, setCaseNo] = useState(editingCase?.caseNo || '');
  const [subType, setSubType] = useState(
    editingCase?.subType || SUBTYPES_BY_TYPE[type][0] || ''
  );
  const [status, setStatus] = useState(
    editingCase?.status || STATUSES_BY_TYPE[type][0] || ''
  );
  const [party, setParty] = useState(editingCase?.party || '');
  const [opp, setOpp] = useState(editingCase?.opp || '');
  const [forum, setForum] = useState(
    editingCase?.forum || FORUMS_BY_TYPE[type][0] || ''
  );
  const [filingDate, setFilingDate] = useState(
    editingCase?.filingDate || new Date().toISOString().slice(0, 10)
  );
  const [nextDate, setNextDate] = useState(editingCase?.nextDate || '');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>(
    editingCase?.priority || 'Normal'
  );
  const [appNo, setAppNo] = useState(editingCase?.appNo || '');
  const [grnNo, setGrnNo] = useState(editingCase?.grnNo || '');
  const [docketNo, setDocketNo] = useState(editingCase?.docketNo || '');
  const [impugnedOrderNo, setImpugnedOrderNo] = useState(
    editingCase?.impugnedOrderNo || ''
  );
  const [impugnedOrderDate, setImpugnedOrderDate] = useState(
    editingCase?.impugnedOrderDate || ''
  );
  const [grounds, setGrounds] = useState(editingCase?.grounds || '');
  const [bench, setBench] = useState(editingCase?.bench || '');
  const [targetOfficer, setTargetOfficer] = useState(
    editingCase?.targetOfficer || ''
  );
  const [notes, setNotes] = useState(editingCase?.notes || '');

  // Sub-collections
  const [landSchedules, setLandSchedules] = useState<LandSchedule[]>(
    editingCase?.landSchedules || [
      {
        id: 'ls_init',
        district: 'North 24 Parganas',
        block: 'Rajarhat',
        mouza: '',
        jl: '',
        khatian: '',
        dag: '',
        area: '',
        unit: 'acre',
        classification: 'Bastu'
      }
    ]
  );

  const [applicants, setApplicants] = useState<Applicant[]>(
    editingCase?.applicants || [
      {
        id: 'app_init',
        name: '',
        father: '',
        age: '',
        address: '',
        phone: ''
      }
    ]
  );

  const [respondents, setRespondents] = useState<Respondent[]>(
    editingCase?.respondents || [
      {
        id: 'resp_init',
        name: 'The State of West Bengal',
        father: '',
        type: 'State',
        address: '',
        phone: ''
      }
    ]
  );

  const [addresses, setAddresses] = useState<AddressItem[]>(
    editingCase?.addresses || []
  );

  const [chainLinks, setChainLinks] = useState<ChainLink[]>(
    editingCase?.chainLinks || []
  );

  const [attachments, setAttachments] = useState<CaseAttachment[]>(
    editingCase?.attachments || []
  );

  // Chain of title verification state
  const [chainSummaryHtml, setChainSummaryHtml] = useState<string>('');
  const [chainGaps, setChainGaps] = useState<string[]>([]);

  // Limitation calculation for LR Appeal
  const [limitationStats, setLimitationStats] = useState<{
    daysElapsed: number;
    sec54DaysLeft: number;
    sec51ADaysLeft: number;
    sec5DaysLeft: number;
    statusSec54: 'Safe' | 'Urgent' | 'Expired';
  } | null>(null);

  useEffect(() => {
    if (type === 'lrappeal' && impugnedOrderDate) {
      const orderD = new Date(impugnedOrderDate);
      const today = new Date();
      const diffMs = today.getTime() - orderD.getTime();
      const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      const sec54DaysLeft = 60 - daysElapsed;
      const sec51ADaysLeft = 30 - daysElapsed;
      const sec5DaysLeft = 90 - daysElapsed;

      let statusSec54: 'Safe' | 'Urgent' | 'Expired' = 'Safe';
      if (sec54DaysLeft < 0) statusSec54 = 'Expired';
      else if (sec54DaysLeft <= 7) statusSec54 = 'Urgent';

      setLimitationStats({
        daysElapsed,
        sec54DaysLeft,
        sec51ADaysLeft,
        sec5DaysLeft,
        statusSec54
      });
    } else {
      setLimitationStats(null);
    }
  }, [type, impugnedOrderDate]);

  // Land schedule methods
  const addLandSchedule = () => {
    setLandSchedules(prev => [
      ...prev,
      {
        id: 'ls_' + Date.now(),
        district: 'North 24 Parganas',
        block: 'Rajarhat',
        mouza: '',
        jl: '',
        khatian: '',
        dag: '',
        area: '',
        unit: 'acre',
        classification: 'Sali'
      }
    ]);
  };

  const removeLandSchedule = (idx: number) => {
    setLandSchedules(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSchedule = (idx: number, field: keyof LandSchedule, val: any) => {
    setLandSchedules(prev =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        if (field === 'district') {
          // Reset block to first available in selected district
          const blocks = wbDistricts[val] || [];
          return { ...s, district: val, block: blocks[0] || '' };
        }
        return { ...s, [field]: val };
      })
    );
  };

  // Applicant methods
  const addApplicant = () => {
    setApplicants(prev => [
      ...prev,
      { id: 'app_' + Date.now(), name: '', father: '', age: '', address: '', phone: '' }
    ]);
  };

  const removeApplicant = (idx: number) => {
    setApplicants(prev => prev.filter((_, i) => i !== idx));
  };

  const updateApplicant = (idx: number, field: keyof Applicant, val: string) => {
    setApplicants(prev =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: val } : a))
    );
  };

  // Respondent methods
  const addRespondent = () => {
    setRespondents(prev => [
      ...prev,
      { id: 'resp_' + Date.now(), name: '', father: '', type: 'Private', address: '', phone: '' }
    ]);
  };

  const removeRespondent = (idx: number) => {
    setRespondents(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRespondent = (idx: number, field: keyof Respondent, val: any) => {
    setRespondents(prev =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );
  };

  // Chain Link methods
  const addChainLink = () => {
    setChainLinks(prev => [
      ...prev,
      {
        id: 'cl_' + Date.now(),
        deedNo: '',
        deedDate: '',
        vendor: '',
        purchaser: '',
        area: '',
        consideration: ''
      }
    ]);
  };

  const removeChainLink = (idx: number) => {
    setChainLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const updateChainLink = (idx: number, field: keyof ChainLink, val: string) => {
    setChainLinks(prev =>
      prev.map((cl, i) => (i === idx ? { ...cl, [field]: val } : cl))
    );
  };

  const verifyAndGenerateChain = () => {
    if (chainLinks.length === 0) {
      showToast('Add at least one deed link', 'error');
      return;
    }

    const sorted = [...chainLinks].sort((a, b) => {
      if (!a.deedDate) return 1;
      if (!b.deedDate) return -1;
      return new Date(a.deedDate).getTime() - new Date(b.deedDate).getTime();
    });

    const gaps: string[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const prevPurchaser = sorted[i - 1].purchaser.trim().toLowerCase();
      const currentVendor = sorted[i].vendor.trim().toLowerCase();
      if (prevPurchaser && currentVendor && prevPurchaser !== currentVendor) {
        gaps.push(
          `Deed #${sorted[i - 1].deedNo} purchaser "${sorted[i - 1].purchaser}" does not match Deed #${sorted[i].deedNo} vendor "${sorted[i].vendor}".`
        );
      }
    }

    setChainGaps(gaps);

    const html = `
      <div style="font-family:'Times New Roman',serif; padding: 16px;">
        <h3 style="text-align: center; color: #1E3A8A; margin-bottom: 4px;">CHRONOLOGICAL CHAIN OF TITLE</h3>
        <p style="text-align: center; font-size: 12px; color: #555; margin-bottom: 12px;">Case: ${caseNo || 'Draft Case'} · Party: ${party || 'Applicant'}</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background-color: #EFF6FF;">
              <th style="border: 1px solid #999; padding: 6px;">#</th>
              <th style="border: 1px solid #999; padding: 6px;">Deed No</th>
              <th style="border: 1px solid #999; padding: 6px;">Date</th>
              <th style="border: 1px solid #999; padding: 6px;">Vendor (দাতা)</th>
              <th style="border: 1px solid #999; padding: 6px;">Purchaser (গ্রহীতা)</th>
              <th style="border: 1px solid #999; padding: 6px;">Area</th>
              <th style="border: 1px solid #999; padding: 6px;">Consideration</th>
            </tr>
          </thead>
          <tbody>
            ${sorted
              .map(
                (l, i) => `<tr>
              <td style="border: 1px solid #999; padding: 6px; text-align: center;">${i + 1}</td>
              <td style="border: 1px solid #999; padding: 6px; font-weight: bold;">${l.deedNo || '—'}</td>
              <td style="border: 1px solid #999; padding: 6px;">${l.deedDate || '—'}</td>
              <td style="border: 1px solid #999; padding: 6px;">${l.vendor || '—'}</td>
              <td style="border: 1px solid #999; padding: 6px;">${l.purchaser || '—'}</td>
              <td style="border: 1px solid #999; padding: 6px;">${l.area || '—'}</td>
              <td style="border: 1px solid #999; padding: 6px;">${l.consideration || '—'}</td>
            </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    setChainSummaryHtml(html);
    showToast('Chain of title processed and verified');
  };

  const downloadChainWordDoc = () => {
    if (!chainSummaryHtml) {
      verifyAndGenerateChain();
    }
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Chain of Title - ${caseNo}</title></head>
        <body style="font-family:'Times New Roman',serif; padding:40px;">
          ${chainSummaryHtml}
        </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chain_Deed_${caseNo.replace(/[^a-zA-Z0-9]/g, '_') || 'Case'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chain Deed downloaded as Word (.doc)');
  };

  // Quick document attachment simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category?: string) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      let fType: 'pdf' | 'doc' | 'img' | 'other' = 'other';
      if (ext === 'pdf') fType = 'pdf';
      else if (['doc', 'docx'].includes(ext || '')) fType = 'doc';
      else if (['jpg', 'jpeg', 'png'].includes(ext || '')) fType = 'img';

      const sizeStr =
        f.size < 1024 * 1024
          ? (f.size / 1024).toFixed(1) + ' KB'
          : (f.size / (1024 * 1024)).toFixed(2) + ' MB';

      setAttachments(prev => [
        ...prev,
        {
          id: 'att_' + Date.now() + Math.random(),
          name: f.name,
          size: sizeStr,
          type: fType,
          date: new Date().toISOString().slice(0, 10),
          category: category || 'General Attachment'
        }
      ]);
    });
    showToast(`Attached ${files.length} document(s)`);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = (andSendWhatsApp = false) => {
    if (!caseNo.trim()) {
      showToast('Case Number is required', 'error');
      return;
    }
    if (!party.trim()) {
      showToast('Petitioner / Applicant Name is required', 'error');
      return;
    }

    const casePayload = {
      type,
      caseNo: caseNo.trim(),
      subType,
      status,
      party: party.trim(),
      opp: opp.trim(),
      forum,
      filingDate,
      nextDate,
      priority,
      appNo,
      grnNo,
      docketNo,
      impugnedOrderNo,
      impugnedOrderDate,
      grounds,
      bench,
      targetOfficer,
      notes,
      landSchedules,
      applicants,
      respondents,
      addresses,
      chainLinks,
      attachments
    };

    let resultCase: CaseItem;
    if (editingCase) {
      updateCase(editingCase.id, casePayload);
      resultCase = { ...editingCase, ...casePayload };
    } else {
      resultCase = addCase(casePayload);
    }

    if (andSendWhatsApp) {
      const applicantPhone = applicants[0]?.phone || '';
      const textMsg = encodeURIComponent(
        `Dear ${party}, your case ${caseNo} (${subType}) before ${forum} has been updated in our chamber book. Next Hearing Date: ${
          nextDate || 'To be fixed'
        }. - ${activeCompany?.name || 'Legal Chamber'}`
      );
      const cleanPhone = applicantPhone.replace(/[^0-9]/g, '');
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${textMsg}`
        : `https://wa.me/?text=${textMsg}`;
      window.open(waUrl, '_blank');
    }

    onSaved(resultCase);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              {editingCase ? `Edit ${editingCase.caseNo}` : `New ${SUBTYPES_BY_TYPE[type][0]}`}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chamber Case File Entry · {activeCompany?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Case File
          </button>
          <button
            onClick={() => handleSave(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Save and launch WhatsApp client update"
          >
            <Share2 className="w-4 h-4" /> Save & Alert WhatsApp
          </button>
        </div>
      </div>

      {/* 1. Core Case Details */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
          <span>1. Primary Case Registry Details</span>
          <span className="text-[11px] font-normal text-slate-400">Fields marked * are mandatory</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Case / OA / Appeal No *
            </label>
            <input
              type="text"
              required
              value={caseNo}
              onChange={e => setCaseNo(e.target.value)}
              placeholder="e.g. MUT/2026/0418"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-blue-700 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Sub-Type / Matter
            </label>
            <select
              value={subType}
              onChange={e => setSubType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {SUBTYPES_BY_TYPE[type].map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Current Case Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {STATUSES_BY_TYPE[type].map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Adjudicating Forum
            </label>
            <select
              value={forum}
              onChange={e => setForum(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {FORUMS_BY_TYPE[type].map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Petitioner / Applicant *
            </label>
            <input
              type="text"
              required
              value={party}
              onChange={e => setParty(e.target.value)}
              placeholder="Full name of client"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Opposite Party / Respondent
            </label>
            <input
              type="text"
              value={opp}
              onChange={e => setOpp(e.target.value)}
              placeholder="e.g. State of WB / Co-sharers"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Filing Date
            </label>
            <input
              type="date"
              value={filingDate}
              onChange={e => setFilingDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Next Hearing Date
            </label>
            <input
              type="date"
              value={nextDate}
              onChange={e => setNextDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold text-blue-700 dark:text-blue-400"
            />
          </div>
        </div>

        {/* Type-specific optional fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {type === 'mutation' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Banglarbhumi App No
                </label>
                <input
                  type="text"
                  value={appNo}
                  onChange={e => setAppNo(e.target.value)}
                  placeholder="MUT-RJ-2026-XXXX"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  GRN Fee Challan No
                </label>
                <input
                  type="text"
                  value={grnNo}
                  onChange={e => setGrnNo(e.target.value)}
                  placeholder="19202600XXXXXX"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </>
          )}

          {type === 'misc' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Docket Register No
              </label>
              <input
                type="text"
                value={docketNo}
                onChange={e => setDocketNo(e.target.value)}
                placeholder="DK-2026-XXXX"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          )}

          {type === 'lrappeal' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Impugned Order No
                </label>
                <input
                  type="text"
                  value={impugnedOrderNo}
                  onChange={e => setImpugnedOrderNo(e.target.value)}
                  placeholder="e.g. Order in Case No. 841/2025"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Impugned Order Date (Limitation Baseline)
                </label>
                <input
                  type="date"
                  value={impugnedOrderDate}
                  onChange={e => setImpugnedOrderDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent (Stay / Injunction)</option>
            </select>
          </div>
        </div>

        {/* Limitation Countdown Strip for LR Appeal */}
        {type === 'lrappeal' && limitationStats && (
          <div className="p-3.5 rounded-lg border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 text-blue-600" />
                Statutory Limitation Analysis (Days Elapsed: {limitationStats.daysElapsed})
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  limitationStats.statusSec54 === 'Safe'
                    ? 'bg-emerald-100 text-emerald-800'
                    : limitationStats.statusSec54 === 'Urgent'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                Section 54: {limitationStats.statusSec54}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Section 54 (60 Days)</div>
                <div className="font-mono font-bold mt-0.5">
                  {limitationStats.sec54DaysLeft >= 0
                    ? `${limitationStats.sec54DaysLeft} days remaining`
                    : `Expired by ${Math.abs(limitationStats.sec54DaysLeft)} days (Sec 5 required)`}
                </div>
              </div>

              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Section 51A(5) (30 Days)</div>
                <div className="font-mono font-bold mt-0.5">
                  {limitationStats.sec51ADaysLeft >= 0
                    ? `${limitationStats.sec51ADaysLeft} days remaining`
                    : `Expired by ${Math.abs(limitationStats.sec51ADaysLeft)} days`}
                </div>
              </div>

              <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Limitation Act (90 Days)</div>
                <div className="font-mono font-bold mt-0.5">
                  {limitationStats.sec5DaysLeft >= 0
                    ? `${limitationStats.sec5DaysLeft} days remaining`
                    : `Exceeded standard 90 days`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Land Schedule(s) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              2. Land Schedule Details (জমির তফসিল)
            </span>
            <span className="text-[11px] text-slate-400 ml-2">
              ({landSchedules.length} Schedule{landSchedules.length > 1 ? 's' : ''})
            </span>
          </div>
          <button
            type="button"
            onClick={addLandSchedule}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Schedule
          </button>
        </div>

        <div className="space-y-3">
          {landSchedules.map((sched, idx) => (
            <div
              key={sched.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Schedule #{idx + 1}
                </div>
                {landSchedules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLandSchedule(idx)}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    District (জেলা)
                  </label>
                  <select
                    value={sched.district}
                    onChange={e => updateSchedule(idx, 'district', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {Object.keys(wbDistricts)
                      .sort()
                      .map(d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Block (ব্লক / থানা)
                  </label>
                  <select
                    value={sched.block}
                    onChange={e => updateSchedule(idx, 'block', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {(wbDistricts[sched.district] || []).map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Mouza Name (মৌজা)
                  </label>
                  <input
                    type="text"
                    value={sched.mouza}
                    onChange={e => updateSchedule(idx, 'mouza', e.target.value)}
                    placeholder="e.g. Patharghata / Sarisha"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    J.L. No (জে.এল)
                  </label>
                  <input
                    type="text"
                    value={sched.jl}
                    onChange={e => updateSchedule(idx, 'jl', e.target.value)}
                    placeholder="36"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Khatian No (খতিয়ান)
                  </label>
                  <input
                    type="text"
                    value={sched.khatian}
                    onChange={e => updateSchedule(idx, 'khatian', e.target.value)}
                    placeholder="1428"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Dag No (দাগ)
                  </label>
                  <input
                    type="text"
                    value={sched.dag}
                    onChange={e => updateSchedule(idx, 'dag', e.target.value)}
                    placeholder="482"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Area (পরিমাণ)
                  </label>
                  <input
                    type="text"
                    value={sched.area}
                    onChange={e => updateSchedule(idx, 'area', e.target.value)}
                    placeholder="0.08"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Unit (একক)
                  </label>
                  <select
                    value={sched.unit}
                    onChange={e => updateSchedule(idx, 'unit', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="acre">Acre (একর)</option>
                    <option value="satak">Satak / Decimal (শতক)</option>
                    <option value="bigha">Bigha (বিঘা)</option>
                    <option value="katha">Katha (কাঠা)</option>
                    <option value="sqft">Sq. Ft.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Class (শ্রেণি)
                  </label>
                  <select
                    value={sched.classification}
                    onChange={e => updateSchedule(idx, 'classification', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="Bastu">Bastu (বাস্তু)</option>
                    <option value="Sali">Sali (শালি)</option>
                    <option value="Danga">Danga (ডাঙা)</option>
                    <option value="Pond">Pond / Pukur (পুকুর)</option>
                    <option value="Commercial">Commercial (বাণিজ্যিক)</option>
                    <option value="Karkhana">Factory / Karkhana</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Applicants & Respondents Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Applicants */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              3A. Applicant(s) / Petitioner
            </span>
            <button
              type="button"
              onClick={addApplicant}
              className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          <div className="space-y-2.5">
            {applicants.map((a, i) => (
              <div
                key={a.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Applicant #{i + 1}</span>
                  {applicants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeApplicant(i)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={a.name}
                    onChange={e => updateApplicant(i, 'name', e.target.value)}
                    placeholder="Full Name"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={a.father}
                    onChange={e => updateApplicant(i, 'father', e.target.value)}
                    placeholder="Father / Husband"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={a.phone || ''}
                    onChange={e => updateApplicant(i, 'phone', e.target.value)}
                    placeholder="Phone / WhatsApp"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={a.address}
                    onChange={e => updateApplicant(i, 'address', e.target.value)}
                    placeholder="Residential Address"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Respondents */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              3B. Opposite Party / Respondent(s)
            </span>
            <button
              type="button"
              onClick={addRespondent}
              className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          <div className="space-y-2.5">
            {respondents.map((r, i) => (
              <div
                key={r.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Respondent #{i + 1}</span>
                  {respondents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRespondent(i)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={r.name}
                    onChange={e => updateRespondent(i, 'name', e.target.value)}
                    placeholder="Name / Authority"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <select
                    value={r.type}
                    onChange={e => updateRespondent(i, 'type', e.target.value)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="State">State of West Bengal</option>
                    <option value="Govt Dept">Govt Department / Officer</option>
                    <option value="Private">Private Party / Co-sharer</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={r.address}
                  onChange={e => updateRespondent(i, 'address', e.target.value)}
                  placeholder="Official / Residential Address"
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Chain of Title Builder (Chain Deeds) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              4. Chronological Chain Deed Builder (ধারাবাহিক দলিল)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Record deed lineage from parent vendor to current purchaser. Auto-detects breaks in title continuity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addChainLink}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Deed Link
            </button>
            {chainLinks.length > 0 && (
              <button
                type="button"
                onClick={verifyAndGenerateChain}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Verify Continuity
              </button>
            )}
          </div>
        </div>

        {chainLinks.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            No link deeds added. Click "Add Deed Link" to enter historical conveyances.
          </p>
        ) : (
          <div className="space-y-3">
            {chainLinks.map((cl, i) => (
              <div
                key={cl.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Deed Link #{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeChainLink(i)}
                    className="text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={cl.deedNo}
                    onChange={e => updateChainLink(i, 'deedNo', e.target.value)}
                    placeholder="Deed No (e.g. 1120/1984)"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                  <input
                    type="date"
                    value={cl.deedDate}
                    onChange={e => updateChainLink(i, 'deedDate', e.target.value)}
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                  <input
                    type="text"
                    value={cl.vendor}
                    onChange={e => updateChainLink(i, 'vendor', e.target.value)}
                    placeholder="Vendor (দাতা / বিক্রেতা)"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={cl.purchaser}
                    onChange={e => updateChainLink(i, 'purchaser', e.target.value)}
                    placeholder="Purchaser (গ্রহীতা / ক্রেতা)"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cl.area}
                    onChange={e => updateChainLink(i, 'area', e.target.value)}
                    placeholder="Transferred Area (e.g. 0.08 Acre)"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={cl.consideration}
                    onChange={e => updateChainLink(i, 'consideration', e.target.value)}
                    placeholder="Consideration Value (e.g. ₹ 28,50,000)"
                    className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Alert / Output */}
        {chainGaps.length > 0 && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Title Continuity Discrepancies Detected:
            </div>
            {chainGaps.map((gap, idx) => (
              <div key={idx}>· {gap}</div>
            ))}
          </div>
        )}

        {chainSummaryHtml && (
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Formatted Chain of Title Generated
              </span>
              <button
                type="button"
                onClick={downloadChainWordDoc}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download as Word (.doc)
              </button>
            </div>
            <div
              className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 text-xs overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: chainSummaryHtml }}
            />
          </div>
        )}
      </div>

      {/* 5. Document Attachments & Vault links */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            5. Case Document Attachments (কাগজপত্র ও দলিল)
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Attach registered deeds, ROR Khatians, Waris certificates, and vakalatnama.
          </p>
        </div>

        {/* Quick doc upload pills */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Registered Deed</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={e => handleFileUpload(e, 'Registered Deed')}
            />
          </label>

          <label className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5 text-purple-600" />
            <span>+ Khatian Copy</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={e => handleFileUpload(e, 'Khatian Copy')}
            />
          </label>

          <label className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Waris Certificate</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={e => handleFileUpload(e, 'Waris Certificate')}
            />
          </label>

          <label className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Vakalatnama</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={e => handleFileUpload(e, 'Vakalatnama')}
            />
          </label>

          <label className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5 text-rose-600" />
            <span>+ Certified Copy</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={e => handleFileUpload(e, 'Certified Copy')}
            />
          </label>
        </div>

        {/* Attachment list */}
        {attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {attachments.map(att => (
              <div
                key={att.id}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {att.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {att.category} · {att.size} · {att.date}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Remove attachment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No documents attached yet.</p>
        )}
      </div>

      {/* Case Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Chamber Internal Notes & Instructions
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Enter notes on caveat check, BL&LRO inquiry remarks, client fee balance..."
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Case
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" /> Save & Launch WhatsApp
        </button>
      </div>
    </div>
  );
};
