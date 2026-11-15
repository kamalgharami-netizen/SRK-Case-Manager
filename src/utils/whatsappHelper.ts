import { Company, CaseItem, FinancialEntry, PartyLedgerEntry, AccountTransaction } from '../types';
import { safeOpenWhatsApp } from './printDoc';

const inr = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

function getFooterMeta(company: Company | null | undefined) {
  const settings = company?.whatsappSettings;
  const lang = settings?.defaultLanguage || 'bilingual';
  const chamberName = company?.name || 'Legal Chamber';
  const barReg =
    settings?.includeBarCouncil !== false && company?.barCouncil
      ? `Bar Reg: ${company.barCouncil}`
      : '';
  const signature = settings?.chamberSignature || chamberName;
  const phone = company?.phone || '';
  return { lang, chamberName, barReg, signature, phone };
}

/**
 * Generate WhatsApp receipt/voucher alert for an Office Income or Expense transaction
 */
export function buildOfficeAccountTransactionText(
  company: Company | null | undefined,
  entry: Pick<FinancialEntry, 'kind' | 'date' | 'amount' | 'category' | 'partyName' | 'paymentMode' | 'reference' | 'notes'>
): string {
  const { lang, barReg, signature, phone } = getFooterMeta(company);
  const amountStr = inr(entry.amount);
  const partyLabel = entry.partyName || (lang === 'bn' ? 'মক্কেল / প্রাপক' : 'Sir/Madam');
  const isIncome = entry.kind === 'income';

  if (lang === 'bn') {
    return (
`সম্মানীয় ${partyLabel},
${isIncome ? 'টাকা প্রাপ্তির রসিদ (আয় এন্ট্রি)' : 'লেনদেন ভাউচার বিজ্ঞপ্তি (ব্যয় এন্ট্রি)'}:
📅 তারিখ: ${entry.date}
💰 পরিমাণ: ${amountStr}
📂 খাত: ${entry.category}
💳 মাধ্যম: ${entry.paymentMode}${entry.reference ? `\n🔖 রেফারেন্স: ${entry.reference}` : ''}${entry.notes ? `\n📝 বিবরণ: ${entry.notes}` : ''}

ধন্যবাদান্তে,
${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `যোগাযোগ: ${phone}` : ''}`
    ).trim();
  }

  if (lang === 'en') {
    return (
`Dear ${partyLabel},
${isIncome ? 'Payment Receipt Confirmation' : 'Chamber Transaction Notice'}:
📅 Date: ${entry.date}
💰 Amount: ${amountStr}
📂 Category: ${entry.category}
💳 Mode: ${entry.paymentMode}${entry.reference ? `\n🔖 Ref No: ${entry.reference}` : ''}${entry.notes ? `\n📝 Notes: ${entry.notes}` : ''}

Regards,
${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `Contact: ${phone}` : ''}`
    ).trim();
  }

  return (
`সম্মানীয় / Dear ${partyLabel},
${isIncome ? 'টাকা প্রাপ্তির রসিদ / Payment Receipt' : 'লেনদেন বিজ্ঞপ্তি / Transaction Notice'}:
📅 তারিখ / Date: ${entry.date}
💰 পরিমাণ / Amount: ${amountStr}
📂 খাত / Category: ${entry.category}
💳 মাধ্যম / Mode: ${entry.paymentMode}${entry.reference ? `\n🔖 Ref: ${entry.reference}` : ''}${entry.notes ? `\n📝 Notes: ${entry.notes}` : ''}

— ${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `Ph: ${phone}` : ''}`
  ).trim();
}

/**
 * Generate WhatsApp alert for a Client Ledger transaction (Fee/Charge Due or Payment Received)
 */
