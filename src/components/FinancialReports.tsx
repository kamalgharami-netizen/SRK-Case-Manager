import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, TrendingUp, TrendingDown, Wallet, Users, FileSpreadsheet } from 'lucide-react';

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
const currentMonth = () => new Date().toISOString().slice(0, 7);
const csvCell = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"';

export const FinancialReports: React.FC = () => {
  const { activeCompany, language } = useApp();
  const [period, setPeriod] = useState(currentMonth());
  const [kind, setKind] = useState<'all' | 'income' | 'expense'>('all');
  const company = activeCompany;
  const entries = company?.financialEntries || [];
  const ledger = company?.partyLedgerEntries || [];
  const accounts = company?.officeAccounts || [];
  const accountTransactions = company?.accountTransactions || [];
  const bn = language === 'bn';

  const filtered = useMemo(() => entries.filter(item =>
    (period === 'all' || item.date?.startsWith(period)) &&
    (kind === 'all' || item.kind === kind)
  ), [entries, period, kind]);

  const income = filtered.filter(x => x.kind === 'income').reduce((sum, x) => sum + Number(x.amount || 0), 0);
  const expense = filtered.filter(x => x.kind === 'expense').reduce((sum, x) => sum + Number(x.amount || 0), 0);
  const net = income - expense;
  const totalCharges = ledger.filter(x => x.type === 'charge').reduce((sum, x) => sum + Number(x.amount || 0), 0);
  const totalReceipts = ledger.filter(x => x.type === 'receipt').reduce((sum, x) => sum + Number(x.amount || 0), 0);
  const outstanding = totalCharges - totalReceipts;

  const accountBalances = accounts.map(account => {
    const balance = (Number(account.openingBalance) || 0) + accountTransactions
      .filter(tx => tx.accountId === account.id)
      .reduce((sum, tx) => sum + ((tx.kind === 'deposit' || tx.kind === 'transfer-in') ? Number(tx.amount) : -Number(tx.amount)), 0);
    return { ...account, balance };
  });
  const totalAccountBalance = accountBalances.reduce((sum, account) => sum + account.balance, 0);

  const categories = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    filtered.forEach(item => {
      const name = item.category || (bn ? 'অন্যান্য' : 'Other');
      if (!map[name]) map[name] = { income: 0, expense: 0 };
      map[name][item.kind] += Number(item.amount || 0);
    });
    return Object.entries(map).sort((a, b) => (b[1].income + b[1].expense) - (a[1].income + a[1].expense));
  }, [filtered, bn]);

  const monthly = useMemo(() => {
    const year = period === 'all' ? new Date().getFullYear() : Number(period.slice(0, 4));
    return Array.from({ length: 12 }, (_, index) => {
      const key = year + '-' + String(index + 1).padStart(2, '0');
      const rows = entries.filter(x => x.date?.startsWith(key));
      return { label: new Date(year, index, 1).toLocaleString(bn ? 'bn-IN' : 'en-IN', { month: 'short' }), income: rows.filter(x => x.kind === 'income').reduce((s, x) => s + Number(x.amount || 0), 0), expense: rows.filter(x => x.kind === 'expense').reduce((s, x) => s + Number(x.amount || 0), 0) };
    });
  }, [entries, period, bn]);
  const maxMonthly = Math.max(1, ...monthly.map(x => Math.max(x.income, x.expense)));

  const exportCsv = () => {
    const rows = [
      ['Date', 'Type', 'Category', 'Party', 'Payment Mode', 'Amount', 'Reference', 'Notes'],
      ...filtered.map(x => [x.date, x.kind, x.category, x.partyName || '', x.paymentMode, x.amount, x.reference || '', x.notes || ''])
    ];
    const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SRK-Financial-Report-' + (period === 'all' ? 'all-periods' : period) + '.csv';
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{bn ? 'আর্থিক রিপোর্ট' : 'Financial Reports'}</h1><p className="text-xs text-slate-500 mt-1">{bn ? 'আয়-ব্যয়, মক্কেলের পাওনা এবং নগদ/ব্যাংক হিসাবের সারাংশ' : 'Income, expenses, client balances and cash/bank overview'}</p></div>
        <div className="flex flex-wrap gap-2">
          <select value={period} onChange={e=>setPeriod(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"><option value="all">{bn ? 'সমস্ত সময়' : 'All periods'}</option><option value={currentMonth()}>{bn ? 'এই মাস' : 'This month'}</option><option value={String(new Date().getFullYear()) + '-01'} disabled>{bn ? 'বছর নির্বাচন করতে মাস বাছুন' : 'Select a month for period filter'}</option>{Array.from({length:36},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-i);const v=d.toISOString().slice(0,7);return <option key={v} value={v}>{d.toLocaleString(bn?'bn-IN':'en-IN',{month:'long',year:'numeric'})}</option>})}</select>
          <button onClick={exportCsv} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-2"><Download size={14}/>{bn ? 'CSV ডাউনলোড' : 'Export CSV'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2 text-xs text-slate-500"><TrendingUp size={15} className="text-emerald-600"/>{bn?'মোট আয়':'Total Income'}</div><div className="text-xl font-extrabold mt-2 text-emerald-700">{money(income)}</div></div>
        <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2 text-xs text-slate-500"><TrendingDown size={15} className="text-rose-600"/>{bn?'মোট ব্যয়':'Total Expenses'}</div><div className="text-xl font-extrabold mt-2 text-rose-700">{money(expense)}</div></div>
        <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><div className="text-xs text-slate-500">{bn?'নিট আয় / উদ্বৃত্ত':'Net Income / Surplus'}</div><div className={'text-xl font-extrabold mt-2 '+(net>=0?'text-emerald-700':'text-rose-700')}>{money(net)}</div></div>
        <div className="rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2 text-xs text-slate-500"><Wallet size={15}/>{bn?'বর্তমান Cash/Bank Balance':'Current Cash/Bank Balance'}</div><div className="text-xl font-extrabold mt-2">{money(totalAccountBalance)}</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between"><h2 className="font-bold text-sm">{bn?'মক্কেলের হিসাব':'Client Ledger Summary'}</h2><Users size={17} className="text-amber-600"/></div>
          <div className="grid grid-cols-3 gap-2"><div><div className="text-[10px] text-slate-500">{bn?'মোট চার্জ':'Charges'}</div><div className="font-bold text-sm">{money(totalCharges)}</div></div><div><div className="text-[10px] text-slate-500">{bn?'মোট আদায়':'Receipts'}</div><div className="font-bold text-sm">{money(totalReceipts)}</div></div><div><div className="text-[10px] text-slate-500">{bn?'পাওনা (+)/অগ্রিম (-)':'Due (+)/Advance (-)'}</div><div className={'font-bold text-sm '+(outstanding>0?'text-rose-600':'text-emerald-600')}>{money(outstanding)}</div></div></div>
          <p className="text-[10px] text-slate-500">{bn?'মক্কেলের হিসাবের সম্পূর্ণ সময়ের মোট; নির্বাচিত মাসের ফিল্টার এতে প্রযোজ্য নয়।':'Lifetime client ledger totals; the selected month filter does not apply here.'}</p>
        </section>
        <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between"><h2 className="font-bold text-sm">{bn?'অ্যাকাউন্ট ব্যালেন্স':'Account Balances'}</h2><Wallet size={17} className="text-blue-600"/></div>
          {accountBalances.length===0 ? <p className="text-xs text-slate-500">{bn?'এখনও কোনো Cash/Bank অ্যাকাউন্ট তৈরি হয়নি।':'No cash/bank accounts created yet.'}</p> : accountBalances.map(a=><div key={a.id} className="flex justify-between items-center text-xs border-b last:border-0 border-slate-100 dark:border-slate-800 pb-2"><span>{a.name} <span className="text-slate-400">({a.type})</span></span><strong>{money(a.balance)}</strong></div>)}
        </section>
      </div>

      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2"><h2 className="font-bold text-sm">{bn?'মাসভিত্তিক আয়-ব্যয়':'Monthly Income & Expenses'}</h2><span className="text-[10px] text-slate-500">{period==='all'?new Date().getFullYear():period.slice(0,4)}</span></div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-36">{monthly.map((m,i)=><div key={i} className="h-full flex flex-col justify-end items-center gap-1 min-w-0"><div className="w-full flex items-end justify-center gap-0.5 h-28"><div title={'Income '+money(m.income)} className="w-1/2 max-w-3 rounded-t bg-emerald-500" style={{height:Math.max(m.income?3:0,m.income/maxMonthly*100)+'%'}}/><div title={'Expense '+money(m.expense)} className="w-1/2 max-w-3 rounded-t bg-rose-400" style={{height:Math.max(m.expense?3:0,m.expense/maxMonthly*100)+'%'}}/></div><span className="text-[9px] text-slate-500">{m.label}</span></div>)}</div>
        <div className="flex gap-4 text-[10px] text-slate-500"><span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-emerald-500"/>Income</span><span className="flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-rose-400"/>Expense</span></div>
      </section>

      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 dark:border-slate-800"><h2 className="font-bold text-sm">{bn?'খাতভিত্তিক হিসাব':'Category Breakdown'}</h2><select value={kind} onChange={e=>setKind(e.target.value as 'all'|'income'|'expense')} className="px-3 py-2 rounded-lg border bg-transparent text-xs"><option value="all">{bn?'আয় ও ব্যয়':'Income & Expense'}</option><option value="income">{bn?'শুধু আয়':'Income only'}</option><option value="expense">{bn?'শুধু ব্যয়':'Expense only'}</option></select></div>
        {categories.length===0 ? <div className="p-8 text-center text-xs text-slate-500">{bn?'এই সময়সীমায় কোনো আয়-ব্যয়ের তথ্য নেই।':'No income or expense entries for this period.'}</div> : <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800/70"><tr><th className="p-3 text-left">Category</th><th className="p-3 text-right">Income</th><th className="p-3 text-right">Expense</th><th className="p-3 text-right">Net</th></tr></thead><tbody>{categories.map(([name,values])=><tr key={name} className="border-t border-slate-100 dark:border-slate-800"><td className="p-3">{name}</td><td className="p-3 text-right text-emerald-700">{money(values.income)}</td><td className="p-3 text-right text-rose-700">{money(values.expense)}</td><td className="p-3 text-right font-bold">{money(values.income-values.expense)}</td></tr>)}</tbody></table></div>}
      </section>

      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2"><FileSpreadsheet size={16}/><h2 className="font-bold text-sm">{bn?'লেনদেনের বিস্তারিত':'Detailed Entries'}</h2><span className="text-[10px] text-slate-500">({filtered.length})</span></div>
        {filtered.length===0 ? <div className="p-8 text-center text-xs text-slate-500">No entries found.</div> : <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800/70"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Category</th><th className="p-3 text-left">Party</th><th className="p-3 text-left">Mode</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{filtered.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(item=><tr key={item.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-3 whitespace-nowrap">{item.date}</td><td className="p-3">{item.kind}</td><td className="p-3">{item.category}</td><td className="p-3">{item.partyName||'—'}</td><td className="p-3">{item.paymentMode}</td><td className="p-3 text-right font-bold whitespace-nowrap">{money(item.amount)}</td></tr>)}</tbody></table></div>}
      </section>
      <p className="text-[10px] text-slate-500">{bn?'রিপোর্টগুলি সংরক্ষিত আয়-ব্যয়, মক্কেল লেজার এবং Cash/Bank রেকর্ড থেকে তৈরি। কোনো Billing, Invoice বা GST হিসাব তৈরি করা হয় না।':'Reports are calculated from saved office entries, client ledger and cash/bank records. No billing, invoice or GST calculation is created.'}</p>
    </div>
  );
};
