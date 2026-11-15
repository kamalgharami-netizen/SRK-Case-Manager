import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WhatsAppSessionSetup, WhatsAppStatusResponse } from './WhatsAppSessionSetup';

interface DispatchPayload {
  phone: string;
  message: string;
  partyId?: string;
  partyName?: string;
  autoSendIfConnected?: boolean;
  title?: string;
}

export const WhatsAppDispatchModal: React.FC = () => {
  const { activeCompany, language, sendMessage, showToast } = useApp();
  const bn = language === 'bn';
  const sessionId = activeCompany?.id || 'default';

  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [partyId, setPartyId] = useState<string | undefined>(undefined);
  const [partyName, setPartyName] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<WhatsAppStatusResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  const performServerSend = async (
    targetPhone: string,
    targetMessage: string,
    targetPartyId?: string,
    targetPartyName?: string
  ): Promise<boolean> => {
    setIsSending(true);
    setSendError(null);
    setSentSuccess(false);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          phone: targetPhone,
          message: targetMessage
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.message || data.error || 'Failed to send WhatsApp message');
        if (data.error === 'WHATSAPP_NOT_CONNECTED') {
          showToast(
            bn ? 'অনুগ্রহ করে অ্যাপের ভেতর WhatsApp লগইন করুন' : 'Please link your WhatsApp inside the app to send directly',
            'warning'
          );
        } else {
          showToast(data.message || data.error || 'WhatsApp send failed', 'error');
        }
        return false;
      }

      sendMessage(
        targetPartyId || 'whatsapp_direct',
        targetPhone,
        targetMessage,
        'WhatsApp'
      );
      setSentSuccess(true);
      showToast(
        bn
          ? `${targetPartyName || targetPhone}-কে WhatsApp মেসেজ পাঠানো হয়েছে`
          : `WhatsApp message sent directly to ${targetPartyName || `+${data.to}`}`,
        'success'
      );
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Network error while sending WhatsApp message';
      setSendError(msg);
      showToast(msg, 'error');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const handleEvent = async (e: Event) => {
      const detail = ((e as CustomEvent<DispatchPayload>).detail || {}) as DispatchPayload;
      const incomingPhone = detail.phone || '';
      const incomingMsg = detail.message || '';

      setPhone(incomingPhone);
      setMessage(incomingMsg);
      setPartyId(detail.partyId);
      setPartyName(detail.partyName);
      setTitle(detail.title || '');
      setSendError(null);
      setSentSuccess(false);

      // If caller requested 1-click auto-send (e.g. "Save & Send WhatsApp" toggle) and phone + connected session exist:
      if (detail.autoSendIfConnected && incomingPhone.replace(/\D/g, '').length >= 10) {
        try {
          const stRes = await fetch(`/api/whatsapp/status?sessionId=${encodeURIComponent(sessionId)}`);
          const st: WhatsAppStatusResponse = await stRes.json();
          setSessionStatus(st);
          if (st.status === 'connected') {
            const ok = await performServerSend(incomingPhone, incomingMsg, detail.partyId, detail.partyName);
            if (ok) return;
          }
        } catch {
          // fall through to modal so user can login or retry inside app
        }
      }

      setIsOpen(true);
    };

    window.addEventListener('srk-send-whatsapp', handleEvent as EventListener);
    return () => window.removeEventListener('srk-send-whatsapp', handleEvent as EventListener);
  }, [sessionId]);

  if (!isOpen) return null;

  const isConnected = sessionStatus?.status === 'connected';

  const handleSubmitSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) {
      setSendError(bn ? 'সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন' : 'Please enter a valid 10-digit recipient mobile number.');
      return;
    }
    if (!message.trim()) {
      setSendError(bn ? 'মেসেজ খালি রাখা যাবে না' : 'Message body cannot be empty.');
      return;
    }
    const ok = await performServerSend(phone, message.trim(), partyId, partyName);
    if (ok) {
      window.setTimeout(() => setIsOpen(false), 900);
    }
  };

  return (
    <div className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {title || (bn ? 'ইন-অ্যাপ WhatsApp মেসেজ প্রেরণ' : 'In-App WhatsApp Message Dispatch')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {bn
                  ? 'সরাসরি অ্যাপ থেকেই মেসেজ যাবে (WhatsApp অ্যাপ বা ব্রাউজারে রিডাইরেক্ট হবে না)'
                  : 'Sends directly inside SRK Case Manager — no external browser or desktop redirect'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Embedded WhatsApp Account Login Setup (shows compact status if connected, or full QR/Pairing login if disconnected) */}
          <WhatsAppSessionSetup compact onStatusChange={setSessionStatus} />

          <form onSubmit={handleSubmitSend} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                {bn ? 'প্রাপকের WhatsApp মোবাইল নম্বর *' : 'Recipient WhatsApp Mobile Number *'}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9830112233"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                {bn ? 'মেসেজ বিবরণ (সম্পাদনা করা যাবে) *' : 'Message Text (Editable before sending) *'}
              </label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono leading-relaxed"
              />
            </div>

            {sendError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            {sentSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{bn ? 'মেসেজ সফলভাবে পাঠানো হয়েছে!' : 'WhatsApp message delivered successfully!'}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
              >
                {bn ? 'বন্ধ করুন' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSending || !isConnected}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{bn ? 'সরাসরি পাঠান' : 'Send via App'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
