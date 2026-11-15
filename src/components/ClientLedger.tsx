import React, { useMemo, useState } from 'react';
import { Download, MessageCircle, Plus, Trash2, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PartyLedgerEntry } from '../types';
import { buildClientBalanceSummaryText, buildClientLedgerTransactionText, dispatchWhatsApp } from '../utils/whatsappHelper';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const money = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v || 0);

export const ClientLedger: React.FC = () => {
  const { activeCompany, language, addPartyLedgerEntry, deletePartyLedgerEntry, showToast } = useApp();
  const bn = language === 'bn';
  const parties = (activeCompany?.parties || []).filter(p => p.type === 'Client');
  const entries = activeCompany?.partyLedgerEntries || [];
  const [open, setOpen] = useState(false);
  const [partyId, setPartyId] = useState('');
  const [date, setDate] = useState(today());
  const [type, setType] = useState<'charge' | 'receipt'>('charge');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState<NonNullable<PartyLedgerEntry['paymentMode']>>('Cash');
  const [reference, setReference] = useState('');
  const [search, setSearch] = useState('');
  const [selectedParty, setSelectedParty] = useState('all');
  const [sendWhatsAppAfterSave, setSendWhatsAppAfterSave] = useState(false);

  const balances = useMemo(() => parties.map(p => {
    const rows = entries.filter(e => e.partyId === p.id);
    const charges = rows.filter(e => e.type === 'charge').reduce((s, e) => s + Number(e.amount || 0), 0);
    const receipts = rows.filter(e => e.type === 'receipt').reduce((s, e) => s + Number(e.amount || 0), 0);
    return { party: p, charges, receipts, balance: charges - receipts };
  }), [parties, entries]);

  const balanceMap = useMemo(() => {
    const m = new Map<string, { charges: number; receipts: number; balance: number }>();
    balances.forEach(b => m.set(b.party.id, { charges: b.charges, receipts: b.receipts, balance: b.balance }));
    return m;
  }, [balances]);

  const totalDue = balances.reduce((s, b) => s + Math.max(0, b.balance), 0);
  const totalAdvance = balances.reduce((s, b) => s + Math.max(0, -b.balance), 0);
  const filtered = useMemo(() => entries.filter(e => (selectedParty === 'all' || e.partyId === selectedParty) && (!search || [e.partyName, e.description, e.reference].some(v => String(v || '').toLowerCase().includes(search.toLowerCase())))).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt), [entries, selectedParty, search]);

  const save = (ev: React.FormEvent) => {
    ev.preventDefault();
    const p = parties.find(x => x.id === partyId);
    const n = Number(amount);
    if (!p || !date || !Number.isFinite(n) || n <= 0 || !description.trim()) {
      showToast(bn ? 'মক্কেল, তারিখ, বিবরণ ও সঠিক পরিমাণ দিন' : 'Select a client and enter a date, description and valid amount', 'error');
      return;
    }
    const entryPayload = {
      partyId: p.id,
      partyName: p.name,
      date,
      type,
      amount: n,
      description: description.trim(),
      paymentMode: type === 'receipt' ? paymentMode : undefined,
      reference: reference.trim()
    };
    addPartyLedgerEntry(entryPayload);

    if (sendWhatsAppAfterSave) {
      const existing = balanceMap.get(p.id) || { charges: 0, receipts: 0, balance: 0 };
      const nextCharges = existing.charges + (type === 'charge' ? n : 0);
      const nextReceipts = existing.receipts + (type === 'receipt' ? n : 0);
      const updatedSummary = {
        charges: nextCharges,
        receipts: nextReceipts,
        balance: nextCharges - nextReceipts
      };
      dispatchWhatsApp(
        p.phone || '',
        buildClientLedgerTransactionText(activeCompany, entryPayload, updatedSummary),
        {
          partyId: p.id,
          partyName: p.name,
          autoSendIfConnected: Boolean(p.phone),
          title: bn ? 'মক্কেল হিসাব — WhatsApp মেসেজ' : 'Client Ledger Transaction — WhatsApp'
        }
      );
    }

    setAmount('');
    setDescription('');
    setReference('');
    setDate(today());
    setType('charge');
    setSendWhatsAppAfterSave(false);
    setOpen(false);
  };

  const sendBalanceSummaryWhatsApp = (b: { party: typeof parties[number]; charges: number; receipts: number; balance: number }) => {
    dispatchWhatsApp(
      b.party.phone || '',
      buildClientBalanceSummaryText(activeCompany, {
        partyName: b.party.name,
        charges: b.charges,
        receipts: b.receipts,
        balance: b.balance
      }),
      {
        partyId: b.party.id,
        partyName: b.party.name,
        autoSendIfConnected: Boolean(b.party.phone),
        title: bn ? 'মক্কেল বকেয়া সারাংশ — WhatsApp' : 'Client Balance Summary — WhatsApp'
      }
    );
  };

  const sendLedgerRowWhatsApp = (e: PartyLedgerEntry) => {
    const p = parties.find(x => x.id === e.partyId);
    const bal = balanceMap.get(e.partyId);
    dispatchWhatsApp(
      p?.phone || '',
      buildClientLedgerTransactionText(activeCompany, e, bal),
      {
        partyId: p?.id || e.partyId,
        partyName: p?.name || e.partyName,
        autoSendIfConnected: Boolean(p?.phone),
        title: bn ? 'মক্কেল হিসাব — WhatsApp মেসেজ' : 'Client Ledger Transaction — WhatsApp'
      }
    );
  };

  const exportCsv = () => {
    const rows = [['Date', 'Client', 'Type', 'Description', 'Amount INR', 'Payment Mode', 'Reference'], ...filtered.map(e => [e.date, e.partyName, e.type, e.description, e.amount, e.paymentMode || '', e.reference || ''])];
    const csv = '\uFEFF' + rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'SRK-Client-Ledger-' + today() + '.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const card = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm';
  const input = 'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500';
  const label = 'block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5';

  return <div className="space-y-5 max-w-7xl mx-auto">
    <div className="flex flex-wrap justify-between items-center gap-3">
      <div><h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" />{bn ? 'মক্কেলের বকেয়া ও অগ্রিম হিসাব' : 'Client Outstanding & Advance Ledger'}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">{bn ? 'ফি/খরচের দায় ও প্রাপ্ত টাকা নথিভুক্ত করুন। এটি কোনো বিল বা ইনভয়েস তৈরি করে না।' : 'Record fees/expenses due and money received. No bill or invoice is generated.'}</p></div>
      <div className="flex gap-2"><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-bold"><Download className="w-4 h-4" />{bn ? 'CSV ডাউনলোড' : 'Export CSV'}</button>
        <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-2.5 text-xs font-bold text-white"><Plus className="w-4 h-4" />{bn ? 'নতুন এন্ট্রি' : 'Add Entry'}</button></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className={card}><div className="text-xs text-slate-500">{bn ? 'মোট বকেয়া' : 'Total Outstanding'}</div><div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-2">{money(totalDue)}</div></div>
      <div className={card}><div className="text-xs text-slate-500">{bn ? 'মোট অগ্রিম' : 'Total Advance'}</div><div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">{money(totalAdvance)}</div></div>
      <div className={card}><div className="text-xs text-slate-500">{bn ? 'মক্কেলের সংখ্যা' : 'Client Count'}</div><div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-2">{parties.length}</div></div>
    </div>
    {open && <form onSubmit={save} className={card + ' space-y-4 border-blue-200 dark:border-blue-900'}>
      <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">{bn ? 'নতুন মক্কেল হিসাব' : 'New Client Ledger Entry'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div><label className={label}>{bn ? 'মক্কেল' : 'Client'}</label><select className={input} value={partyId} onChange={e => setPartyId(e.target.value)} required><option value="">{bn ? 'নির্বাচন করুন' : 'Select client'}</option>{parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div><label className={label}>{bn ? 'এন্ট্রির ধরন' : 'Entry Type'}</label><select className={input} value={type} onChange={e => setType(e.target.value as 'charge' | 'receipt')}><option value="charge">{bn ? 'ফি / খরচ ধার্য' : 'Fee / Expense Due'}</option><option value="receipt">{bn ? 'টাকা প্রাপ্তি' : 'Payment Received'}</option></select></div>
        <div><label className={label}>{bn ? 'তারিখ' : 'Date'}</label><input className={input} type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
        <div><label className={label}>{bn ? 'পরিমাণ (₹)' : 'Amount (₹)'}</label><input className={input} type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
        <div className="sm:col-span-2"><label className={label}>{bn ? 'বিবরণ' : 'Description'}</label><input className={input} value={description} onChange={e => setDescription(e.target.value)} placeholder={bn ? 'যেমন: মামলা পরিচালনার ফি' : 'e.g. Case handling fee'} required /></div>
        {type === 'receipt' && <div><label className={label}>{bn ? 'টাকা পাওয়ার মাধ্যম' : 'Payment Mode'}</label><select className={input} value={paymentMode} onChange={e => setPaymentMode(e.target.value as NonNullable<PartyLedgerEntry['paymentMode']>)}><option>Cash</option><option>Bank</option><option>UPI</option><option>Other</option></select></div>}
        <div><label className={label}>{bn ? 'রেফারেন্স' : 'Reference'}</label><input className={input} value={reference} onChange={e => setReference(e.target.value)} /></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sendWhatsAppAfterSave}
            onChange={e => setSendWhatsAppAfterSave(e.target.checked)}
            className="w-4 h-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
          />
          <MessageCircle className="w-4 h-4" />
          {bn ? 'সেভ করে মক্কেলকে ইন-অ্যাপ WhatsApp মেসেজ পাঠান' : 'Send in-app WhatsApp message to client after saving'}
        </label>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold">{bn ? 'বাতিল' : 'Cancel'}</button><button type="submit" className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white">{bn ? 'সংরক্ষণ' : 'Save'}</button></div>
      </div>
    </form>}
    <section className={card}><h2 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">{bn ? 'মক্কেলভিত্তিক বকেয়া' : 'Client-wise Balances'}</h2>
      <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-xs text-left"><thead><tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500"><th className="py-3 px-2">{bn ? 'মক্কেল' : 'Client'}</th><th className="py-3 px-2 text-right">{bn ? 'ধার্য' : 'Due / Charge'}</th><th className="py-3 px-2 text-right">{bn ? 'প্রাপ্ত' : 'Received'}</th><th className="py-3 px-2 text-right">{bn ? 'বর্তমান স্থিতি' : 'Balance'}</th><th className="py-3 px-2 text-center">WhatsApp</th></tr></thead><tbody>
        {balances.map(b => <tr key={b.party.id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-3 px-2 font-semibold">{b.party.name}{b.party.phone ? <div className="text-[10px] font-normal text-slate-400 font-mono">{b.party.phone}</div> : null}</td><td className="py-3 px-2 text-right">{money(b.charges)}</td><td className="py-3 px-2 text-right">{money(b.receipts)}</td><td className={'py-3 px-2 text-right font-extrabold ' + (b.balance > 0 ? 'text-rose-600' : b.balance < 0 ? 'text-emerald-600' : 'text-slate-500')}>{b.balance > 0 ? money(b.balance) : b.balance < 0 ? money(-b.balance) + ' ' + (bn ? 'অগ্রিম' : 'advance') : money(0)}</td><td className="py-3 px-2 text-center"><button type="button" onClick={() => sendBalanceSummaryWhatsApp(b)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] cursor-pointer" title={bn ? 'ইন-অ্যাপ WhatsApp সারাংশ পাঠান' : 'Send In-App WhatsApp Balance Statement'}><MessageCircle className="w-3.5 h-3.5" /> {bn ? 'পাঠান' : 'Send'}</button></td></tr>)}
        {balances.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">{bn ? 'প্রথমে Party Registry-তে Client যোগ করুন' : 'Add clients in Party Registry first'}</td></tr>}
      </tbody></table></div>
    </section>
    <section className={card}><div className="flex flex-col sm:flex-row justify-between gap-3 mb-3"><h2 className="font-extrabold text-sm text-slate-900 dark:text-white">{bn ? 'লেনদেনের বিবরণ' : 'Ledger Transactions'}</h2><div className="flex gap-2"><input className={input + ' max-w-56'} value={search} onChange={e => setSearch(e.target.value)} placeholder={bn ? 'খুঁজুন...' : 'Search...'} /><select className={input + ' max-w-56'} value={selectedParty} onChange={e => setSelectedParty(e.target.value)}><option value="all">{bn ? 'সব মক্কেল' : 'All clients'}</option>{parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[740px] text-xs text-left"><thead><tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500"><th className="py-3 px-2">{bn ? 'তারিখ' : 'Date'}</th><th className="py-3 px-2">{bn ? 'মক্কেল' : 'Client'}</th><th className="py-3 px-2">{bn ? 'বিবরণ' : 'Description'}</th><th className="py-3 px-2">{bn ? 'ধরন' : 'Type'}</th><th className="py-3 px-2 text-right">{bn ? 'পরিমাণ' : 'Amount'}</th><th className="py-3 px-2 text-center">{bn ? 'কার্যক্রম' : 'Actions'}</th></tr></thead><tbody>
        {filtered.map(e => <tr key={e.id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-3 px-2">{e.date}</td><td className="py-3 px-2">{e.partyName}</td><td className="py-3 px-2">{e.description}<div className="text-[10px] text-slate-400">{e.reference || ''}</div></td><td className="py-3 px-2">{e.type === 'charge' ? (bn ? 'ধার্য' : 'Due') : (bn ? 'প্রাপ্তি' : 'Receipt')}</td><td className="py-3 px-2 text-right font-bold">{money(e.amount)}</td><td className="py-3 px-2 text-center whitespace-nowrap"><div className="inline-flex items-center justify-center gap-1"><button type="button" onClick={() => sendLedgerRowWhatsApp(e)} className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg cursor-pointer" title={bn ? 'ইন-অ্যাপ WhatsApp মেসেজ পাঠান' : 'Send In-App WhatsApp Message'}><MessageCircle className="w-4 h-4" /></button><button type="button" onClick={() => { if (window.confirm(bn ? 'এই এন্ট্রি মুছবেন?' : 'Delete this entry?')) deletePartyLedgerEntry(e.id); }} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer" title={bn ? 'মুছুন' : 'Delete'}><Trash2 className="w-4 h-4" /></button></div></td></tr>)}
        {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400">{bn ? 'কোনো রেকর্ড নেই' : 'No records found'}</td></tr>}
      </tbody></table></div>
    </section>
  </div>;
};
export default ClientLedger;
