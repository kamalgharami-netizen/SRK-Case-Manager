import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side legal draft generator fallback for West Bengal Revenue authorities
function generateStatutoryDraft(
  template: string,
  draftLang: string,
  formValues: any,
  companyName?: string,
  barCouncil?: string,
  advocateName?: string
): string {
  const isBn = draftLang === 'bengali';
  const isBi = draftLang === 'bilingual';
  const party = formValues?.partyName || 'Debashis Chatterjee';
  const father = formValues?.fatherName || 'Late Birendra Nath Chatterjee';
  const address = formValues?.address || 'Kolkata, West Bengal';
  const opp = formValues?.oppParty || '';
  const forum = formValues?.forum || 'Before the Ld. Block Land & Land Reforms Officer, Rajarhat';
  const authorityAddress = formValues?.authorityAddress || 'Office of the BL&LRO, Rajarhat, North 24 Parganas';
  const spioDetails = formValues?.spioDetails || 'State Public Information Officer (SPIO) & Revenue Officer';
  const mouza = formValues?.mouzaJl || 'Rajarhat (J.L. No. 12)';
  const khatianDag = formValues?.khatianDag || 'Khatian No. 412, L.R. Dag No. 856';
  const areaClass = formValues?.landAreaClass || '0.15 Acre, Classification: Sali';
  const deed = formValues?.deedNoDate || 'Deed No. I-04128/2021';
  const facts = formValues?.customFacts || 'The applicant has legally acquired the property through a registered deed of conveyance and is in continuous possession.';
  const caseNumber = formValues?.caseNumber || '';
  const caseDate = formValues?.caseDate || '';
  const showLandSchedule = formValues?.showLandSchedule ?? (template !== 'rti' && template !== 'rtifirstappeal');
  const showOppParty = formValues?.showOppParty ?? (template !== 'rti' && template !== 'misc10000');
  const showCaseRef = formValues?.showCaseRef ?? false;

  const adv = advocateName || 'Adv. S. R. Khan';
  const chName = companyName || 'SRK Legal Chamber & Associates';
  const bar = barCouncil || 'WB/1482/2012';

  const titleMap: Record<string, { en: string; bn: string; act: string }> = {
    misc10000: {
      en: 'MISCELLANEOUS PETITION FOR CORRECTION OF 10000 SHARE & AREA',
      bn: 'হিস্যা ও রের্কড সংশোধনের নিমিত্ত বিবিধ মোকদ্দমা আবেদনপত্র',
      act: 'Under Section 50 / 51A of the West Bengal Land Reforms Act, 1955'
    },
    lrappeal: {
      en: 'MEMORANDUM OF APPEAL UNDER SECTION 54 OF WBLR ACT, 1955',
      bn: 'পশ্চিমবঙ্গ ভূমি সংস্কার আইন ১৯৫৫ এর ৫৪ ধারা মতে আপিল মেমোরেন্ডাম',
      act: 'Under Section 54 of the West Bengal Land Reforms Act, 1955'
    },
    firstappeal: {
      en: 'MEMORANDUM OF STATUTORY FIRST APPEAL',
      bn: 'বিধিবদ্ধ প্রথম আপিল মেমোরেন্ডাম',
      act: 'Under Statutory Appellate Jurisdiction of the West Bengal Land Reforms Act, 1955'
    },
    sec5delay: {
      en: 'PETITION UNDER SECTION 5 OF THE LIMITATION ACT, 1963',
      bn: 'তামাদি আইন ১৯৬৩ এর ৫ ধারা মতে বিলম্ব মকুবের আবেদনপত্র',
      act: 'Under Section 5 of the Limitation Act, 1963 for Condonation of Delay'
    },
    conversion: {
      en: 'APPLICATION FOR CONVERSION OF LAND CLASSIFICATION (SEC 4C)',
      bn: 'জমির শ্রেণি পরিবর্তনের (বাস্তু রূপান্তর) নিমিত্ত আবেদনপত্র (ধারা ৪সি)',
      act: 'Under Section 4C of the West Bengal Land Reforms Act, 1955'
    },
    rti: {
      en: 'APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005',
      bn: 'তথ্য জানার অধিকার আইন ২০০৫ এর ৬(১) ধারা মতে তথ্যের আবেদনপত্র',
      act: 'Under Section 6(1) of the Right to Information Act, 2005'
    },
    rtifirstappeal: {
      en: 'FIRST APPEAL UNDER SECTION 19(1) OF THE RTI ACT, 2005',
      bn: 'তথ্য জানার অধিকার আইন ২০০৫ এর ১৯(১) ধারা মতে প্রথম আপিল',
      act: 'Under Section 19(1) of the Right to Information Act, 2005'
    }
  };

  const currentMeta = titleMap[template] || titleMap.rti;

  return `
    <div style="font-family:'Times New Roman',serif; font-size:14px; line-height:1.6; color:#0f172a; padding:10px;">
      <!-- CHAMBER HEADER -->
      <div style="text-align:center; border-bottom:2px solid #1e3a8a; padding-bottom:8px; margin-bottom:16px;">
        <h2 style="margin:0; font-size:18px; font-weight:bold; color:#1e3a8a; text-transform:uppercase;">${chName}</h2>
        <div style="font-size:11px; color:#475569; margin-top:2px;">
          Practice before Calcutta High Court, WBLRTT, District Collectorates & BL&LRO Forums<br>
          Bar Council Reg.: ${bar} · Lead Counsel: ${adv}
        </div>
      </div>

      <!-- FORUM / SPIO AUTHORITY -->
      ${template === 'rti' ? `
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-left:4px solid #0284c7; padding:10px 14px; margin-bottom:16px;">
          <div style="font-size:13px; font-weight:bold; color:#0369a1;">TO:</div>
          <div style="font-size:14px; font-weight:bold; color:#0f172a;">${forum}</div>
          <div style="font-size:12px; color:#475569;">${authorityAddress}</div>
        </div>
      ` : template === 'rtifirstappeal' ? `
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-left:4px solid #7c3aed; padding:10px 14px; margin-bottom:16px;">
          <div style="font-size:12px; font-weight:bold; color:#6d28d9;">BEFORE THE FIRST APPELLATE AUTHORITY (FAA) u/s 19(1) RTI ACT, 2005</div>
          <div style="font-size:14px; font-weight:bold; color:#0f172a;">${forum}</div>
          <div style="font-size:12px; color:#475569;">Address: ${authorityAddress}</div>
          <div style="font-size:12px; color:#b91c1c; margin-top:4px;"><strong>Impugned SPIO Details:</strong> ${spioDetails}</div>
        </div>
      ` : `
        <div style="text-align:center; font-weight:bold; font-size:14px; margin-bottom:14px;">
          ${forum.toUpperCase()}
        </div>
      `}

      <!-- CAUSE TITLE -->
      ${template === 'rti' ? `
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:13px; background:#f8fafc; border:1px solid #e2e8f0; padding:8px;">
          <tr>
            <td style="padding:8px; vertical-align:top;">
              <strong>Applicant Details (আবেদনকারীর বিবরণ):</strong><br>
              <strong>${party}</strong><br>
              ${isBn || isBi ? `<span style="color:#334155;">পিতা/স্বামী: ${father}</span><br>` : `S/o or D/o: ${father}<br>`}
              Address: ${address}<br>
              <span style="display:inline-block; margin-top:4px; font-weight:bold; text-decoration:underline; color:#0369a1;">... Citizen Applicant (নাগরিক আবেদনকারী)</span>
            </td>
          </tr>
        </table>
      ` : (showOppParty && opp) ? `
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:13px;">
          <tr>
            <td style="width:55%; vertical-align:top;">
              <strong>In the matter of:</strong><br>
              <strong>${party}</strong><br>
              ${isBn || isBi ? `<span style="color:#334155;">পিতা/স্বামী: ${father}</span><br>` : `S/o or D/o: ${father}<br>`}
              Address: ${address}<br>
              <span style="display:inline-block; margin-top:4px; font-weight:bold; text-decoration:underline;">... Petitioner / Appellant</span>
            </td>
            <td style="width:10%; text-align:center; vertical-align:middle; font-weight:bold; font-size:15px;">
              -VERSUS-
            </td>
            <td style="width:35%; vertical-align:top; text-align:right;">
              <br>
              <strong>${opp}</strong><br>
              <span style="display:inline-block; margin-top:4px; font-weight:bold; text-decoration:underline;">... Opposite Party / Respondent</span>
            </td>
          </tr>
        </table>
      ` : `
        <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:13px;">
          <tr>
            <td style="vertical-align:top;">
              <strong>In the matter of:</strong><br>
              <strong>${party}</strong><br>
              ${isBn || isBi ? `<span style="color:#334155;">পিতা/স্বামী: ${father}</span><br>` : `S/o or D/o: ${father}<br>`}
              Address: ${address}<br>
              <span style="display:inline-block; margin-top:4px; font-weight:bold; text-decoration:underline;">... Petitioner / Applicant</span>
            </td>
          </tr>
        </table>
      `}

      <!-- CASE REFERENCE (IF ADDED VIA + BUTTON) -->
      ${showCaseRef && (caseNumber || caseDate) ? `
        <div style="background:#f1f5f9; border:1px dashed #64748b; padding:6px 10px; margin-bottom:12px; font-size:12px;">
          <strong>Case / Reference Details:</strong> Case/Memo No: <strong>${caseNumber || 'N/A'}</strong> ${caseDate ? `| Date: <strong>${caseDate}</strong>` : ''}
        </div>
      ` : ''}

      <!-- SUBJECT -->
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-left:4px solid #1e3a8a; padding:8px 12px; margin-bottom:16px; font-size:13px;">
        <strong>SUBJECT:</strong> ${currentMeta.en}<br>
        ${(isBn || isBi) ? `<span style="color:#1e3a8a; font-weight:600;">বিষয়: ${currentMeta.bn}</span><br>` : ''}
        <span style="font-size:11px; color:#64748b;">Statutory Provision: ${currentMeta.act}</span>
      </div>

      <!-- RESPECTFUL SUBMISSIONS -->
      <div style="margin-bottom:10px;">
        <strong>The humble petition of the Petitioner / Applicant above-named most respectfully sheweth:</strong>
        ${(isBn || isBi) ? `<div style="color:#334155; font-style:italic; font-size:12px; margin-top:2px;">মহামান্য কর্তৃপক্ষের সমীপে দরখাস্তকারীর বিনীত সশ্রদ্ধ নিবেদন নিম্নরূপ:</div>` : ''}
      </div>

      <!-- NUMBERED FACTS (OBSERVED & SYNTHESIZED BY AI) -->
      <ol style="padding-left:22px; margin-bottom:14px; font-size:13px;">
        <li style="margin-bottom:8px;">
          That the Petitioner / Applicant is a law-abiding citizen of India, permanent resident of West Bengal.
          ${(isBn || isBi) ? `<div style="color:#475569; font-size:12px;">দরখাস্তকারী ভারতীয় নাগরিক এবং অত্র মামলার শিরোনামে উল্লেখিত ঠিকানার স্থায়ী বাসিন্দা।</div>` : ''}
        </li>
        <li style="margin-bottom:8px;">
          <strong>Specific Facts & Grounds Observed by Counsel / AI:</strong>
          <div style="margin-top:4px; padding:6px 10px; background:#faf5ff; border-left:3px solid #9333ea; font-size:12.5px;">
            ${facts}
          </div>
          ${(isBn || isBi) ? `<div style="color:#475569; font-size:12px; margin-top:4px;">প্রাসঙ্গিক বিবরণ ও আইনগত ভিত্তি: ${facts}</div>` : ''}
        </li>
        <li style="margin-bottom:8px;">
          ${template === 'rti' ? `
            That the information sought hereunder is not exempt under Section 8 or Section 9 of the RTI Act, 2005, and pertains to official public records maintained in the ordinary course of administration. Statutory application fee of ₹10/- is affixed herewith.
          ` : template === 'rtifirstappeal' ? `
            That the SPIO has arbitrarily failed to supply the requested information within the mandatory statutory period of 30 days under Section 7(1) of the RTI Act, 2005, thereby constraining the Appellant to file this First Appeal under Section 19(1).
          ` : `
            That the applicant has submitted all requisite revenue records, receipts, and identity proofs, and is lawfully entitled to the relief prayed for hereunder in the interest of justice.
          `}
        </li>
      </ol>

      <!-- SCHEDULE OF PROPERTY (সম্পত্তির তপশীল বিবরণ) - ONLY IF REQUIRED / ADDED VIA + BUTTON -->
      ${showLandSchedule ? `
        <div style="margin-bottom:14px;">
          <div style="font-weight:bold; font-size:13px; text-decoration:underline; margin-bottom:6px; color:#1e3a8a;">
            SCHEDULE OF THE PROPERTY (সম্পত্তির তপশীল বিবরণ)
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:12px; border:1px solid #94a3b8;">
            <thead>
              <tr style="background:#f1f5f9; text-align:left;">
                <th style="border:1px solid #cbd5e1; padding:6px;">Mouza & J.L. No. (মৌজা ও জে.এল.)</th>
                <th style="border:1px solid #cbd5e1; padding:6px;">Khatian & Dag No. (খতিয়ান ও দাগ)</th>
                <th style="border:1px solid #cbd5e1; padding:6px;">Area & Classification (পরিমাণ ও শ্রেণি)</th>
                <th style="border:1px solid #cbd5e1; padding:6px;">Title Deed Ref. (দলিল বিবরণ)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #cbd5e1; padding:6px;"><strong>${mouza}</strong></td>
                <td style="border:1px solid #cbd5e1; padding:6px;"><strong>${khatianDag}</strong></td>
                <td style="border:1px solid #cbd5e1; padding:6px;"><strong>${areaClass}</strong></td>
                <td style="border:1px solid #cbd5e1; padding:6px;"><strong>${deed}</strong></td>
              </tr>
            </tbody>
          </table>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">
            Bounded by: North - Recorded Boundary; South - Access Pathway; East - Adjoining Plot; West - Remaining Portion.
          </div>
        </div>
      ` : ''}

      <!-- PRAYER -->
      <div style="background:#fdf2f8; border:1px solid #fbcfe8; border-left:4px solid #db2777; padding:10px 14px; margin-bottom:16px; font-size:13px;">
        <div style="font-weight:bold; color:#9d174d; margin-bottom:4px;">PRAYER (প্রার্থনা)</div>
        <p style="margin:0 0 6px 0;">In the premises aforesaid, it is most respectfully prayed that Your Honour may graciously be pleased to:</p>
        <ol style="margin:0; padding-left:20px;">
          ${template === 'rti' ? `
            <li>Admit this application under Section 6(1) of the RTI Act, 2005;</li>
            <li>Direct supply of certified copies of the requested information and documents within the statutory 30-day period;</li>
            <li>Provide inspection of the case record/files if necessary.</li>
          ` : template === 'rtifirstappeal' ? `
            <li>Admit this First Appeal under Section 19(1) of the RTI Act, 2005;</li>
            <li>Direct the SPIO to furnish all requested certified records forthwith free of cost;</li>
            <li>Initiate departmental inquiry/recommendation for maximum penalty under Section 20 of the RTI Act.</li>
          ` : `
            <li>Admit this application and cause a field spot inquiry through the concerned Revenue Inspector (R.I.);</li>
            <li>Pass an order granting the relief prayed for in respect of the Schedule mentioned property in favour of the Petitioner;</li>
            <li>Issue a separated, corrected Record-of-Rights (L.R. Khatian) and update the register of rights;</li>
            <li>Pass such other or further order(s) as Your Honour may deem fit and proper in the interest of justice.</li>
          `}
        </ol>
        ${(isBn || isBi) ? `<div style="color:#831843; font-size:12px; margin-top:6px; font-weight:600;">অতএব মহামান্য সমীপে সশ্রদ্ধ প্রার্থনা এই যে, উপরোক্ত ঘটনা ও নথিপত্র পর্যালোচনা করিয়া ন্যায়বিচারের স্বার্থে দরখাস্তকারীর অনুকূলে প্রতিকার প্রদানের মর্জি হয়।</div>` : ''}
      </div>

      <!-- SIGNATURE BLOCK -->
      <table style="width:100%; border-collapse:collapse; margin-top:20px; font-size:13px;">
        <tr>
          <td style="width:50%; vertical-align:bottom;">
            ___________________________<br>
            <strong>${adv}</strong><br>
            Advocate for Petitioner / Applicant<br>
            ${chName}<br>
            Bar Reg.: ${bar}
          </td>
          <td style="width:50%; text-align:right; vertical-align:bottom;">
            ___________________________<br>
            <strong>${party}</strong><br>
            Signature of Applicant / Deponent<br>
            <span style="font-size:11px; color:#64748b;">(আবেদনকারীর স্বাক্ষর)</span>
          </td>
        </tr>
      </table>

      <!-- VERIFICATION -->
      <div style="margin-top:24px; padding-top:10px; border-top:1px dashed #94a3b8; font-size:12px; color:#334155;">
        <div style="text-align:center; font-weight:bold; margin-bottom:4px;">VERIFICATION / সত্যপাঠ</div>
        I, <strong>${party}</strong>, son/daughter/wife of ${father}, residing at ${address}, do hereby solemnly declare and state that the statements contained herein are true to my personal knowledge, derived from authentic records, and I sign this verification on this day.
        ${(isBn || isBi) ? `<div style="font-style:italic; margin-top:3px;">আমি শপথপূর্বক ঘোষণা করিতেছি যে উপরোক্ত বিবরণসমূহ আমার জ্ঞান ও হস্তগত রেকর্ড মতে সম্পূর্ণ সত্য।</div>` : ''}
        <div style="text-align:right; margin-top:14px;">
          ___________________________<br>
          <strong>DEPONENT / APPLICANT</strong>
        </div>
      </div>
    </div>
  `;
}

