import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  FileDown,
  Share2,
  X,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Download,
  RotateCw,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PrintModalOptions {
  html: string;
  title: string;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'a4' | 'legal';
}

function buildIsolatedPrintableHtml(
  rawHtml: string,
  title: string,
  paperSize: 'a4' | 'legal',
  orientation: 'portrait' | 'landscape'
): string {
  const pageDimension = paperSize === 'legal' ? '8.5in 14in' : 'A4';
  const pageOverrideCss = `
    @page {
      size: ${pageDimension} ${orientation};
      margin: 12mm;
    }
    html, body {
      background-color: #ffffff;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      html, body {
        margin: 0 !important;
        background: #ffffff !important;
      }
      .no-print {
        display: none !important;
      }
    }
  `;

  const trimmed = (rawHtml || '').trim();
  const hasHtmlTag = /<html[\s>]/i.test(trimmed);

  if (!hasHtmlTag) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: 'Georgia', 'Times New Roman', 'Noto Sans Bengali', serif;
        padding: 14mm 16mm;
        margin: 0;
        color: #0f172a;
        background: #ffffff;
        line-height: 1.6;
        font-size: 13px;
      }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
      th { background: #f1f5f9; }
      ${pageOverrideCss}
    </style>
  </head>
  <body>
    ${trimmed}
  </body>
</html>`;
  }

  let doc = trimmed;
  if (!/padding/i.test(doc) && !/margin:\s*1/i.test(doc)) {
    const bodyPaddingCss = `body { padding: 12mm 14mm; }`;
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `<style>${bodyPaddingCss}\n${pageOverrideCss}</style></head>`);
    } else {
      doc = `<style>${bodyPaddingCss}\n${pageOverrideCss}</style>` + doc;
    }
  } else {
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `<style>${pageOverrideCss}</style></head>`);
    } else {
      doc = `<style>${pageOverrideCss}</style>` + doc;
    }
  }
  return doc;
}

function extractBodyInnerHtml(rawHtml: string): string {
  const match = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (match && match[1]) {
    const styles = (rawHtml.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join('\n');
    return `${styles}\n${match[1]}`;
  }
  return rawHtml;
}

export const PrintModal: React.FC = () => {
  const { printModalData, closePrintPreview, showToast, language, addVaultFile } = useApp();
  const [zoom, setZoom] = useState<number>(100);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState<'a4' | 'legal'>('a4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [generatedPdfBlobUrl, setGeneratedPdfBlobUrl] = useState<string | null>(null);
  const [generatedPdfFileName, setGeneratedPdfFileName] = useState<string>('');
  const [iframeHeight, setIframeHeight] = useState<number>(1123);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const isBn = language === 'bn';

  useEffect(() => {
    if (printModalData) {
      setOrientation(printModalData.orientation || 'portrait');
      setPaperSize(printModalData.paperSize || 'a4');
      setZoom(typeof window !== 'undefined' && window.innerWidth < 640 ? 55 : 100);
      setGeneratedPdfBlobUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setGeneratedPdfFileName('');
      setIframeHeight(printModalData.orientation === 'landscape' ? 794 : 1123);
    }
  }, [printModalData]);

  // Revoke any generated blob URL on unmount
  useEffect(() => {
    return () => {
      if (generatedPdfBlobUrl) {
        URL.revokeObjectURL(generatedPdfBlobUrl);
      }
    };
  }, [generatedPdfBlobUrl]);

  const docTitle = printModalData?.title || 'Document';
  const cleanTitle = docTitle.replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, '_').replace(/_+/g, '_') || 'Document';

  const isolatedPrintableHtml = useMemo(() => {
    if (!printModalData?.html) return '';
    return buildIsolatedPrintableHtml(printModalData.html, docTitle, paperSize, orientation);
  }, [printModalData?.html, docTitle, paperSize, orientation]);

  const syncIframeHeight = useCallback(() => {
    const iframe = previewIframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.body) return;
      const minH = orientation === 'landscape' ? 794 : paperSize === 'legal' ? 1344 : 1123;
      const contentH = Math.max(
        doc.body.scrollHeight || 0,
        doc.documentElement?.scrollHeight || 0
      );
      setIframeHeight(Math.max(minH, contentH + 32));
    } catch {
      // Ignore cross-origin guard if ever triggered
    }
  }, [orientation, paperSize]);

  if (!printModalData || !printModalData.isOpen) return null;

  /**
   * Generates a crisp, properly paginated multi-page jsPDF document
   * directly from the isolated iframe's document body (immune to Tailwind v4 oklch CSS).
   */
  const generatePdfInstance = async (): Promise<{
    pdf: jsPDF;
    blob: Blob;
    file: File;
    fileName: string;
  }> => {
    const iframe = previewIframeRef.current;
    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    const targetBody = iframeDoc?.body;

    if (!iframeDoc || !targetBody) {
      throw new Error('Print preview document is still loading. Please retry.');
    }

    const captureWidth = Math.max(targetBody.scrollWidth, iframeDoc.documentElement?.scrollWidth || 794);
    const captureHeight = Math.max(targetBody.scrollHeight, iframeDoc.documentElement?.scrollHeight || 1123);

    const canvas = await html2canvas(targetBody, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: captureWidth,
      height: captureHeight,
      windowWidth: captureWidth,
      windowHeight: captureHeight
    });

    const isLandscape = orientation === 'landscape';
    const pdf = new jsPDF({
      orientation: isLandscape ? 'l' : 'p',
      unit: 'mm',
      format: paperSize === 'legal' ? 'legal' : 'a4'
    });

    const pdfPageWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const marginMm = 8;
    const contentWidthMm = pdfPageWidth - marginMm * 2;
    const contentHeightMm = pdfPageHeight - marginMm * 2;

    // Slice canvas page-by-page at crisp legible resolution without shrinking long documents
    const pxPerMm = canvas.width / contentWidthMm;
    const sliceHeightPx = Math.floor(contentHeightMm * pxPerMm);

    let yOffsetPx = 0;
    let pageIndex = 0;

    while (yOffsetPx < canvas.height) {
      const remainingPx = canvas.height - yOffsetPx;
      const currentSlicePx = Math.min(sliceHeightPx, remainingPx);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = currentSlicePx;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          yOffsetPx,
          canvas.width,
          currentSlicePx,
          0,
          0,
          canvas.width,
          currentSlicePx
        );
      }

      const sliceImgData = pageCanvas.toDataURL('image/jpeg', 0.94);
      const sliceHeightMm = currentSlicePx / pxPerMm;

      if (pageIndex > 0) {
        pdf.addPage();
      }
      pdf.addImage(sliceImgData, 'JPEG', marginMm, marginMm, contentWidthMm, sliceHeightMm);

      yOffsetPx += currentSlicePx;
      pageIndex += 1;
    }

    const fileName = `${cleanTitle}.pdf`;
    const blob = pdf.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    return { pdf, blob, file, fileName };
  };

  /**
   * Triggers client-side file download of a Blob without leaving the app
   */
  const triggerDownloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 1500);
  };

  /**
   * ACTION 1: Share PDF to Wireless Printer Apps, Drive, WhatsApp, or Files
   */
  const handleShareToPrintOrApps = async () => {
    setIsProcessing(true);
    setProcessingAction('share');
    showToast(isBn ? 'শেয়ার ও প্রিন্টিং ফাইল তৈরি হচ্ছে...' : 'Preparing document to share or print...', 'info');

    try {
      const { blob, file, fileName } = await generatePdfInstance();
      const blobUrl = URL.createObjectURL(blob);
      setGeneratedPdfBlobUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return blobUrl;
      });
      setGeneratedPdfFileName(fileName);

      const shareData = {
        files: [file],
        title: docTitle,
        text: `${docTitle} · SRK Case Manager`
      };

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast(isBn ? 'শেয়ার সম্পন্ন হয়েছে' : 'Shared successfully', 'success');
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: docTitle,
          text: `${docTitle} - SRK Case Manager Legal Record`
        });
        triggerDownloadBlob(blob, fileName);
      } else {
        triggerDownloadBlob(blob, fileName);
        showToast(isBn ? 'পিডিএফ ডিভাইসে সেভ করা হয়েছে' : 'PDF saved to device', 'success');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Share error, falling back to PDF save:', err);
        await handleSavePdfToDevice();
      }
    } finally {
      setIsProcessing(false);
      setProcessingAction('');
    }
  };

  /**
   * ACTION 2: Save PDF directly to Device Storage & Chamber Document Vault
   */
  const handleSavePdfToDevice = async () => {
    setIsProcessing(true);
    setProcessingAction('save');
    showToast(isBn ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF file...', 'info');

    try {
      const { blob, fileName } = await generatePdfInstance();
      const blobUrl = URL.createObjectURL(blob);
      setGeneratedPdfBlobUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return blobUrl;
      });
      setGeneratedPdfFileName(fileName);

      triggerDownloadBlob(blob, fileName);

      try {
        addVaultFile({
          name: fileName,
          size: `${Math.max(1, Math.round(blob.size / 1024))} KB`,
          type: 'pdf',
          date: new Date().toISOString().split('T')[0],
          category: 'Certified Copy / Land Record Prints'
        });
      } catch (vaultErr) {
        console.warn('Vault auto-save warning:', vaultErr);
      }

      showToast(
        isBn
          ? 'পিডিএফ সফলভাবে ডিভাইসে ডাউনলোড হয়েছে এবং চেম্বার ভল্টে সংরক্ষিত হয়েছে!'
          : 'PDF downloaded to device and saved to Chamber Vault!',
        'success'
      );
    } catch (err) {
      console.error('PDF save error:', err);
      showToast(isBn ? 'পিডিএফ তৈরি করতে সমস্যা হয়েছে। প্রিন্ট বাটন চেষ্টা করুন।' : 'Could not build PDF. Try the Print button.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingAction('');
    }
  };

  /**
   * ACTION 3: Direct Print directly from the live isolated preview iframe
   */
  const handlePrintToDevice = async () => {
    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);

    if (isMobile && typeof navigator !== 'undefined' && 'share' in navigator) {
      await handleShareToPrintOrApps();
      return;
    }

    try {
      const iframe = previewIframeRef.current;
      const win = iframe?.contentWindow;
      if (win) {
        win.focus();
        win.print();
        showToast(isBn ? 'প্রিন্ট ডায়ালগ খোলা হয়েছে' : 'Print dialog opened', 'success');
        return;
      }
    } catch (err) {
      console.warn('Iframe print failed, falling back to Save PDF:', err);
    }

    await handleSavePdfToDevice();
  };

  /**
   * ACTION 4: Download Word (.doc) document cleanly
   */
  const handleDownloadWordDoc = () => {
    const bodyHtml = extractBodyInnerHtml(printModalData.html);
    const htmlWrapper = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <title>${docTitle}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 24px; font-size: 11pt; color: #0f172a; }
          </style>
        </head>
        <body>
          ${bodyHtml}
        </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlWrapper], { type: 'application/msword;charset=utf-8' });
    triggerDownloadBlob(blob, `${cleanTitle}.doc`);
    showToast(isBn ? 'ওয়ার্ড ফাইল ডাউনলোড হয়েছে' : 'Word document downloaded', 'success');
  };

  /**
   * ACTION 5: Copy plain text to clipboard
   */
  const handleCopyText = () => {
    const doc = previewIframeRef.current?.contentDocument;
    let text = '';
    if (doc?.body) {
      text = doc.body.innerText || doc.body.textContent || '';
    } else {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = extractBodyInnerHtml(printModalData.html);
      text = tempDiv.innerText || tempDiv.textContent || '';
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast(isBn ? 'টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে' : 'Text copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const paperWidthMm = orientation === 'landscape' ? '297mm' : '210mm';
  const paperMinHeightMm = orientation === 'landscape' ? '210mm' : paperSize === 'legal' ? '355.6mm' : '297mm';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[94vh] sm:h-[92vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Top Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                {docTitle}
              </h2>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 truncate">
                <span>{isBn ? 'প্রিন্ট, সেভ ও শেয়ারিং প্যানেল' : 'Print, Save & Device Share'}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                  {isBn ? 'ডিভাইস ফাইল ও ওয়্যারলেস প্রিন্ট সার্ভিস' : 'Device Storage & Wireless Print Service'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closePrintPreview}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isBn ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper & Controls Bar */}
        <div className="p-2 sm:p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          {/* Quick Primary Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePrintToDevice}
              className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              title={isBn ? 'সরাসরি প্রিন্টারে পাঠান (System Print)' : 'Send directly to connected printer / System print dialog'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBn ? 'সরাসরি প্রিন্ট (Print)' : 'Print Document'}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSavePdfToDevice}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title={isBn ? 'পিডিএফ ডিভাইস ও চেম্বার ভল্টে সেভ করুন' : 'Save PDF directly to device storage & chamber vault'}
            >
              {isProcessing && processingAction === 'save' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isBn ? 'সেভ PDF' : 'Save PDF'}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleShareToPrintOrApps}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title={isBn ? 'ওয়্যারলেস প্রিন্টার বা অ্যাপসে শেয়ার করুন' : 'Share to Wireless Printer Apps, Drive, WhatsApp, or Save to Files'}
            >
              {isProcessing && processingAction === 'share' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{isBn ? 'শেয়ার (Share)' : 'Share / Apps'}</span>
            </button>
          </div>

          {/* Paper Settings */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 hidden sm:inline">
                {isBn ? 'কাগজ:' : 'Paper:'}
              </span>
              <select
                value={paperSize}
                onChange={e => setPaperSize(e.target.value as 'a4' | 'legal')}
                className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="a4">A4</option>
                <option value="legal">Legal (দলিল)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setOrientation(prev => (prev === 'portrait' ? 'landscape' : 'portrait'))}
              className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
              title={isBn ? 'পৃষ্ঠার দিক পরিবর্তন করুন' : 'Toggle Layout'}
            >
              <RotateCw className="w-3 h-3" />
              <span className="capitalize">{orientation}</span>
            </button>

            {/* Zoom */}
            <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-slate-700 pl-1.5">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(40, z - 10))}
                className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold w-8 text-center text-slate-600 dark:text-slate-400">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(150, z + 10))}
                className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Ready Notification Banner with Direct Download Link */}
        {generatedPdfBlobUrl && (
          <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-200 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold truncate">
                {isBn ? 'পিডিএফ প্রস্তুত হয়েছে: ' : 'PDF Ready: '}
                <span className="font-mono">{generatedPdfFileName}</span>
              </span>
            </div>
            <a
              href={generatedPdfBlobUrl}
              download={generatedPdfFileName}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 shadow-2xs"
            >
              <Download className="w-3 h-3" />
              <span>{isBn ? 'সরাসরি ওপেন / সেভ' : 'Direct Open / Save'}</span>
            </a>
          </div>
        )}

        {/* Isolated Print Document Preview Box (Iframe prevents CSS leaks & avoids html2canvas oklch crash) */}
        <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950/80 p-2 sm:p-5 flex justify-center items-start">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
              width: paperWidthMm,
              flexShrink: 0
            }}
          >
            <iframe
              ref={previewIframeRef}
              srcDoc={isolatedPrintableHtml}
              onLoad={syncIframeHeight}
              title={docTitle}
              style={{
                width: paperWidthMm,
                minHeight: paperMinHeightMm,
                height: `${iframeHeight}px`,
                backgroundColor: '#ffffff',
                border: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                borderRadius: '4px',
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-2.5 sm:p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadWordDoc}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-blue-600" />
              <span>Word (.doc)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={closePrintPreview}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isBn ? 'বাতিল' : 'Close'}
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleShareToPrintOrApps}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title={isBn ? 'ওয়্যারলেস প্রিন্টার বা অ্যাপসে পাঠান' : 'Share to WhatsApp, Drive, or Print Apps'}
            >
              {isProcessing && processingAction === 'share' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{isBn ? 'শেয়ার (Share)' : 'Share'}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSavePdfToDevice}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title={isBn ? 'সরাসরি ডিভাইসে পিডিএফ সেভ করুন' : 'Save PDF to device storage'}
            >
              {isProcessing && processingAction === 'save' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isBn ? 'সেভ PDF' : 'Save PDF'}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePrintToDevice}
              className="px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title={isBn ? 'সরাসরি প্রিন্টারে পাঠান (System Print)' : 'Send directly to connected printer / System print dialog'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রিন্ট করুন (Print)' : 'Print Document'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
