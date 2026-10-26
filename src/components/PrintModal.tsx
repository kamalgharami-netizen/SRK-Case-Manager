import React, { useState, useEffect, useRef } from 'react';
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
  Archive,
  ExternalLink,
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
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const isBn = language === 'bn';

  useEffect(() => {
    if (printModalData) {
      setOrientation(printModalData.orientation || 'portrait');
      setPaperSize(printModalData.paperSize || 'a4');
      setZoom(typeof window !== 'undefined' && window.innerWidth < 640 ? 70 : 100);
      setGeneratedPdfBlobUrl(null);
      setGeneratedPdfFileName('');
    }
  }, [printModalData]);

  if (!printModalData || !printModalData.isOpen) return null;

  const docTitle = printModalData.title || 'Document';
  const cleanTitle = docTitle.replace(/[^a-zA-Z0-9_\-]/g, '_');

  /**
   * Generates a high-resolution, multi-page jsPDF document from the preview container
   */
  const generatePdfInstance = async (): Promise<{ pdf: jsPDF; blob: Blob; file: File; fileName: string }> => {
    if (!previewContainerRef.current) {
      throw new Error('Preview container not found');
    }

    const element = previewContainerRef.current;
    const originalTransform = element.style.transform;
    element.style.transform = 'none'; // reset scale for crisp capture

    const canvas = await html2canvas(element, {
      scale: 2, // high quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    element.style.transform = originalTransform;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const isLandscape = orientation === 'landscape';
    const pdf = new jsPDF({
      orientation: isLandscape ? 'l' : 'p',
      unit: 'mm',
      format: paperSize === 'legal' ? 'legal' : 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const renderWidth = imgWidth * ratio;
    const renderHeight = imgHeight * ratio;

    // Handle single or multi-page slicing
    if (renderHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', (pdfWidth - renderWidth) / 2, 8, renderWidth, renderHeight);
    } else {
      let heightLeft = renderHeight;
      let position = 0;
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, renderHeight);
        heightLeft -= pdfHeight;
        position -= pdfHeight;
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
    }

    const fileName = `${cleanTitle}.pdf`;
    const blob = pdf.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    return { pdf, blob, file, fileName };
  };

  /**
   * ACTION 1: Direct Mobile Share to Wireless Printer, Drive, Files, WhatsApp
   * Utilizes navigator.share with genuine PDF File object
   */
  const handleShareToPrintOrApps = async () => {
    setIsProcessing(true);
    setProcessingAction('share');
    showToast(isBn ? 'শেয়ার ও প্রিন্টিং অপশন তৈরি হচ্ছে...' : 'Preparing share & print options...', 'info');

    try {
      const { blob, file, fileName } = await generatePdfInstance();
      const blobUrl = URL.createObjectURL(blob);
      setGeneratedPdfBlobUrl(blobUrl);
      setGeneratedPdfFileName(fileName);

      // Check for Web Share API Level 2 (file sharing)
      const shareData = {
        files: [file],
        title: docTitle,
        text: `${docTitle} · SRK Case Manager`
      };

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast(isBn ? 'শেয়ার সম্পন্ন হয়েছে' : 'Shared successfully', 'success');
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        // Fallback to text/title share and initiate download
        await navigator.share({
          title: docTitle,
          text: `${docTitle} - SRK Case Manager Legal Record`
        });
        triggerDownloadBlob(blob, fileName);
      } else {
        // Desktop or unsupported share: trigger direct download
        triggerDownloadBlob(blob, fileName);
        showToast(isBn ? 'পিডিএফ ডিভাইসে সেভ করা হয়েছে' : 'PDF saved to device', 'success');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share error, attempting direct save:', err);
        handleSavePdfToDevice();
      }
    } finally {
      setIsProcessing(false);
      setProcessingAction('');
    }
  };

  /**
   * ACTION 2: Save PDF directly to Saveable Place on Device (Downloads / Storage & Vault)
   */
  const handleSavePdfToDevice = async () => {
    setIsProcessing(true);
    setProcessingAction('save');
    showToast(isBn ? 'পিডিএফ ফাইলে সেভ করা হচ্ছে...' : 'Saving PDF to device storage...', 'info');

    try {
      const { blob, fileName } = await generatePdfInstance();
      const blobUrl = URL.createObjectURL(blob);
      setGeneratedPdfBlobUrl(blobUrl);
      setGeneratedPdfFileName(fileName);

      // 1. Trigger native device file download
      triggerDownloadBlob(blob, fileName);

      // 2. Automatically register into Chamber Document Vault so it is never lost
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

      showToast(isBn ? 'পিডিএফ সফলভাবে ডিভাইসে সেভ করা হয়েছে এবং চেম্বার ভল্টে সংরক্ষিত হয়েছে!' : 'PDF saved to device storage and added to Chamber Vault!', 'success');
    } catch (err) {
      console.error('PDF save error:', err);
      showToast(isBn ? 'পিডিএফ সেভ করতে ব্যর্থ হয়েছে' : 'Failed to save PDF', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingAction('');
    }
  };

  /**
   * Helper: Triggers client-side download of a Blob
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
   * ACTION 3: Print to Device / System Printer
   * On mobile devices, delegates to native share sheet (which includes Android Print Service)
   * On desktop/browsers, uses an isolated hidden iframe
   */
  const handlePrintToDevice = async () => {
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);

    if (isMobile && typeof navigator !== 'undefined' && 'share' in navigator) {
      // Mobile WebView: invoke system share with Android Print Service option
      await handleShareToPrintOrApps();
      return;
    }

    // Standard Desktop / Tablet hidden iframe printing
    try {
      let iframe = document.getElementById('srk-print-target-iframe') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'srk-print-target-iframe';
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        window.print();
        return;
      }

      const pageRule = `
        @page {
          size: ${paperSize === 'legal' ? '8.5in 14in' : 'A4'} ${orientation};
          margin: 10mm;
        }
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `;

      let fullContent = printModalData.html;
      if (!fullContent.includes('<html')) {
        fullContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>${docTitle}</title>
              <style>${pageRule}</style>
            </head>
            <body>
              ${printModalData.html}
            </body>
          </html>
        `;
      } else {
        if (fullContent.includes('</head>')) {
          fullContent = fullContent.replace('</head>', `<style>${pageRule}</style></head>`);
        } else {
          fullContent = `<style>${pageRule}</style>` + fullContent;
        }
      }

      doc.open();
      doc.write(fullContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          showToast(isBn ? 'সিস্টেম প্রিন্টারে পাঠানো হয়েছে' : 'Sent to system printer', 'success');
        } catch {
          window.print();
        }
      }, 300);
    } catch {
      handleSavePdfToDevice();
    }
  };

  /**
   * ACTION 4: Download Word document
   */
  const handleDownloadWordDoc = () => {
    const htmlWrapper = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <title>${docTitle}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 30px; font-size: 11pt; }
          </style>
        </head>
        <body>
          ${printModalData.html}
        </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlWrapper], { type: 'application/msword;charset=utf-8' });
    triggerDownloadBlob(blob, `${cleanTitle}.doc`);
    showToast(isBn ? 'ওয়ার্ড ফাইল ডাউনলোড হয়েছে' : 'Word document downloaded', 'success');
  };

  /**
   * ACTION 5: Copy text to clipboard
   */
  const handleCopyText = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = printModalData.html;
    const text = tempDiv.innerText || tempDiv.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast(isBn ? 'টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে' : 'Text copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-4xl h-[94vh] sm:h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden my-auto">
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
          {/* Quick Primary Actions for Mobile */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleShareToPrintOrApps}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Share to Wireless Printer Apps, Drive, WhatsApp, or Save to Files"
            >
              {isProcessing && processingAction === 'share' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{isBn ? 'প্রিন্টার/শেয়ার (Share)' : 'Share / Print Apps'}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSavePdfToDevice}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Save PDF directly to device storage & chamber vault"
            >
              {isProcessing && processingAction === 'save' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isBn ? 'সেভ PDF (Save File)' : 'Save PDF to Device'}</span>
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
                onChange={e => setPaperSize(e.target.value as any)}
                className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="a4">A4</option>
                <option value="legal">Legal (দলিল)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setOrientation(prev => (prev === 'portrait' ? 'landscape' : 'portrait'))}
              className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
              title="Toggle Layout"
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
          <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 text-xs">
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

        {/* Document Preview Box */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950/80 p-2 sm:p-5 flex justify-center">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease'
            }}
            className="w-full transition-all flex justify-center"
          >
            <div
              ref={previewContainerRef}
              style={{
                width: orientation === 'landscape' ? '297mm' : '210mm',
                minHeight: orientation === 'landscape' ? '210mm' : '297mm',
                maxWidth: '100%',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '14mm 16mm',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                borderRadius: '4px',
                margin: '0 auto',
                boxSizing: 'border-box'
              }}
              className="text-slate-900 font-serif leading-relaxed"
              dangerouslySetInnerHTML={{ __html: printModalData.html }}
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

            {/* Save PDF directly to device & Chamber Vault */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSavePdfToDevice}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title={isBn ? 'সরাসরি ডিভাইসে পিডিএফ সেভ করুন' : 'Save PDF to device storage'}
            >
              {isProcessing && processingAction === 'save' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isBn ? 'Save to Device (সেভ করুন)' : 'Save to Device (PDF)'}</span>
            </button>

            {/* Share to Wireless Printer / Print Apps / Android Share Sheet */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleShareToPrintOrApps}
              className="px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title={isBn ? 'ওয়্যারলেস প্রিন্টার বা অ্যাপসে পাঠান' : 'Print via Wireless Printer or Share to Apps'}
            >
              {isProcessing && processingAction === 'share' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              <span>{isBn ? 'প্রিন্ট / শেয়ার (Print)' : 'Print / Share to Apps'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