// AI Fact Observer Endpoint - analyzes rough user facts and drafts statutory facts and grounds
app.post('/api/ai/observe-facts', async (req, res) => {
  const { rawFacts, template, draftLang, forum, schedule, caseRef } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const fallbackFacts = (facts: string, t: string, lang: string) => {
    const isBn = lang === 'bengali';
    if (t === 'rti') {
      return isBn
        ? `১. আবেদনকারী অত্র রাজস্ব কার্যালয়ের রেকর্ডভুক্ত তথ্য অবগত হইবার নিমিত্ত বিধিবদ্ধ আবেদনকারী।\n২. নির্দিষ্ট ঘটনা ও চাহিদাকৃত তথ্য: ${facts}\n৩. উক্ত তথ্য কোনো তৃতীয় পক্ষের ব্যক্তিগত গোপনীয়তা ভঙ্গ করে না এবং জনস্বার্থের সহিত সম্পৃক্ত। বিধিবদ্ধ ১০ টাকার কোর্ট ফি সংযুক্ত করা হইল।`
        : `1. That the Applicant is a citizen of India and requires certified copies of public records.\n2. Specific Case Facts Observed: ${facts}\n3. That the requested records are not exempt under Section 8 or 9 of RTI Act 2005 and statutory fee of Rs. 10/- has been deposited.`;
    } else if (t === 'rtifirstappeal') {
      return isBn
        ? `১. আবেদনকারী পূর্ববর্তী আরটিআই আবেদনের প্রেক্ষিতে নির্ধারিত ৩০ কার্যদিবস অতিক্রান্ত হওয়া সত্ত্বেও কোনো তথ্য বা প্রত্যয়িত নকল প্রাপ্ত হন নাই / অসম্পূর্ণ তথ্য পাইয়াছেন।\n২. আপিলের মূল কারণ ও ঘটনাবলী: ${facts}\n৩. সংশ্লিষ্ট জনতথ্য আধিকারিক (SPIO) আইনগত দায়িত্ব পালনে অবহেলা করিয়াছেন বিধায় অত্র প্রথম আপিল দায়ের করা হইল।`
        : `1. That the Appellant preferred an application u/s 6(1) of the RTI Act 2005 before the SPIO.\n2. Grounds of Appeal & Facts Observed: ${facts}\n3. That the SPIO failed to furnish information within statutory limitation of 30 days, causing grave prejudice.`;
    } else if (t === 'misc10000') {
      return isBn
        ? `১. দরখাস্তকারী অত্র তফশিলভুক্ত দাগের একজন বৈধ ও নিরঙ্কুশ দখলকার অংশীদার।\n২. 'বাংলার ভূমি' অনলাইন রেকর্ড ও ১০,০০০ হিস্যা বৈষম্য বিবরণ: ${facts}\n৩. উক্ত গাণিতিক ও করণিক ভুলের কারণে দরখাস্তকারীর খতিয়ান লক অবস্থায় রহিয়াছে, যাহা ধারা ৫০(ক) মতে সংশোধন আবশ্যক।`
        : `1. That the Petitioner is a lawful recorded co-sharer in respect of the scheduled property.\n2. Specific 10000-Share Anomaly Observed: ${facts}\n3. That due to mathematical fractional mismatch, the computer ledger is locked and requires correction u/s 50A WBLR Act.`;
    }
    return isBn
      ? `১. দরখাস্তকারী ন্যায়সঙ্গত মূল্যে খরিদ সূত্রে অত্র সম্পত্তির বৈধ মালিক ও দখলদার।\n২. ঘটনা ও আইনগত বিশ্লেষণ: ${facts}\n৩. আইন ও প্রাকৃতিক ন্যায়বিচারের স্বার্থে অত্র আবেদন মঞ্জুরযোগ্য।`
      : `1. That the Petitioner has lawful title and possession over the subject property.\n2. Case Facts Observed: ${facts}\n3. That the balance of convenience lies entirely in favour of the Petitioner.`;
  };

  if (!apiKey) {
    return res.status(200).json({
      success: true,
      observedFacts: fallbackFacts(rawFacts || 'The applicant requires statutory relief as per law.', template, draftLang)
    });
  }

  const prompt = `You are a West Bengal Revenue Law drafting expert.
Observe the following case information and raw facts provided by the advocate:
- Template Type: ${template}
- Raw Facts / User Notes: ${rawFacts || 'Standard application'}
- Forum / Authority: ${forum || ''}
- Property Schedule: ${JSON.stringify(schedule || {})}
- Case / Order Reference: ${JSON.stringify(caseRef || {})}
- Language: ${draftLang || 'english'}

Your task:
Synthesize and draft clear, chronological, persuasive numbered legal facts and grounds (Paragraphs 1, 2, 3...) adhering strictly to West Bengal Land Reforms / RTI / Revenue practice.
Ensure:
- If template is 'rti', frame as specific particulars of information sought and non-exemption under RTI Act 2005.
- If template is 'rtifirstappeal', frame as grounds of appeal against the SPIO (non-supply within 30 days, arbitrary delay, or misleading response).
- If template is 'misc10000', frame as 10,000 fractional share discrepancy, survey anomaly, and need for correction u/s 50A.
- Return plain text with paragraph numbers, suitable to paste directly into the custom facts box. Do not output markdown code blocks.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });
    const observedFacts = response.text?.trim() || fallbackFacts(rawFacts, template, draftLang);
    return res.status(200).json({ success: true, observedFacts });
  } catch (e) {
    console.warn('AI observe facts failed, falling back:', e);
    return res.status(200).json({
      success: true,
      observedFacts: fallbackFacts(rawFacts, template, draftLang)
    });
  }
});

// Server-side AI drafting proxy using Gemini with multi-tier model fallback and statutory engine
app.post('/api/ai/draft', async (req, res) => {
  const { template, draftLang, formValues, companyName, barCouncil, advocateName } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key configured, use instant statutory generator
  if (!apiKey) {
    const draftHtml = generateStatutoryDraft(template, draftLang, formValues, companyName, barCouncil, advocateName);
    return res.status(200).json({
      success: true,
      draftHtml,
      source: 'statutory-engine'
    });
  }

  const prompt = `You are a Senior Revenue Advocate at the Calcutta High Court and West Bengal Land Reforms Authority.
Draft a complete, formal, court-ready legal pleading for West Bengal Revenue authorities.
Parameters:
- Template Type: ${template || 'rti'} (NOTE: Mutation drafting is completely excluded).
- Language: ${draftLang || 'bilingual'} (If 'bengali', generate formal legal Bengali pleading. If 'english', generate formal English. If 'bilingual', generate parallel English & Bengali sections).
- Forum / Authority: ${formValues?.forum || 'Before the Ld. Block Land & Land Reforms Officer, Rajarhat'}
- Authority Office Address: ${formValues?.authorityAddress || ''}
- SPIO Details (if First Appeal): ${formValues?.spioDetails || ''}
- Petitioner / Appellant: ${formValues?.partyName || 'Debashis Chatterjee'}, S/o ${formValues?.fatherName || 'Late Birendra Nath Chatterjee'}, Address: ${formValues?.address || 'Kolkata'}
- Opposite Party / Respondent: ${formValues?.showOppParty ? (formValues?.oppParty || '') : 'NONE (Do not include Opposite Party or -VERSUS- block)'}
- Case / Reference: ${formValues?.showCaseRef ? `Case/Memo No: ${formValues?.caseNumber || ''}, Date: ${formValues?.caseDate || ''}` : 'None'}
- Property Schedule (সম্পত্তির তপশীল বিবরণ): ${formValues?.showLandSchedule ? `Mouza/JL: ${formValues?.mouzaJl || ''}, Khatian/Dag: ${formValues?.khatianDag || ''}, Area/Class: ${formValues?.landAreaClass || ''}, Deed/Document: ${formValues?.deedNoDate || ''}` : 'EXCLUDED (Do not include land schedule unless explicitly provided)'}
- Facts Observed by AI: ${formValues?.customFacts || 'The applicant has legally acquired the property through a registered deed of conveyance and is in continuous possession.'}
- Advocate: ${advocateName || 'Adv. S. R. Khan'} (${companyName || 'SRK Legal Chamber'}, Bar Reg: ${barCouncil || 'WB/Chamber'})

IMPORTANT INSTRUCTIONS:
1. Terminology: Always use "সম্পত্তির তপশীল বিবরণ" in Bengali for Land/Property Schedule everywhere. Never use "জমির তফসিল".
2. If Template is 'rti': Only To SPIO / Authority and Address. No Opposite party. Include citizen applicant details. Draft facts as specific particulars of information sought under RTI Act 2005. Only include schedule if provided.
3. If Template is 'rtifirstappeal' or 'firstappeal': Application Authority, SPIO details, Appellant details. Draft grounds of appeal under Section 19(1). Only include schedule if provided.
4. If Template is 'misc10000': Application authority, Land schedule (সম্পত্তির তপশীল বিবরণ), Petitioner. Only include Opposite party if specified.
5. Format strictly as clean HTML ready for printing with formal cause title, statutory subject, sequenced facts observing the case, prayer, and verification. Return only HTML tags without markdown code blocks.`;

  try {
    const fetchAiWithTimeout = async (): Promise<string> => {
      const ai = new GoogleGenAI({ apiKey });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });
        return response.text?.trim() || '';
      } catch {
        try {
          const response2 = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt
          });
          return response2.text?.trim() || '';
        } catch {
          return '';
        }
      }
    };

    const timeoutPromise = new Promise<string>((resolve) =>
      setTimeout(() => resolve(''), 25000)
    );

    const output = await Promise.race([fetchAiWithTimeout(), timeoutPromise]);

    if (output) {
      const cleanedHtml = output.replace(/^```html\s*/i, '').replace(/```$/i, '').trim();
      return res.status(200).json({
        success: true,
        draftHtml: cleanedHtml,
        source: 'gemini'
      });
    }

    // Seamless statutory drafting fallback
    const draftHtml = generateStatutoryDraft(template, draftLang, formValues, companyName, barCouncil, advocateName);
    return res.status(200).json({
      success: true,
      draftHtml,
      source: 'statutory-engine'
    });
  } catch {
    const draftHtml = generateStatutoryDraft(template, draftLang, formValues, companyName, barCouncil, advocateName);
    return res.status(200).json({
      success: true,
      draftHtml,
      source: 'statutory-engine'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SRK Case Manager running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
