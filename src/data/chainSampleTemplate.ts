import { CaseItem } from '../types';

export const DEFAULT_CHAIN_SAMPLE_TEMPLATE = `CHRONOLOGICAL CHAIN OF TITLE & CONVEYANCE STATEMENT
(মালিকানা স্বত্ব ও ধারাবাহিক দলিল হস্তান্তরের খসড়া বিবরণী)
Before the Competent Revenue Forum / Court: {{FORUM}}
Case Reference No: {{CASE_NO}}
Subject: Land Title Verification & Flow of Ownership

1. PARTICULARS OF THE PRESENT PROCEEDING (মামলার বিবরণ):
• Case Number: {{CASE_NO}}
• Competent Forum: {{FORUM}}
• Present Transferee / Petitioner: {{PARTY}}
• Present Transferor / Opposite Party: {{OPP}}
• Case Sub-Type: {{SUBTYPE}}
• Filing Date: {{FILING_DATE}}
• Next Hearing Date: {{NEXT_DATE}}

2. SCHEDULE OF SUBJECT PROPERTY (সম্পত্তির তপশীল বিবরণ):
• District: {{DISTRICT}}
• Sub-Division / Block: {{BLOCK}}
• Mouza & J.L. No.: {{MOUZA}} (J.L. No. {{JL}})
• Khatian No. (খতিয়ান): {{KHATIAN}}
• Dag No. (দাগ নং): {{DAG}}
• Land Classification (জমির শ্রেণি): {{CLASSIFICATION}}
• Quantum of Land (জমির পরিমাণ): {{AREA}} {{UNIT}}
• Co-Sharer / Transfer Share: {{SHARE}}

3. CHRONOLOGICAL SUMMARY OF REGISTERED VIA DEEDS (ধারাবাহিক ভায়া দলিলের বিবরণ):
{{CHAIN_DEEDS_TABLE}}

4. DETAILED RECITAL & FLOW OF OWNERSHIP (মালিকানা হস্তান্তরের ধারাবাহিক ইতিহাস):
(A) Origin of Title (মূল স্বত্বাধিকারী):
Originally, the schedule land comprised in Mouza {{MOUZA}}, J.L. No. {{JL}}, Khatian No. {{KHATIAN}}, Dag No. {{DAG}} was validly recorded in the name of the original recorded Rayat in C.S. / R.S. settlement records under the Government of West Bengal, with absolute title and peaceful possession.

(B) Successive Registered Conveyances (পর্যায়ক্রমিক হস্তান্তর বিবরণ):
{{CHAIN_DEED_NARRATIVE}}

(C) Present Title & Lawful Possession of {{PARTY}}:
By virtue of the latest registered deed(s) and physical possession delivered on spot, the petitioner {{PARTY}} has acquired indefeasible, valid, unencumbered right, title, interest, and physical possession over the schedule land. The said land is not vested in the State under Section 14Z or Section 14M of the WBLR Act 1955, nor is there any ceiling violation or court attachment.

(D) Advocate Title Conclusion:
The Chain of Title Deeds has been verified chronologically without any break or discrepancy. The petitioner is in exclusive possession and paying revenue to the State. Requisite mutation / relief is prayed to be recorded in favour of the petitioner {{PARTY}}.

Advocate for the Petitioner
Chamber: {{CHAMBER_NAME}}
Bar Council Registration: {{BAR_COUNCIL}}
Place: {{CITY}}, West Bengal
Date: {{TODAY_DATE}}`;

