import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Share2,
  Clock,
  User,
  Send,
  CheckCircle2,
  Phone
} from 'lucide-react';

export const CommunicationCenter: React.FC = () => {
  const { activeCompany, sendMessage, showToast } = useApp();

  const parties = activeCompany?.parties || [];
  const messages = activeCompany?.messages || [];

  const [selectedPartyId, setSelectedPartyId] = useState<string>(
    parties[0]?.id || ''
  );
  const [customPhone, setCustomPhone] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [channel, setChannel] = useState<'WhatsApp' | 'SMS'>('WhatsApp');

  const selectedParty = parties.find(p => p.id === selectedPartyId);

  const applyTemplate = (type: string) => {
    const partyName = selectedParty?.name || 'Client';
    const chamberName = activeCompany?.name || 'SRK Legal Chamber';

    let msg = '';
    if (type === 'hearing') {
      msg = `Respected ${partyName}, your land case hearing has been scheduled before the Ld. Authority. Please keep original link deeds and tax receipts ready. - ${chamberName}`;
    } else if (type === 'document') {
      msg = `Dear ${partyName}, we request you to kindly supply the certified copy of Waris Certificate and registered link deeds for drafting your mutation petition. - ${chamberName}`;
    } else if (type === 'order') {
      msg = `Good news! Final order has been passed in your land case. Please visit our chamber to collect the certified copy. - ${chamberName}`;
    }
    setMessageBody(msg);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = customPhone || selectedParty?.phone;
    if (!phone) {
      showToast('Please provide a mobile number', 'error');
      return;
    }
    if (!messageBody.trim()) {
      showToast('Please write a message', 'error');
      return;
    }

    sendMessage(
      selectedPartyId || 'custom',
      phone,
      messageBody.trim(),
      channel
    );

    // Launch WhatsApp directly
    if (channel === 'WhatsApp') {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const encoded = encodeURIComponent(messageBody.trim());
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;
      window.open(waUrl, '_blank');
    }

    setMessageBody('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <span>Client Notices & WhatsApp Alerts (বার্তা ও নোটিশ)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Send automated hearing reminders, order updates, and document collection notices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Compose Form (7 cols) */}
        <form
          onSubmit={handleSend}
          className="md:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
            <span>Compose Client Notice</span>
            <span className="text-[11px] font-normal text-slate-400">Direct WhatsApp Dispatch</span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Select Client / Litigant
            </label>
            <select
              value={selectedPartyId}
              onChange={e => {
                setSelectedPartyId(e.target.value);
                const p = parties.find(x => x.id === e.target.value);
                if (p?.phone) setCustomPhone(p.phone);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              {parties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type}) {p.phone ? `· ${p.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Mobile / WhatsApp Number *
            </label>
            <input
              type="text"
              required
              value={customPhone || selectedParty?.phone || ''}
              onChange={e => setCustomPhone(e.target.value)}
              placeholder="+91 98301 XXXXX"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
            />
          </div>

          {/* Quick template buttons */}
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
              Quick Templates:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyTemplate('hearing')}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                📅 Hearing Date
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('document')}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                📄 Missing Document
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('order')}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                ✅ Final Order Passed
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">
                Notice Message *
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {messageBody.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={messageBody}
              onChange={e => setMessageBody(e.target.value)}
              placeholder="Write client notice or click a template above..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="chan"
                  checked={channel === 'WhatsApp'}
                  onChange={() => setChannel('WhatsApp')}
                />
                <span className="font-bold text-emerald-600">WhatsApp</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="chan"
                  checked={channel === 'SMS'}
                  onChange={() => setChannel('SMS')}
                />
                <span>SMS</span>
              </label>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Dispatch Notice
            </button>
          </div>
        </form>

        {/* Message Log (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
            Dispatched Notice Log ({messages.length})
          </div>

          {messages.length > 0 ? (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {messages.map(m => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>{m.partyName}</span>
                    <span className="text-[10px] text-emerald-600 font-mono">
                      {m.channel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {m.phone}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-snug">
                    {m.body}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono text-right">
                    {new Date(m.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center">
              No messages dispatched yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
