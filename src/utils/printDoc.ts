/**
 * Robust cross-browser and iframe-safe printing utility
 * Tries popup window first; if blocked, falls back to hidden iframe printing.
 */
export function safePrintHtml(fullHtmlDocument: string): void {
  try {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(fullHtmlDocument);
      printWin.document.close();
      // Allow styles to render before triggering print dialog
      setTimeout(() => {
        try {
          printWin.focus();
          printWin.print();
        } catch (e) {
          console.warn('printWin.print() warning:', e);
        }
      }, 300);
      return;
    }
  } catch (e) {
    console.info('window.open blocked, falling back to iframe print:', e);
  }

  // Fallback: Use hidden iframe so popup blocker never halts printing
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.id = 'safe-print-frame-' + Date.now();
    document.body.appendChild(iframe);

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
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 60000); // Clean up after print dialog finishes
        }
      }, 400);
    }
  } catch (err) {
    console.error('Safe print fallback failed:', err);
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