export function generateChainDeedText(
  caseItem: CaseItem,
  template: string,
  chamberName: string = 'Legal Chamber',
  barCouncil: string = 'WB/Bar',
  city: string = 'Kolkata'
): string {
  const schedule = caseItem.landSchedules?.[0] || {
    district: 'South 24 Parganas',
    block: 'Canning-I',
    mouza: 'Dighirpar',
    jl: '42',
    khatian: '1240',
    dag: '315',
    area: '10',
    unit: 'Satak',
    classification: 'Bastu',
    share: '0.2500 (2500 Hisya)'
  };

  const chainLinks = [...(caseItem.chainLinks || [])].sort((a, b) => {
    if (!a.deedDate) return 1;
    if (!b.deedDate) return -1;
    return new Date(a.deedDate).getTime() - new Date(b.deedDate).getTime();
  });

  // Build markdown/text table for chain deeds & warish transitions
  let deedsTable = '';
  if (chainLinks.length > 0) {
    deedsTable = `| Sl. | Transition Type | Deed / Certificate | Year / Date | SRO / Issuing Authority | Predecessor / Vendor | Successor / Chain Buyer | Area / Share |\n|---|---|---|---|---|---|---|---|\n`;
    chainLinks.forEach((link, idx) => {
      const typeLabel = link.linkType === 'warish' ? 'Warish (ওয়ারিশান)' : (link.deedType || 'Deed (দলিল)');
      const docLabel = link.linkType === 'warish' ? (link.certificateRef || 'Warishan Cert.') : `Deed No. ${link.deedNo || '—'}`;
      const yearDate = link.deedYear ? `${link.deedYear} (${link.deedDate || '—'})` : (link.deedDate || '—');
      const office = link.registrationOffice || '—';
      deedsTable += `| ${idx + 1} | ${typeLabel} | ${docLabel} | ${yearDate} | ${office} | ${link.vendor || '—'} | ${link.purchaser || '—'} | ${link.area || '—'} |\n`;
    });
  } else {
    deedsTable = `(No chronological title links recorded yet. Add Recorded Owner, Warish, and Chain Buyer deeds.)`;
  }

  // Build narrative paragraphs
  let narrative = '';
  if (chainLinks.length > 0) {
    narrative = chainLinks
      .map((link, idx) => {
        if (link.linkType === 'warish') {
          return `Step ${idx + 1} [Succession / ওয়ারিশান সূত্রে প্রাপ্ত]: Upon the demise of the prior owner ${link.vendor || 'predecessor'}, their right, title, and possession over the schedule land lawfully devolved upon the surviving legal heirs (Warishan) namely ${link.purchaser || 'legal heirs'} ${link.warishDetails ? `(${link.warishDetails})` : ''}, as confirmed under ${link.certificateRef || 'competent Legal Heir / Warishan Certificate'}.`;
        } else {
          const deedTypeDesc = link.deedType || 'Registered Deed';
          const yearStr = link.deedYear ? ` of the year ${link.deedYear}` : '';
          return `Step ${idx + 1} [Conveyance by ${deedTypeDesc} / দলিলমূলে হস্তান্তর]: By ${deedTypeDesc} bearing Deed No. ${link.deedNo || '—'}${yearStr} executed on ${link.deedDate || '—'} and registered at ${link.registrationOffice || 'concerned Registration Office'}, the transferor/vendor ${link.vendor || '—'} lawfully sold, conveyed, and transferred land measuring ${link.area || '—'} for a consideration of ${link.consideration || 'valuable consideration'} unto the chain purchaser/buyer ${link.purchaser || '—'}, and delivered peaceful, physical possession thereof.`;
        }
      })
      .join('\n\n');
  } else {
    narrative = `The title has devolved through consecutive registered deeds and warishan succession from the recorded owner unto the present applicant.`;
  }

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const replaced = template
    .replace(/{{CASE_NO}}/g, caseItem.caseNo || 'N/A')
    .replace(/{{FORUM}}/g, caseItem.forum || 'BL&LRO')
    .replace(/{{PARTY}}/g, caseItem.party || 'Petitioner')
    .replace(/{{OPP}}/g, caseItem.opp || 'Opposite Party')
    .replace(/{{SUBTYPE}}/g, caseItem.subType || caseItem.type.toUpperCase())
    .replace(/{{FILING_DATE}}/g, caseItem.filingDate || '—')
    .replace(/{{NEXT_DATE}}/g, caseItem.nextDate || 'To be fixed')
    .replace(/{{DISTRICT}}/g, schedule.district || 'South 24 Parganas')
    .replace(/{{BLOCK}}/g, schedule.block || '—')
    .replace(/{{MOUZA}}/g, schedule.mouza || '—')
    .replace(/{{JL}}/g, schedule.jl || '—')
    .replace(/{{KHATIAN}}/g, schedule.khatian || '—')
    .replace(/{{DAG}}/g, schedule.dag || '—')
    .replace(/{{CLASSIFICATION}}/g, schedule.classification || 'Bastu')
    .replace(/{{AREA}}/g, schedule.area || '—')
    .replace(/{{UNIT}}/g, schedule.unit || 'Satak')
    .replace(/{{SHARE}}/g, (schedule as any).share || 'Full')
    .replace(/{{CHAIN_DEEDS_TABLE}}/g, deedsTable)
    .replace(/{{CHAIN_DEED_NARRATIVE}}/g, narrative)
    .replace(/{{CHAMBER_NAME}}/g, chamberName)
    .replace(/{{BAR_COUNCIL}}/g, barCouncil)
    .replace(/{{CITY}}/g, city)
    .replace(/{{TODAY_DATE}}/g, todayStr);

  return replaced;
}