export function buildClientLedgerTransactionText(
  company: Company | null | undefined,
  entry: Pick<PartyLedgerEntry, 'partyName' | 'date' | 'type' | 'amount' | 'description' | 'paymentMode' | 'reference'>,
  balanceSummary?: { charges: number; receipts: number; balance: number }
): string {
  const { lang, barReg, signature, phone } = getFooterMeta(company);
  const amountStr = inr(entry.amount);
  const isReceipt = entry.type === 'receipt';

  const balanceLineBn = balanceSummary
    ? balanceSummary.balance > 0
      ? `📊 বর্তমান বকেয়া: ${inr(balanceSummary.balance)}`
      : balanceSummary.balance < 0
      ? `📊 বর্তমান অগ্রিম জমা: ${inr(-balanceSummary.balance)}`
      : `📊 বর্তমান হিসাব: সম্পূর্ণ পরিশোধিত (₹0)`
    : '';

  const balanceLineEn = balanceSummary
    ? balanceSummary.balance > 0
      ? `📊 Current Outstanding Due: ${inr(balanceSummary.balance)}`
      : balanceSummary.balance < 0
      ? `📊 Current Advance Balance: ${inr(-balanceSummary.balance)}`
      : `📊 Current Balance: Settled (₹0)`
    : '';

  if (lang === 'bn') {
    return (
`সম্মানীয় ${entry.partyName},
${isReceipt ? 'মক্কেল হিসাব — টাকা প্রাপ্তির রসিদ' : 'মক্কেল হিসাব — ফি / খরচ ধার্যের তথ্য'}:
📅 তারিখ: ${entry.date}
💰 পরিমাণ: ${amountStr}
📝 বিবরণ: ${entry.description}${entry.paymentMode ? `\n💳 মাধ্যম: ${entry.paymentMode}` : ''}${entry.reference ? `\n🔖 রেফারেন্স: ${entry.reference}` : ''}
${balanceLineBn ? `${balanceLineBn}\n` : ''}
ধন্যবাদান্তে,
${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `যোগাযোগ: ${phone}` : ''}`
    ).trim();
  }

  if (lang === 'en') {
    return (
`Dear ${entry.partyName},
${isReceipt ? 'Client Ledger — Payment Receipt' : 'Client Ledger — Fee / Expense Notice'}:
📅 Date: ${entry.date}
💰 Amount: ${amountStr}
📝 Particulars: ${entry.description}${entry.paymentMode ? `\n💳 Mode: ${entry.paymentMode}` : ''}${entry.reference ? `\n🔖 Ref: ${entry.reference}` : ''}
${balanceLineEn ? `${balanceLineEn}\n` : ''}
Regards,
${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `Contact: ${phone}` : ''}`
    ).trim();
  }

  const balanceLineBi = balanceSummary
    ? balanceSummary.balance > 0
      ? `📊 বকেয়া / Current Due: ${inr(balanceSummary.balance)}`
      : balanceSummary.balance < 0
      ? `📊 অগ্রিম / Advance Credit: ${inr(-balanceSummary.balance)}`
      : `📊 স্থিতি / Balance: পরিশোধিত / Settled (₹0)`
    : '';

  return (
`সম্মানীয় / Dear ${entry.partyName},
${isReceipt ? 'টাকা প্রাপ্তির রসিদ / Payment Receipt' : 'ফি ও খরচের বিবরণ / Fee & Expense Notice'}:
📅 তারিখ / Date: ${entry.date}
💰 পরিমাণ / Amount: ${amountStr}
📝 বিবরণ / Details: ${entry.description}${entry.paymentMode ? `\n💳 মাধ্যম / Mode: ${entry.paymentMode}` : ''}${entry.reference ? `\n🔖 Ref: ${entry.reference}` : ''}
${balanceLineBi ? `${balanceLineBi}\n` : ''}
— ${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `Ph: ${phone}` : ''}`
  ).trim();
}

/**
 * Generate WhatsApp statement summary for a Client's overall ledger balance
 */
