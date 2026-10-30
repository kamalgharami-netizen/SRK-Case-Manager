import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Download, Plus, Search, Trash2, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FinancialEntry } from '../types';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2
}).format(value || 0);

export const OfficeAccounts: React.FC = () => {
  const { activeCompany, language, addFinancialEntry, deleteFinancialEntry, showToast } = useApp();
  const bn = language === 'bn';
  const entries = activeCompany?.financialEntries || [];
  const [formOpen, setFormOpen] = useState(false);
  const [kindFilter, setKindFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [kind, setKind] = useState<'income' | 'expense'>('income');
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [partyId, setPartyId] = useState('');
  const [paymentMode, setPaymentMode] = useState<FinancialEntry['paymentMode']>('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const totals = useMemo(() => entries.reduce((acc, item) => {
    if (item.kind === 'income') acc.income += Number(item.amount) || 0;
    else acc.expense += Number(item.amount) || 0;
    return acc;
  }, { income: 0, expense: 0 }), [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...entries]
      .filter(item => kindFilter === 'all' || item.kind === kindFilter)
      .filter(item => monthFilter === 'all' || item.date.startsWith(monthFilter))
      .filter(item => !q || [item.category, item.partyName, item.reference, item.notes, item.paymentMode]
        .some(value => String(value || '').toLowerCase().includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [entries, kindFilter, monthFilter, search]);

  const months = useMemo(() => Array.from(new Set(entries.map(item => item.date.slice(0, 7)).filter(Boolean))).sort().reverse(), [entries]);

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setPartyId('');
    setPaymentMode('Cash');
    setReference('');
    setNotes('');
    setDate(today());
    setKind('income');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !category.trim() || !date) {
      showToast(bn ? 'তারিখ, খাত ও সঠিক টাকার পরিমাণ দিন' : 'Enter a date, category and valid amount', 'error');
      return;
    }
    const party = activeCompany?.parties?.find(p => p.id === partyId);
    addFinancialEntry({
      kind, date, amount: parsedAmount, category: category.trim(),
      partyId: party?.id, partyName: party?.name,
      paymentMode, reference: reference.trim(), notes: notes.trim()
    });
    resetForm();
    setFormOpen(false);
  };

  const exportCsv = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount INR', 'Party', 'Payment Mode', 'Reference', 'Notes'];
    const rows = filtered.map(item => [
      item.date, item.kind, item.category, item.amount, item.partyName || '',
      item.paymentMode, item.reference || '', item.notes || ''
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(value =>
      `"${String(value ?? '').replace(/"/g, '""')}"`
    ).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `SRK-Office-Accounts-${today()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const card = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm';
  const label = 'block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5';
  const input = 'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            {bn ? 'অফিসের আয়-ব্যয়ের হিসাব' : 'Office Income & Expenses'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {bn ? 'প্রকৃত আয় ও ব্যয়ের রেকর্ড রাখুন — এখানে কোনো বিল বা ইনভয়েস তৈরি হয় না।' : 'Record actual receipts and expenses — this module does not create bills or invoices.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Download className="w-4 h-4" /> {bn ? 'CSV ডাউনলোড' : 'Export CSV'}
          </button>
          <button onClick={() => setFormOpen(v => !v)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-2.5 text-xs font-bold text-white shadow-sm">
            <Plus className="w-4 h-4" /> {bn ? 'নতুন হিসাব' : 'Add Entry'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={card}>
          <div className="flex items-center justify-between text-xs text-slate-500"><span>{bn ? 'মোট আয়' : 'Total Income'}</span><ArrowDownLeft className="w-5 h-5 text-emerald-600" /></div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">{money(totals.income)}</div>
        </div>
        <div className={card}>
          <div className="flex items-center justify-between text-xs text-slate-500"><span>{bn ? 'মোট ব্যয়' : 'Total Expenses'}</span><ArrowUpRight className="w-5 h-5 text-rose-600" /></div>
          <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-2">{money(totals.expense)}</div>
        </div>
        <div className={card}>
          <div className="flex items-center justify-between text-xs text-slate-500"><span>{bn ? 'নিট পার্থক্য' : 'Net Difference'}</span><Wallet className="w-5 h-5 text-blue-600" /></div>
          <div className={`text-2xl font-extrabold mt-2 ${totals.income - totals.expense >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-rose-700 dark:text-rose-400'}`}>{money(totals.income - totals.expense)}</div>
        </div>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className={`${card} space-y-4 border-blue-200 dark:border-blue-900`}>
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">{bn ? 'নতুন আয় / ব্যয়ের রেকর্ড' : 'New Income / Expense Record'}</h2>
            <button type="button" onClick={() => setFormOpen(false)} className="text-xs font-bold text-slate-500 hover:text-slate-800">{bn ? 'বন্ধ' : 'Close'}</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div><label className={label}>{bn ? 'রেকর্ডের ধরন' : 'Entry Type'}</label><select className={input} value={kind} onChange={e => setKind(e.target.value as 'income' | 'expense')}><option value="income">{bn ? 'আয় / টাকা প্রাপ্তি' : 'Income / Receipt'}</option><option value="expense">{bn ? 'ব্যয় / টাকা প্রদান' : 'Expense / Payment'}</option></select></div>
            <div><label className={label}>{bn ? 'তারিখ' : 'Date'}</label><input className={input} type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div><label className={label}>{bn ? 'টাকার পরিমাণ (₹)' : 'Amount (₹)'}</label><input className={input} type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required /></div>
            <div><label className={label}>{bn ? 'খাত / ক্যাটাগরি' : 'Category'}</label><input className={input} value={category} onChange={e => setCategory(e.target.value)} placeholder={bn ? 'যেমন: কোর্ট ফি / যাতায়াত' : 'e.g. Court fee / Travel'} required /></div>
            <div><label className={label}>{bn ? 'সংশ্লিষ্ট মক্কেল / পক্ষ (ঐচ্ছিক)' : 'Related Client / Party (optional)'}</label><select className={input} value={partyId} onChange={e => setPartyId(e.target.value)}><option value="">{bn ? 'নির্বাচন করুন' : 'Select party'}</option>{(activeCompany?.parties || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label className={label}>{bn ? 'লেনদেনের মাধ্যম' : 'Payment Mode'}</label><select className={input} value={paymentMode} onChange={e => setPaymentMode(e.target.value as FinancialEntry['paymentMode'])}><option value="Cash">Cash / নগদ</option><option value="Bank">Bank / ব্যাংক</option><option value="UPI">UPI</option><option value="Other">{bn ? 'অন্যান্য' : 'Other'}</option></select></div>
            <div><label className={label}>{bn ? 'রেফারেন্স নম্বর' : 'Reference Number'}</label><input className={input} value={reference} onChange={e => setReference(e.target.value)} placeholder={bn ? 'ঐচ্ছিক' : 'Optional'} /></div>
            <div><label className={label}>{bn ? 'বিবরণ' : 'Notes'}</label><input className={input} value={notes} onChange={e => setNotes(e.target.value)} placeholder={bn ? 'ঐচ্ছিক' : 'Optional'} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold">{bn ? 'রিসেট' : 'Reset'}</button>
            <button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white">{bn ? 'সংরক্ষণ করুন' : 'Save Record'}</button>
          </div>
        </form>
      )}

      <section className={card}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">{bn ? 'হিসাবের খাতা' : 'Account Register'}</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${input} pl-9 min-w-52`} value={search} onChange={e => setSearch(e.target.value)} placeholder={bn ? 'খুঁজুন...' : 'Search entries...'} /></div>
            <select className={input} value={kindFilter} onChange={e => setKindFilter(e.target.value as typeof kindFilter)}><option value="all">{bn ? 'সব রেকর্ড' : 'All entries'}</option><option value="income">{bn ? 'শুধু আয়' : 'Income only'}</option><option value="expense">{bn ? 'শুধু ব্যয়' : 'Expenses only'}</option></select>
            <select className={input} value={monthFilter} onChange={e => setMonthFilter(e.target.value)}><option value="all">{bn ? 'সব মাস' : 'All months'}</option>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead><tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500"><th className="py-3 px-2">{bn ? 'তারিখ' : 'Date'}</th><th className="py-3 px-2">{bn ? 'ধরন' : 'Type'}</th><th className="py-3 px-2">{bn ? 'খাত' : 'Category'}</th><th className="py-3 px-2">{bn ? 'মক্কেল / পক্ষ' : 'Party'}</th><th className="py-3 px-2">{bn ? 'মাধ্যম' : 'Mode'}</th><th className="py-3 px-2 text-right">{bn ? 'পরিমাণ' : 'Amount'}</th><th className="py-3 px-2 text-center">{bn ? 'মুছুন' : 'Delete'}</th></tr></thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-2 whitespace-nowrap">{item.date}</td>
                  <td className="py-3 px-2"><span className={`px-2 py-1 rounded-lg font-bold ${item.kind === 'income' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>{item.kind === 'income' ? (bn ? 'আয়' : 'Income') : (bn ? 'ব্যয়' : 'Expense')}</span></td>
                  <td className="py-3 px-2 font-semibold text-slate-800 dark:text-slate-100">{item.category}<div className="text-[10px] text-slate-400 font-normal">{item.reference || item.notes || ''}</div></td>
                  <td className="py-3 px-2">{item.partyName || '—'}</td><td className="py-3 px-2">{item.paymentMode}</td>
                  <td className={`py-3 px-2 text-right font-extrabold tabular-nums ${item.kind === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>{item.kind === 'income' ? '+' : '−'}{money(item.amount)}</td>
                  <td className="py-3 px-2 text-center"><button onClick={() => { if (window.confirm(bn ? 'এই হিসাবটি মুছে ফেলবেন?' : 'Delete this account entry?')) deleteFinancialEntry(item.id); }} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" title={bn ? 'মুছুন' : 'Delete'}><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-slate-400">{bn ? 'কোনো হিসাব পাওয়া যায়নি' : 'No account entries found'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[10px] text-slate-400">{bn ? `মোট ${filtered.length}টি রেকর্ড` : `${filtered.length} record(s)`}</div>
      </section>
    </div>
  );
};

export default OfficeAccounts;
