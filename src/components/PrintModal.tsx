import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  FileDown,
  Share2,
  X,
  FileText,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Smartphone,
  Laptop,
  HardDrive,
  Download,
  RotateCw
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
  const { printModalData, closePrintPreview, showToast, language } = useApp();
  const [zoom, setZoom] = useState<number>(100);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState<'a4' | 'legal'>('a4');
  const [selectedDevice, setSelectedDevice] = useState<'system' | 'pdf' | 'share'>('system');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const isBn = language === 'bn';

  useEffect(() => {
    if (printModalData) {
      setOrientation(printModalData.orientation || 'portrait');
      setPaperSize(printModalData.paperSize || 'a4');
      setZoom(typeof window !== 'undefined' && window.innerWidth < 640 ? 75 : 100);
      setSelectedDevice('system');
    }
  }, [printModalData]);

  if (!printModalData || !printModalData.isOpen) return null;

  const docTitle = printModalData.title || 'Document';

  // Handle direct safe device print (never calls window.open)
  const handlePrintToDevice = () => {
    try {
      // Create or reuse hidden iframe
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

      // Compose full HTML with @page rules for paperSize and orientation
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
        // Inject pageRule into existing head
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
          showToast(isBn ? 'প্রিন্ট কমান্ড ডিভাইসে পাঠানো হয়েছে' : 'Print command sent to device', 'success');
        } catch (e) {
          console.warn('Iframe print error, falling back:', e);
          window.print();
        }
      }, 350);
    } catch (err) {
      console.error('Print device error:', err);
      window.print();
    }
  };

  // Handle direct client-side PDF generation & download
  const handleDownloadPdf = async () => {
    if (!previewContainerRef.current) return;
    setIsGeneratingPdf(true);
    showToast(isBn ? 'পিডিএফ তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...' : 'Generating PDF, please wait...', 'info');

    try {
      const element = previewContainerRef.current;
      const originalTransform = element.style.transform;
      element.style.transform = 'none'; // reset zoom scale for crisp capture

      const canvas = await html2canvas(element, {
        scale: 2, // high resolution
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

      // Handle multi-page if height exceeds single page
      if (renderHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', (pdfWidth - renderWidth) / 2, 8, renderWidth, renderHeight);
      } else {
        let heightLeft = renderHeight;
        let position = 0;
        const pageCanvasHeight = (pdfHeight / renderHeight) * imgHeight;

        // Multi-page slicing
        while (heightLeft > 0) {
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, renderHeight);
          heightLeft -= pdfHeight;
          position -= pdfHeight;
          if (heightLeft > 0) {
            pdf.addPage();
          }
        }
      }

      const cleanTitle = docTitle.replace(/[^a-zA-Z0-9_\-]/g, '_');
      pdf.save(`${cleanTitle}.pdf`);
      showToast(isBn ? 'পিডিএফ ফাইল সফলভাবে ডাউনলোড হয়েছে' : 'PDF downloaded successfully', 'success');
    } catch (err) {
      console.error('PDF generation error, fallback to print dialog:', err);
      showToast(isBn ? 'সিস্টেম প্রিন্ট ডায়ালগে সেভ অ্যাজ পিডিএফ নির্বাচন করুন' : 'Select "Save as PDF" in system print dialog', 'info');
      handlePrintToDevice();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Mobile Web Share API: Share PDF / document directly to print apps (Mopria, HP Smart, Drive, WhatsApp)
  const handleMobileShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: docTitle,
          text: `${docTitle} - SRK Case Manager`
        });
        showToast(isBn ? 'শেয়ার সম্পন্ন হয়েছে' : 'Shared successfully', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleDownloadPdf();
        }
      }
    } else {
      handleDownloadPdf();
    }
  };

  // Download Word doc
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.replace(/[^a-zA-Z0-9_\-]/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isBn ? 'ওয়ার্ড ফাইল ডাউনলোড হয়েছে' : 'Word document downloaded', 'success');
  };

  // Copy document text
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                {docTitle}
              </h2>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                <span>{isBn ? 'অন-স্ক্রিন প্রিন্ট ও পিডিএফ প্রিভিউ' : 'On-Screen Print & PDF Preview'}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {isBn ? 'সরাসরি প্রিন্ট / রিডাইরেক্ট মুক্ত' : 'Direct Print / Zero Redirect'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={closePrintPreview}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isBn ? 'বন্ধ করুন' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Device & Options Control Strip */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
          {/* Selectable Device Target on Screen */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSelectedDevice('system')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedDevice === 'system'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
              title={isBn ? 'ডিভাইসের প্রিন্টারে প্রিন্ট করুন' : 'Print to Selectable Device / Printer'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রিন্টার নির্বাচন' : 'Print to Device'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDevice('pdf')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedDevice === 'pdf'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
              title={isBn ? 'পিডিএফ হিসেবে সংরক্ষণ করুন' : 'Print to PDF Option'}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isBn ? 'Print to PDF' : 'Print to PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDevice('share')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedDevice === 'share'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
              title={isBn ? 'মোবাইল প্রিন্ট অ্যাপসে শেয়ার করুন' : 'Share to Mobile Print Apps'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'মোবাইল শেয়ার' : 'Mobile Share'}</span>
            </button>
          </div>

          {/* Paper Settings: Orientation & Size */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 hidden sm:inline">
                {isBn ? 'সাইজ:' : 'Paper:'}
              </span>
              <select
                value={paperSize}
                onChange={e => setPaperSize(e.target.value as any)}
                className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="a4">A4 (210×297 mm)</option>
                <option value="legal">Legal (দলিল/রাজস্ব কাগজ)</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 hidden sm:inline">
                {isBn ? 'ওরিয়েন্টেশন:' : 'Layout:'}
              </span>
              <button
                type="button"
                onClick={() => setOrientation(prev => (prev === 'portrait' ? 'landscape' : 'portrait'))}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                title="Toggle Portrait / Landscape"
              >
                <RotateCw className="w-3 h-3" />
                <span className="capitalize">{orientation}</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(50, z - 10))}
                className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold w-10 text-center text-slate-600 dark:text-slate-400">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(150, z + 10))}
                className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Document Preview Box */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950/80 p-3 sm:p-6 flex justify-center">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease'
            }}
            className="w-full transition-all"
          >
            <div
              ref={previewContainerRef}
              style={{
                width: orientation === 'landscape' ? '297mm' : '210mm',
                minHeight: orientation === 'landscape' ? '210mm' : '297mm',
                maxWidth: '100%',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '16mm 18mm',
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
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy Text')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadWordDoc}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download MS Word document"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Word (.doc)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={closePrintPreview}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isBn ? 'বাতিল' : 'Close'}
            </button>

            {/* Direct Print to PDF Option */}
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title={isBn ? 'সরাসরি পিডিএফ ফাইল ডাউনলোড করুন' : 'Print to PDF / Download PDF'}
            >
              <FileDown className="w-4 h-4" />
              <span>{isGeneratingPdf ? (isBn ? 'পিডিএফ হচ্ছে...' : 'Saving PDF...') : (isBn ? 'Print to PDF' : 'Print to PDF')}</span>
            </button>

            {/* Direct Print to Device Button */}
            <button
              type="button"
              onClick={handlePrintToDevice}
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title={isBn ? 'সরাসরি প্রিন্টারে প্রিন্ট পাঠান' : 'Print to Device Printer'}
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'প্রিন্ট করুন (Print)' : 'Print to Device'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