export function buildClientBalanceSummaryText(
  company: Company | null | undefined,
  summary: { partyName: string; charges: number; receipts: number; balance: number }
): string {
  const { lang, barReg, signature, phone } = getFooterMeta(company);

  if (lang === 'bn') {
    return (
`সম্মানীয় ${summary.partyName},
আপনার মামলার ফি ও খরচের হিসাবের সারাংশ:
• মোট ধার্য (ফি/খরচ): ${inr(summary.charges)}
• মোট আদায় / জমা: ${inr(summary.receipts)}
• ${summary.balance > 0 ? `বর্তমান বকেয়া: ${inr(summary.balance)}` : summary.balance < 0 ? `বর্তমান অগ্রিম: ${inr(-summary.balance)}` : 'বর্তমান স্থিতি: ₹0 (পরিশোধিত)'}

ধন্যবাদান্তে,
${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `যোগাযোগ: ${phone}` : ''}`
    ).trim();
  }

  if (lang === 'en') {
    return (
`Dear ${summary.partyName},
Client Account Balance Summary:
• Total Charges / Fees: ${inr(summary.charges)}
• Total Received: ${inr(summary.receipts)}
• ${summary.balance > 0 ? `Outstanding Due: ${inr(summary.balance)}` : summary.balance < 0 ? `Advance Credit: ${inr(-summary.balance)}` : 'Net Balance: ₹0 (Settled)'}

Regards,
${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `Contact: ${phone}` : ''}`
    ).trim();
  }

  return (
`সম্মানীয় / Dear ${summary.partyName},
মক্কেল হিসাব সারাংশ / Account Balance Summary:
• মোট ধার্য / Total Charges: ${inr(summary.charges)}
• মোট জমা / Total Received: ${inr(summary.receipts)}
• ${summary.balance > 0 ? `বকেয়া / Due: ${inr(summary.balance)}` : summary.balance < 0 ? `অগ্রিম / Advance: ${inr(-summary.balance)}` : 'স্থিতি / Balance: ₹0 (Settled)'}

— ${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `Ph: ${phone}` : ''}`
  ).trim();
}

/**
 * Generate WhatsApp notification for a Cash & Bank Register transaction
 */
export function buildCashBankTransactionText(
  company: Company | null | undefined,
  tx: Pick<AccountTransaction, 'date' | 'kind' | 'amount' | 'description' | 'reference'>,
  accountName: string
): string {
  const { lang, barReg, signature, phone } = getFooterMeta(company);
  const kindMapEn: Record<AccountTransaction['kind'], string> = {
    deposit: 'Cash/Bank Deposit',
    withdrawal: 'Cash/Bank Withdrawal',
    'transfer-in': 'Account Transfer Received',
    'transfer-out': 'Account Transfer Sent'
  };
  const kindMapBn: Record<AccountTransaction['kind'], string> = {
    deposit: 'নগদ / ব্যাংক জমা',
    withdrawal: 'নগদ / ব্যাংক উত্তোলন',
    'transfer-in': 'অ্যাকাউন্ট ট্রান্সফার প্রাপ্তি',
    'transfer-out': 'অ্যাকাউন্ট ট্রান্সফার প্রেরণ'
  };

  if (lang === 'bn') {
    return (
`চেম্বার নগদ ও ব্যাংক লেনদেনের তথ্য:
🏦 অ্যাকাউন্ট: ${accountName}
📌 ধরন: ${kindMapBn[tx.kind]}
📅 তারিখ: ${tx.date}
💰 পরিমাণ: ${inr(tx.amount)}
📝 বিবরণ: ${tx.description}${tx.reference ? `\n🔖 রেফারেন্স: ${tx.reference}` : ''}

— ${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `যোগাযোগ: ${phone}` : ''}`
    ).trim();
  }

  if (lang === 'en') {
    return (
`Chamber Cash & Bank Transaction Update:
🏦 Account: ${accountName}
📌 Type: ${kindMapEn[tx.kind]}
📅 Date: ${tx.date}
💰 Amount: ${inr(tx.amount)}
📝 Description: ${tx.description}${tx.reference ? `\n🔖 Ref: ${tx.reference}` : ''}

— ${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `Contact: ${phone}` : ''}`
    ).trim();
  }

  return (
`নগদ ও ব্যাংক লেনদেন / Cash & Bank Update:
🏦 অ্যাকাউন্ট / Account: ${accountName}
📌 ধরন / Type: ${kindMapBn[tx.kind]} (${kindMapEn[tx.kind]})
📅 তারিখ / Date: ${tx.date}
💰 পরিমাণ / Amount: ${inr(tx.amount)}
📝 বিবরণ / Details: ${tx.description}${tx.reference ? `\n🔖 Ref: ${tx.reference}` : ''}

— ${signature}
${barReg ? `(${barReg})\n` : ''}${phone ? `Ph: ${phone}` : ''}`
  ).trim();
}

/**
 * Dispatch WhatsApp strictly inside the app (never opens WhatsApp Desktop or browser wa.me)
 */
export function dispatchWhatsApp(
  phone: string,
  text: string,
  meta?: { partyId?: string; partyName?: string; autoSendIfConnected?: boolean; title?: string }
): void {
  safeOpenWhatsApp(phone, text, meta);
}


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

