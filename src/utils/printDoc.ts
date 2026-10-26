/**
 * Robust cross-browser, mobile-safe and iframe-safe printing utility
 * NEVER uses window.open which redirects or opens a new tab on mobile devices.
 * Dispatches an on-screen Print & PDF preview modal event with direct Device Print & Print to PDF options.
 */

export interface SafePrintOptions {
  title?: string;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'a4' | 'legal';
}

export function safePrintHtml(fullHtmlDocument: string, optionsOrTitle?: string | SafePrintOptions): void {
  let title = 'Document';
  let orientation: 'portrait' | 'landscape' = 'portrait';
  let paperSize: 'a4' | 'legal' = 'a4';

  if (typeof optionsOrTitle === 'string') {
    title = optionsOrTitle;
  } else if (optionsOrTitle && typeof optionsOrTitle === 'object') {
    title = optionsOrTitle.title || 'Document';
    if (optionsOrTitle.orientation) orientation = optionsOrTitle.orientation;
    if (optionsOrTitle.paperSize) paperSize = optionsOrTitle.paperSize;
  }

  // Auto-detect title from <title> tag if available
  if (title === 'Document') {
    const titleMatch = fullHtmlDocument.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }
  }

  // Auto-detect landscape orientation from style tag
  if (orientation === 'portrait' && (fullHtmlDocument.includes('landscape') || fullHtmlDocument.includes('size: landscape'))) {
    orientation = 'landscape';
  }

  // Dispatch on-screen Print & PDF modal event so user sees the preview & device selector on screen
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('srk-open-print-modal', {
      detail: {
        html: fullHtmlDocument,
        title,
        orientation,
        paperSize
      }
    });
    window.dispatchEvent(event);
  }
}

/**
 * Direct print using hidden iframe without opening popup or navigating away
 */
export function directIframePrint(fullHtmlDocument: string, title: string = 'Document'): void {
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
    if (doc) {
      doc.open();
      doc.write(fullHtmlDocument);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.warn('Iframe print error:', err);
          window.print();
        }
      }, 300);
    }
  } catch (err) {
    console.error('Direct iframe print failed:', err);
    window.print();
  }
}

/**
 * Universal safe WhatsApp link opener without popup blocker issues
 */
export function safeOpenWhatsApp(phone: string, message: string): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  const link = document.createElement('a');
  link.href = waUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 100);
}
