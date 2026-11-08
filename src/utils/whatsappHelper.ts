import { Company, CaseItem } from '../types';
import { safeOpenWhatsApp } from './printDoc';

export interface HearingNoticeParams {
  clientName: string;
  clientPhone: string;
  caseNo: string;
  caseType?: string;
  subType?: string;
  forum?: string;
  nextDate: string;
  mouza?: string;
  dag?: string;
  khatian?: string;
}

export interface DeliveryNoticeParams {
  clientName: string;
  clientPhone: string;
  caseNo?: string;
  docTitle: string; // e.g. "Certified Copy of Registered Deed No. 1234/2024" or "ROR Khatian Parcha"
  forumOrDeed?: string;
  dag?: string;
  khatian?: string;
}

/**
 * Generate formatted Hearing Alert text based on Chamber WhatsApp settings
 * Supports both signatures:
 * - buildHearingNoticeText(company, params)
 * - buildHearingNoticeText(caseItem, company)
 */
export function buildHearingNoticeText(
  first: Company | CaseItem | null | undefined,
  second?: HearingNoticeParams | Company | null
): string {
  let company: Company | null | undefined;
  let params: HearingNoticeParams;

  if (first && 'type' in first && 'id' in first) {
    // first is CaseItem, second is Company
    const c = first as CaseItem;
    company = second as Company | null | undefined;
    const applicantPhone = c.applicants?.[0]?.phone || '';
    const firstSchedule = c.landSchedules?.[0];
    params = {
      clientName: c.party || 'Client',
      clientPhone: applicantPhone,
      caseNo: c.caseNo || c.appNo || '',
      caseType: c.type,
      subType: c.subType,
      forum: c.forum,
      nextDate: c.nextDate || '',
      mouza: firstSchedule?.mouza ? `${firstSchedule.mouza}${firstSchedule.jl ? ` (JL ${firstSchedule.jl})` : ''}` : undefined,
      dag: firstSchedule?.dag,
      khatian: firstSchedule?.khatian
    };
  } else {
    // first is Company, second is HearingNoticeParams
    company = first as Company | null | undefined;
    params = (second as HearingNoticeParams) || {
      clientName: 'Client',
      clientPhone: '',
      caseNo: '',
      nextDate: ''
    };
  }

  const settings = company?.whatsappSettings;
  const lang = settings?.defaultLanguage || 'bilingual';
  const chamberName = company?.name || 'Legal Chamber';
  const barReg = settings?.includeBarCouncil !== false && company?.barCouncil ? `Bar Reg: ${company.barCouncil}` : '';
  const signature = settings?.chamberSignature || chamberName;

  const caseTitle = params.caseNo ? `Case No: ${params.caseNo}` : 'Land Case Matter';
  const forumText = params.forum ? params.forum : 'Revenue Court / Forum';
  const dateText = params.nextDate || 'To be notified';
  const landInfo = [
    params.mouza ? `Mouza: ${params.mouza}` : '',
    params.dag ? `Dag No: ${params.dag}` : '',
    params.khatian ? `Khatian: ${params.khatian}` : ''
  ].filter(Boolean).join(' | ');

  if (lang === 'bn') {
    return (
`সম্মানীয় ${params.clientName || 'মক্কেল'},
আপনার মামলার শুনানির নোটিশ:
🏛️ আদালত / দপ্তর: ${forumText}
📋 মামলা নম্বর: ${caseTitle} ${params.subType ? `(${params.subType})` : ''}
📅 শুনানির তারিখ: ${dateText}
${landInfo ? `📍 জমির বিবরণ: ${landInfo}\n` : ''}
অনুগ্রহ করে শুনানির দিন প্রয়োজনীয় মূল নথিপত্রসহ নির্দিষ্ট সময়ে উপস্থিত থাকুন।

শুভেচ্ছান্তে,
${signature}
${barReg ? `(${barReg})\n` : ''}${company?.phone ? `যোগাযোগ: ${company.phone}` : ''}`
    ).trim();
  }

  if (lang === 'en') {
    return (
`Respected ${params.clientName || 'Client'},
Notice of Scheduled Hearing:
🏛️ Forum / Authority: ${forumText}
📋 Case Reference: ${caseTitle} ${params.subType ? `(${params.subType})` : ''}
📅 Next Hearing Date: ${dateText}
${landInfo ? `📍 Land Schedule: ${landInfo}\n` : ''}
Kindly attend the proceedings with relevant original records.

Regards,
${signature}
${barReg ? `(${barReg})\n` : ''}${company?.phone ? `Contact: ${company.phone}` : ''}`
    ).trim();
  }

  // Bilingual (Default & Recommended)
  return (
`সম্মানীয় / Respected ${params.clientName || 'Client'},
শুনানির নোটিশ / Hearing Notice:
🏛️ আদালত / Forum: ${forumText}
📋 মামলা নম্বর / Case No: ${caseTitle} ${params.subType ? `(${params.subType})` : ''}
📅 শুনানির তারিখ / Hearing Date: ${dateText}
${landInfo ? `📍 জমির বিবরণ / Land Schedule: ${landInfo}\n` : ''}
নির্দিষ্ট সময়ে প্রয়োজনীয় নথিসহ শুনানিতে উপস্থিত থাকার অনুরোধ করা হচ্ছে।
Please attend the hearing with necessary case documents.

— ${signature}
${barReg ? `(${barReg})\n` : ''}${company?.phone ? `Ph: ${company.phone}` : ''}`
  ).trim();
}

/**
 * Generate formatted Document Delivery Alert (Certified copy / ROR parcha ready for pickup)
 * Supports both signatures:
 * - buildDeliveryNoticeText(company, params)
 * - buildDeliveryNoticeText(caseItem, company)
 */
export function buildDeliveryNoticeText(
  first: Company | CaseItem | null | undefined,
  second?: DeliveryNoticeParams | Company | null
): string {
  let company: Company | null | undefined;
  let params: DeliveryNoticeParams;

  if (first && 'type' in first && 'id' in first) {
    // first is CaseItem, second is Company
    const c = first as CaseItem;
    company = second as Company | null | undefined;
    const applicantPhone = c.applicants?.[0]?.phone || '';
    const isCertCopy = c.type === 'certcopy';
    const docTitle = isCertCopy
      ? `Certified Copy of Registered Deed (Deed No: ${c.applicantDeedNo || c.deedNo || '—'}, Year: ${c.applicantDeedYear || c.deedYear || '—'})`
      : `Certified ROR / Plot Information (${c.landSchedules?.[0]?.recordType || 'ROR'})`;
    const refNo = c.appNo || c.ainNo || c.rorPiNo || c.caseNo || '';

    params = {
      clientName: c.party || 'Applicant',
      clientPhone: applicantPhone,
      caseNo: refNo,
      docTitle,
      forumOrDeed: isCertCopy ? (c.applicantAdsr || c.adsr) : c.forum
    };
  } else {
    company = first as Company | null | undefined;
    params = (second as DeliveryNoticeParams) || {
      clientName: 'Client',
      clientPhone: '',
      docTitle: 'Certified Document'
    };
  }

  const settings = company?.whatsappSettings;
  const lang = settings?.defaultLanguage || 'bilingual';
  const chamberName = company?.name || 'Legal Chamber';
  const barReg = settings?.includeBarCouncil !== false && company?.barCouncil ? `Bar Reg: ${company.barCouncil}` : '';
  const signature = settings?.chamberSignature || chamberName;

  if (lang === 'bn') {
    return (
`সম্মানীয় ${params.clientName || 'মক্কেল'},
আপনার আবেদনের প্রেক্ষিতে ${params.docTitle} সংগ্রহ ও প্রস্তুত হয়েছে। 
নথিটি আমাদের চেম্বার থেকে সংগ্রহ করে নিতে অনুরোধ করা হচ্ছে।
${params.caseNo ? `রেফারেন্স নম্বর: ${params.caseNo}\n` : ''}
ধন্যবাদান্তে,
${signature}
${barReg ? `(${barReg})\n` : ''}${company?.phone ? `যোগাযোগ: ${company.phone}` : ''}`
    ).trim();
  }

  if (lang === 'en') {
    return (
`Respected ${params.clientName || 'Client'},
Your requested document (${params.docTitle}) has been prepared and is ready for collection.
Please visit the chamber during office hours to collect your original records.
${params.caseNo ? `Reference: ${params.caseNo}\n` : ''}
Regards,
${signature}
${barReg ? `(${barReg})\n` : ''}${company?.phone ? `Contact: ${company.phone}` : ''}`
    ).trim();
  }

  // Bilingual
  return (
`সম্মানীয় / Respected ${params.clientName || 'Client'},
নথি সরবরাহের নোটিশ / Document Collection Notice:
আপনার ${params.docTitle} প্রস্তুত হয়েছে।
Your requested document (${params.docTitle}) is ready for delivery.
অনুগ্রহ করে চেম্বার থেকে নথিটি সংগ্রহ করুন।
Please visit our chamber to collect the document.
${params.caseNo ? `Ref: ${params.caseNo}\n` : ''}
— ${signature}
${barReg ? `(${barReg})\n` : ''}${company?.phone ? `Ph: ${company.phone}` : ''}`
  ).trim();
}

/**
 * Helper to open WhatsApp with sanitized phone & message
 */
export function dispatchWhatsApp(phone: string, text: string): void {
  safeOpenWhatsApp(phone, text);
}
